export interface Contributor {
  login: string;
  avatarUrl: string;
}

export interface RepoStarsInfo {
  user: string;
  repository: string;
  userAvatarUrl: string;
  stars: number;
  contributors: Contributor[];
  description: string | null;
}

export function parseRepoInput(input: string): string | null {
  const cleaned = input
    .trim()
    .replace(/^(https?:\/\/)?(www\.)?github\.com\//, '')
    .replace(/\/$/, '')
    .replace(/\.git$/, '');
  const parts = cleaned.split('/');
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0]}/${parts[1]}`;
  }
  return null;
}

export async function fetchRepoStarsInfo(
  repository: string,
): Promise<RepoStarsInfo | null> {
  const [user, repo] = repository.split('/');
  if (!user || !repo) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const apiUrl = `${supabaseUrl}/functions/v1/github-proxy/api/${user}/${repo}`;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'GitHub API rate limit reached.');
      }
      return null;
    }

    const data = await res.json();
    return {
      user: data.user,
      repository: data.repository,
      userAvatarUrl: data.userAvatarUrl,
      stars: data.stars,
      contributors: data.contributors ?? [],
      description: data.description ?? null,
    };
  } catch (err) {
    if (err instanceof Error && err.message.includes('rate limit')) throw err;
    return null;
  }
}
