import Image from "next/image";
import { Sparkles } from "lucide-react";
import { SearchBar } from "./SearchBar";

const HERO_IMAGE = "/hero-bg.png";

export function Hero() {
  return (
    <section className="relative bg-white pb-8">
      <div className="relative overflow-hidden min-h-[420px] pb-16 pt-6 sm:h-[500px] sm:pb-20 sm:pt-10 lg:h-[600px]">
        <Image
          src={HERO_IMAGE}
          alt="Premium stay with mountain views"
          fill
          priority
          className="object-cover blur-[2px] scale-[1.02]"
          sizes="100vw"
        />
        {/* Lighter, premium gradient overlay */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent" />
        
        <div className="relative flex h-full items-center justify-center text-center">
          <div className="container-page pb-14 pt-6 sm:pb-20 sm:pt-10">
            <div className="mb-4 sm:mb-6 inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-1.5 sm:px-5 sm:py-2 font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white backdrop-blur-md shadow-sm text-[11px] sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Stays Made Simple
            </div>
            <h1 className="mx-auto max-w-4xl text-3xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl text-shadow-sm">
              Find your perfect stay in India.
            </h1>
            <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-base font-medium text-white/95 text-shadow-sm sm:text-xl">
              Discover verified hotels, villas, apartments and homestays for every kind of trip.
            </p>
          </div>
        </div>
      </div>
      
      <div className="relative z-20 -mt-6 px-4 sm:-mt-28 lg:-mt-32">
        <div className="mx-auto w-full">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}
