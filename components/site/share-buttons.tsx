'use client';

import { useState } from 'react';
import { Check, Share2, Link2 } from 'lucide-react';

interface ShareButtonsProps {
  repo: string;
  stars: number;
}

export function ShareButtons({ repo, stars }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareText = `Check out ${repo} with ${stars.toLocaleString()} stars on GitHub! Made a video with StarReel`;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://starreel.app';

  const shareLinks = [
    {
      label: 'Twitter',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.86.99 4.42 4.42 0 0 0-.205 1.393v1.613h3.715l-.495 3.667h-3.22v7.978c5.121-.585 8.757-5.058 8.757-10.281C22.602 6.747 17.855 2 12.002 2 6.148 2 1.402 6.747 1.402 12.6c0 5.223 3.636 9.696 8.699 10.281z" />
        </svg>
      ),
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
        </svg>
      ),
    },
    {
      label: 'Reddit',
      href: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-6.627-5.373-12-12-12zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.603-.604a.682.682 0 0 0-.212.477l.015 2.603c1.493.073 2.851.598 3.852 1.493a1.25 1.25 0 0 1 2.925.521 1.25 1.25 0 0 1-1.247 1.254c-.034 0-.068-.001-.101-.004a2.67 2.67 0 0 1 .067.583c0 2.707-2.961 4.897-6.617 4.897-3.655 0-6.616-2.19-6.616-4.897 0-.193.016-.383.048-.57a1.25 1.25 0 0 1-1.312-1.246 1.25 1.25 0 0 1 2.493-.193c.982-.89 2.319-1.41 3.786-1.485l-.017-2.603a.682.682 0 0 0-.212-.477l-2.603.604a1.25 1.25 0 1 1-1.248-1.305 1.25 1.25 0 0 1 1.248 1.25c0 .02-.001.04-.003.06l2.474.573a.682.682 0 0 1 .212-.477.682.682 0 0 1 .477-.212l.015-.001.015.001a.682.682 0 0 1 .477.212l2.474-.573a1.25 1.25 0 0 1 1.248-1.25zm-6.918 5.589c-.707 0-1.28.573-1.28 1.28a1.28 1.28 0 0 0 2.56 0c0-.707-.573-1.28-1.28-1.28zm3.82 0c-.707 0-1.28.573-1.28 1.28a1.28 1.28 0 0 0 2.56 0c0-.707-.573-1.28-1.28-1.28zm-1.91 5.156a3.16 3.16 0 0 1-2.286-.93.321.321 0 0 1 .455-.455 2.52 2.52 0 0 0 1.831.76 2.52 2.52 0 0 0 1.831-.76.321.321 0 0 1 .455.455 3.16 3.16 0 0 1-2.286.93z" />
        </svg>
      ),
    },
  ];

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-1.5">
        <Share2 className="h-4 w-4 text-zinc-400" />
        <span className="text-xs font-medium text-zinc-400">Share</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {shareLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Share on ${link.label}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            {link.icon}
          </a>
        ))}
        <button
          onClick={copyLink}
          aria-label="Copy link"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
