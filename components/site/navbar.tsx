import  Github  from '@/components/icons/github';
import { Button } from '@/components/ui/button';
import {Logo}  from '@/components/icons/logo';
import { ThemeToggle } from './theme-toggle';

export function Navbar() {
  return (
    <header className="w-full animate-slide-up">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <div className='flex gap-2 justify-center items-center'>
        <Logo />
        <p className='text-lg pt-1.5 marker-link font-semibold marker-link--on-mat'>Gitstar</p>
        </div>

        <nav className="flex items-center justify-center gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="View source on GitHub">
            <a
              href="https://github.com/harssshh03/github-star"
              target="_blank"
              rel="noreferrer noopener"
            >
              <Github className="h-[1.1rem] w-[1.2rem]" />
            </a>
          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}