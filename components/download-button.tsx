'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { renderVideo, downloadBlob, getFileExtension } from '@/lib/render';
import { defaultConfig } from '@/lib/animation';
import type { RepoStarsInfo } from '@/lib/github';
import Loader  from '@/components/icons/loader';
// import { ShareButtons } from '@/components/site/share-buttons';

interface DownloadButtonProps {
  info: RepoStarsInfo;
  disabled?: boolean;
}

type State =
  | { type: 'idle' }
  | { type: 'rendering'; progress: number }
  | { type: 'done' }
  | { type: 'error'; message: string };

export function DownloadButton({ info, disabled }: DownloadButtonProps) {
  const [state, setState] = useState<State>({ type: 'idle' });

  async function handleDownload() {
    if (state.type === 'rendering') return;

    setState({ type: 'rendering', progress: 0 });

    try {
      const blob = await renderVideo(info, {
        config: defaultConfig,
        onProgress: (progress) => {
          setState({ type: 'rendering', progress });
        },
      });

      const ext = getFileExtension(blob.type);
      const filename = `${info.user}-${info.repository}-stars.${ext}`;

      downloadBlob(blob, filename);
      setState({ type: 'done' });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to render video';

      setState({ type: 'error', message });
    }
  }

  // Rendering state
  if (state.type === 'rendering') {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <Loader />
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Creating your video
            </span>

            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Rendering… {Math.round(state.progress * 100)}%
            </span>
          </div>
        </div>

        <div className="h-1.5 w-56 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800 sm:w-64">
          <div
            className="h-full rounded-full bg-zinc-900 transition-all duration-150 dark:bg-zinc-100"
            style={{
              width: `${state.progress * 100}%`,
            }}
          />
        </div>

        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Keep this tab active while rendering
        </p>
      </div>
    );
  }

  // Completed state
  if (state.type === 'done') {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <Button
            onClick={handleDownload}
            variant="outline"
            size="lg"
            className="h-11 rounded-xl border-zinc-200 bg-white px-5 font-medium shadow-sm transition-all hover:bg-zinc-50 hover:shadow dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            <RefreshCw className="h-4 w-4" />
            Render again
          </Button>

          <span className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <CheckCircle2 className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
            Video downloaded!
          </span>
        </div>

        {/* Share option temporarily disabled */}
        {/*
        <ShareButtons
          repo={`${info.user}/${info.repository}`}
          stars={info.stars}
        />
        */}
      </div>
    );
  }

  // Error state
  if (state.type === 'error') {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex max-w-md items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{state.message}</span>
        </div>

        <Button
          onClick={handleDownload}
          size="lg"
          className="h-11 rounded-xl bg-zinc-900 px-5 font-medium shadow-sm transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          <Download className="h-4 w-4" />
          Try again
        </Button>
      </div>
    );
  }

  // Default state
  return (
    <Button
      onClick={handleDownload}
      disabled={disabled}
      size="lg"
      className="h-12 rounded-xl bg-zinc-900 px-6 text-base font-medium shadow-lg shadow-zinc-900/10 transition-all hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-xl dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-white/5 dark:hover:bg-white"
    >
      <Download className="h-5 w-5" />
      Download video
    </Button>
  );
}
