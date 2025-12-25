import { useEffect, useState } from "react";
import { Smile } from "lucide-react";
import codeprojektDashboardBackend from "../../api/adapters/codeprojektDashboardBackend";

export default function SmileCoins() {
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
        setError("Failed to load smile coins");
        setSmileCoins(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSmileCoins();

    // Refresh every 5 minutes
    const interval = setInterval(fetchSmileCoins, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full">
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <Smile className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Smile Coins
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your total smile coins balance
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin">
              <div className="w-8 h-8 border-4 border-yellow-200 dark:border-yellow-900 border-t-yellow-600 dark:border-t-yellow-400 rounded-full"></div>
            </div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : smileCoins !== null ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Total Balance
              </p>
              <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                {smileCoins.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Status
              </p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                Active
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Last updated: {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            About Smile Coins
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Smile Coins are a digital currency used for various transactions and rewards on our platform.
            Use your coins to unlock exclusive features and rewards.
          </p>
        </div>
      </div>
    </div>
  );
}
