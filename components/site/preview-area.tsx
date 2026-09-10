"use client";

import { ArrowRight, Star, Github, SearchX } from "lucide-react";
import type { ReactNode } from "react";
import { PreviewPlayer } from "@/components/preview-player";
import { DownloadButton } from "@/components/download-button";
import type { RepoStarsInfo } from "@/lib/github";
import Video from "@/components/icons/video";
import Loader from "@/components/icons/loader";

type ViewState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "not-found"; repo: string }
  | { type: "result"; info: RepoStarsInfo };

export function PreviewArea({ view }: { view: ViewState }) {
  return (
    <section
      className="mt-6 flex w-full flex-1 flex-col items-center mb-12 justify-start sm:mt-8"
      aria-live="polite"
    >
      {view.type === "idle" && <IdleState />}
      {view.type === "loading" && <LoadingState />}
      {view.type === "not-found" && <NotFoundState repo={view.repo} />}
      {view.type === "result" && <ResultState info={view.info} />}
    </section>
  );
}

function PreviewFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mb-8 w-full max-w-5xl animate-slide-up">
  <div
    className="
      relative aspect-video w-full overflow-hidden
      rounded-xl
      border border-zinc-200
      bg-[#faf7f0]
      bg-[radial-gradient(circle,rgba(113,113,122,0.16)_1px,transparent_1px)]
      bg-[length:20px_20px]
      shadow-input
      sm:rounded-2xl
      dark:border-zinc-800
      dark:bg-[#111113]
      dark:bg-[radial-gradient(circle,rgba(161,161,170,0.10)_1px,transparent_1px)]
    "
  >
    {children}
  </div>
</div>
  );
}

function IdleState() {
  return (
    <PreviewFrame>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center sm:gap-2">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-zinc-300/30 blur-2xl dark:bg-zinc-700/30" />
          <Video />
        </div>
        <p className="text-xs font-medium text-zinc-600 sm:text-sm dark:text-zinc-500">
          Your star animation will appear here
        </p>
      </div>
    </PreviewFrame>
  );
}

function LoadingState() {
  return (
    <PreviewFrame>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <Loader />
        <p className="text-xs font-medium text-zinc-500 sm:text-sm dark:text-zinc-400">
          Fetching repository data…
        </p>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-300 [animation-delay:150ms] dark:bg-zinc-700" />
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-300 [animation-delay:300ms] dark:bg-zinc-700" />
        </div>
      </div>
    </PreviewFrame>
  );
}

function NotFoundState({ repo }: { repo: string }) {
  return (
    <PreviewFrame>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 sm:h-14 sm:w-14 dark:bg-zinc-800">
          <SearchX
            className="h-5 w-5 text-zinc-400 sm:h-6 sm:w-6"
            strokeWidth={1.5}
          />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-zinc-700 sm:text-base dark:text-zinc-300">
            Repository not found
          </p>
          <p className="text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">
            We couldn&apos;t find &ldquo;{repo}&rdquo;. Check the name and try
            again.
          </p>
        </div>
      </div>
    </PreviewFrame>
  );
}

function ResultState({ info }: { info: RepoStarsInfo }) {
  return (
    <div className="flex w-full max-w-5xl animate-slide-up flex-col items-center gap-4 px-0 sm:gap-6">
      <div className="w-full overflow-hidden rounded-xl border border-zinc-200 shadow-xl shadow-zinc-300/20 sm:rounded-2xl dark:border-zinc-800 dark:shadow-black/40">
        <PreviewPlayer info={info} className="relative" />
      </div>

      <div className="flex flex-col items-center gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:gap-4 sm:text-sm">
          <div className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
            <Star
              className="h-4 w-4 fill-zinc-900 text-zinc-900 dark:fill-white dark:text-white"
              strokeWidth={1.5}
            />
            {info.stars.toLocaleString()} stars
          </div>
          <span className="hidden text-zinc-300 sm:inline dark:text-zinc-700">
            |
          </span>
          <a
            href={`https://github.com/${info.user}/${info.repository}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <Github className="h-4 w-4" />
            {info.user}/{info.repository}
            <ArrowRight className="h-3 w-3 -rotate-45" />
          </a>
        </div>

        <DownloadButton info={info} />
      </div>
    </div>
  );
}
