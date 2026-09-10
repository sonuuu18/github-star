const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const fullPath = url.pathname;
    const match = fullPath.match(/github-proxy\/(.*)$/);
    const path = match ? match[1] : "";

    if (path.startsWith("api/")) {
      return await handleApiRequest(path);
    }

    if (path === "avatar" || path.startsWith("avatar?")) {
      return await handleAvatarRequest(url);
    }

    return new Response(JSON.stringify({ error: "Not found", path }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

function githubHeaders(): Record<string, string> {
  return {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Authorization": `Bearer ${GITHUB_TOKEN}`,
  };
}

async function handleApiRequest(path: string): Promise<Response> {
  const headers = githubHeaders();

  const repoPath = path.replace(/^api\//, "");
  const [user, repo] = repoPath.split("/");
  if (!user || !repo) {
    return new Response(JSON.stringify({ error: "Invalid repo path" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Fetch repo info
  const repoRes = await fetch(
    `https://api.github.com/repos/${user}/${repo}`,
    { headers },
  );
  if (!repoRes.ok) {
    if (repoRes.status === 404) {
      return new Response(JSON.stringify({ error: "Repository not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (repoRes.status === 403) {
      return new Response(
        JSON.stringify({ error: "GitHub API rate limit reached." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    return new Response(JSON.stringify({ error: `GitHub API error: ${repoRes.status}` }), {
      status: repoRes.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const repoData = await repoRes.json();
  const stars: number = repoData.stargazers_count ?? 0;
  const ownerAvatarUrl: string = repoData.owner?.avatar_url ?? "";
  const description: string | null = repoData.description ?? null;

  // Fetch owner avatar URL (higher res from user API)
  let userAvatarUrl = ownerAvatarUrl;
  try {
    const userRes = await fetch(
      `https://api.github.com/users/${user}`,
      { headers },
    );
    if (userRes.ok) {
      const userData = await userRes.json();
      if (userData.avatar_url) userAvatarUrl = userData.avatar_url;
    }
  } catch {
    // fallback to owner avatar
  }

  // Fetch contributors (stargazers API requires additional scopes the token doesn't have)
  let contributors: Array<{ login: string; avatar_url: string }> = [];
  try {
    contributors = await fetchContributors(user, repo, headers);
  } catch {
    // ignore
  }

  return new Response(
    JSON.stringify({
      user,
      repository: repo,
      userAvatarUrl,
      stars,
      contributors: contributors.map((c) => ({
        login: c.login,
        avatarUrl: c.avatar_url,
      })),
      description,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

async function fetchContributors(
  user: string,
  repo: string,
  headers: Record<string, string>,
): Promise<Array<{ login: string; avatar_url: string }>> {
  const res = await fetch(
    `https://api.github.com/repos/${user}/${repo}/contributors?per_page=100&page=1`,
    { headers },
  );
  if (!res.ok) return [];

  const data = await res.json();
  const all: Array<{ login: string; avatar_url: string }> = [];
  for (const c of data) {
    if (c.login && c.avatar_url) {
      all.push({ login: c.login, avatar_url: c.avatar_url });
    }
  }

  return all.slice(0, 50);
}

async function handleAvatarRequest(url: URL): Promise<Response> {
  const avatarUrl = url.searchParams.get("url");
  if (!avatarUrl) {
    return new Response(JSON.stringify({ error: "Missing url parameter" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let parsed: URL;
  try {
    parsed = new URL(avatarUrl);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid URL" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const allowedHosts = [
    "avatars.githubusercontent.com",
    "avatars0.githubusercontent.com",
    "avatars1.githubusercontent.com",
    "avatars2.githubusercontent.com",
    "avatars3.githubusercontent.com",
    "www.gravatar.com",
  ];

  if (!allowedHosts.includes(parsed.hostname)) {
    return new Response(JSON.stringify({ error: "Host not allowed" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const imgRes = await fetch(avatarUrl, {
    headers: { "User-Agent": "star-animation-tool" },
  });

  if (!imgRes.ok) {
    return new Response(JSON.stringify({ error: "Failed to fetch avatar" }), {
      status: imgRes.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const contentType = imgRes.headers.get("content-type") ?? "image/png";
  const imageBuffer = await imgRes.arrayBuffer();

  return new Response(imageBuffer, {
    headers: {
      ...corsHeaders,
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
