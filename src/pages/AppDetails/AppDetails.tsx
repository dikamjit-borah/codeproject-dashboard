import NoticeSection from "./NoticeSection";
import CarouselSection from "./CarouselSection";
import GameCardsSection from "./GameCardsSection";

export default function AppDetails() {

  return (
    <div className="space-y-8">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            App Details
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage notices, carousel slides, and game card images shown in the main app.
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          Live
        </span>
      </div>

      {/* ── Section 1: Notice ─────────────────────────────────────────── */}
      <NoticeSection />

      {/* ── Section 2: Carousel Images ────────────────────────────────── */}
      <CarouselSection />

      {/* ── Section 3: Game Pictures ──────────────────────────────────── */}
      <GameCardsSection />
    </div>
  );
}
