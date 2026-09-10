import { Star } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 shadow-sm ring-1 ring-zinc-800/50 dark:bg-zinc-100 dark:ring-zinc-200/50">
        <Star className="h-5 w-5 fill-amber-400 text-amber-400" strokeWidth={1.5} />
      </div>
      <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
        StarReel
      </span>
    </div>
  );
}
