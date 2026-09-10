import { Cover } from "../ui/cover";

export function Hero() {
  return (
    <section className="flex flex-col items-center pt-8 text-center animate-slide-up sm:pt-14">
      <h1
        className="
          max-w-4xl
          text-balance
          text-3xl
          font-semibold
          leading-[1.08]
          text-zinc-950
          sm:text-5xl
          lg:text-6xl
          dark:text-white
          tracking-tighter
        "
      >
        Animate your{' '}
        <span>GitHub stars.</span>
        <br className="hidden sm:block" />
        {' '} <Cover> Boost your audience.</Cover>
      </h1>

      <p
        className="
          mt-5
          max-w-md
          text-sm
          leading-6
          text-zinc-500
          sm:mt-6
          sm:text-base
          dark:text-zinc-400
        "
      >
        Turn your repository stars into a shareable video.
      </p>
    </section>
  );
}