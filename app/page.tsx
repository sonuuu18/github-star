'use client';

import { useState } from 'react';
import { Navbar } from '@/components/site/navbar';
import { Hero } from '@/components/site/hero';
// import { Footer } from '@/components/site/footer';
import { PreviewArea } from '@/components/site/preview-area';
import { RepoForm } from '@/components/repo-form';
import type { RepoStarsInfo } from '@/lib/github';

type ViewState =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'not-found'; repo: string }
  | { type: 'result'; info: RepoStarsInfo };

export default function Home() {
  const [view, setView] = useState<ViewState>({ type: 'idle' });

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-white dark:bg-zinc-950">

      <div className="relative z-10 flex flex-1 flex-col">
        <Navbar />

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8">
          <Hero />

          <section className="mt-6 flex flex-col items-center  sm:mt-8">
            <RepoForm
              onLoading={() => setView({ type: 'loading' })}
              onResult={(info, repo) => {
                if (info) {
                  setView({ type: 'result', info });
                } else {
                  setView({ type: 'not-found', repo });
                }
              }}
            />
          </section>

          <PreviewArea view={view}/>
        </main>

        {/* <Footer /> */}
      </div>
    </div>
  );
}
