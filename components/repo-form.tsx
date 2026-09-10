'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Loader from '@/components/icons/loader';
import Github from '@/components/icons/github';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { IconSearch, IconAlertCircle } from '@tabler/icons-react';
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ui/button-group';
import { parseRepoInput, type RepoStarsInfo, fetchRepoStarsInfo } from '@/lib/github';

interface RepoFormProps {
  onResult: (info: RepoStarsInfo | null, repo: string) => void;
  onLoading: () => void;
}

const EXAMPLE_REPOS = [
  'vercel/next.js',
  'facebook/react',
  'tailwindlabs/tailwindcss',
  'shadcn-ui/ui',
];

export function RepoForm({ onResult, onLoading }: RepoFormProps) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseRepoInput(value);
    if (!parsed) {
      setError('Please enter a valid repository (e.g. facebook/react)');
      return;
    }

    setLoading(true);
    setError(null);
    onLoading();

    try {
      const info = await fetchRepoStarsInfo(parsed);
      onResult(info, parsed);
      if (!info) {
        setError(`Repository "${parsed}" not found`);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      onResult(null, parsed);
    } finally {
      setLoading(false);
    }
  }

  return (
     <div className="w-full max-w-2xl animate-slide-up">
      <form onSubmit={handleSubmit} className="space-y-3">
        <ButtonGroup className="w-full">
          <div className="group relative flex-1">
            <Github className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2'/>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter GitHub repo (e.g. facebook/react)"
              className="h-12 pl-11 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
          <ButtonGroupSeparator />
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="h-12 rounded-l-none px-6 focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            {loading ? <Loader /> : (
              <>
                <IconSearch className="h-4 w-4" />
                <span className="ml-1.5 hidden sm:inline">Generate</span>
              </>
            )}
          </Button>
        </ButtonGroup>

        {error && (
          <Alert variant="destructive" className="rounded-xl">
            <IconAlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="text-zinc-400">Try:</span>
          {EXAMPLE_REPOS.map((repo) => (
            <Button
              key={repo}
              type="button"
              variant="outline"
              size="sm"
              className="h-7 rounded-full px-3 text-xs font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
              onClick={() => {
                setValue(repo);
                setError(null);
              }}
            >
              {repo}
            </Button>
          ))}
        </div>
      </form>
    </div>
  );
}
