import { useEffect, useState } from "react";
import { Smile } from "lucide-react";
import codeprojektDashboardBackend from "../../api/adapters/codeprojektDashboardBackend";

export default function SmileCoinsDisplay() {
  const [smileCoins, setSmileCoins] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSmileCoins = async () => {
      try {
        setIsLoading(true);
        const coins = await codeprojektDashboardBackend.getSmileCoins();
        setSmileCoins(coins);
        setError(null);
      } catch (err) {
        console.error("Error fetching smile coins:", err);
        setError("Failed to load");
        setSmileCoins(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSmileCoins();

    // Optional: Refresh every 5 minutes
    const interval = setInterval(fetchSmileCoins, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
        <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse"></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
      </div>
    );
  }

  if (error || smileCoins === null) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
        <span className="text-sm text-gray-600 dark:text-gray-400">{error || "—"}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800">
      <Smile className="w-5 h-5 text-yellow-500" />
      <div className="flex flex-col">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Smile Coins</span>
        <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
          {smileCoins.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
    </div>
  );
}
