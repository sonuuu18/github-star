import { Github, Star } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <Star className="h-4 w-4 fill-zinc-900 text-zinc-900 dark:fill-white dark:text-white" strokeWidth={1.5} />
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">StarReel</span>
        </div>
        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
          A free tool for generating animated videos of your GitHub repository stars.
          Not affiliated with GitHub.
        </p>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/60 dark:hover:text-white"
        >
          <Star className="h-3.5 w-3.5" strokeWidth={1.5} />
          Star this project on GitHub
          <Github className="h-3.5 w-3.5" />
        </a>
        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          Made with care for the open source community
        </p>
      </div>
    </footer>
  );
}
