import { useEffect, useState } from "react";
import { Users, ShoppingCart, IndianRupee, Sparkles, PieChart, TrendingUp } from "lucide-react";
import Badge from "../ui/badge/Badge";
import { getMonthlyAnalytics } from "../../api/adapters/codeprojektDashboardBackend";
import type { MonthlyAnalyticsData } from "../../api/adapters/codeprojektDashboardBackend";

export default function EcommerceMetrics() {
  const [analyticsData, setAnalyticsData] = useState<MonthlyAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await getMonthlyAnalytics();
        setAnalyticsData(data);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch analytics";
        setError(errorMessage);
        console.error("Error fetching monthly analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const totalUsers = analyticsData?.monthlyAnalytics?.monthlyUserAnalytics?.totalUsers ?? 0;
  const totalSales = analyticsData?.monthlyAnalytics?.monthlyFinancials?.totalSales ?? 0;
  const totalSellPriceInINR = analyticsData?.monthlyAnalytics?.monthlyFinancials?.totalSellPriceInINR ?? 0;
  const totalCostPriceInSmileCoins = analyticsData?.monthlyAnalytics?.monthlyFinancials?.totalCostPriceInSmileCoins ?? 0;
  const totalCostPriceInBRR = analyticsData?.monthlyAnalytics?.monthlyFinancials?.totalCostPriceInBRR ?? 0;
  const totalCostPriceInINR = analyticsData?.monthlyAnalytics?.monthlyFinancials?.totalCostPriceInINR ?? 0;
  const netProfitOrLossInINR = analyticsData?.monthlyAnalytics?.monthlyFinancials?.netProfitOrLossInINR ?? 0;
  
  const isProfit = netProfitOrLossInINR >= 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6 lg:gap-8">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] md:p-7 lg:p-8 h-full flex flex-col">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <Users className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5 flex-1">
          <div className="min-w-0">
            <span className="text-sm text-gray-500 dark:text-gray-400 block truncate">
              Customers
            </span>
            <h4 className="mt-2 font-bold text-gray-800 dark:text-white/90 break-words text-base lg:text-lg">
              {loading ? "Loading..." : error ? "—" : totalUsers.toLocaleString()}
            </h4>
          </div>
          {/* <Badge color="success" className="ml-2 flex-shrink-0">
            <ArrowUpIcon />
            11.01%
          </Badge> */}
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] md:p-7 lg:p-8 h-full flex flex-col">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <ShoppingCart className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5 flex-1">
          <div className="min-w-0">
            <span className="text-sm text-gray-500 dark:text-gray-400 block truncate">
              Orders
            </span>
            <h4 className="mt-2 font-bold text-gray-800 dark:text-white/90 break-words text-base lg:text-lg">
              {loading ? "Loading..." : error ? "—" : totalSales.toLocaleString()}
            </h4>
          </div>

          {/* <Badge color="error" className="ml-2 flex-shrink-0">
            <ArrowDownIcon />
            9.05%
          </Badge> */}
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] md:p-7 lg:p-8 h-full flex flex-col">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <IndianRupee className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5 flex-1">
          <div className="min-w-0">
            <span className="text-sm text-gray-500 dark:text-gray-400 block truncate">
              Sell Price (INR)
            </span>
            <h4 className="mt-2 font-bold text-gray-800 dark:text-white/90 break-words text-base lg:text-lg">
              {loading ? "Loading..." : error ? "—" : `₹${totalSellPriceInINR.toLocaleString()}`}
            </h4>
          </div>
          {/* <Badge color="success" className="ml-2 flex-shrink-0">
            <ArrowUpIcon />
            8.5%
          </Badge> */}
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] md:p-7 lg:p-8 h-full flex flex-col">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <Sparkles className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5 flex-1">
          <div className="min-w-0">
            <span className="text-sm text-gray-500 dark:text-gray-400 block truncate">
              Cost Price (Smiles)
            </span>
            <h4 className="mt-2 font-bold text-gray-800 dark:text-white/90 break-words text-base lg:text-lg">
              {loading ? "Loading..." : error ? "—" : totalCostPriceInSmileCoins.toLocaleString()}
            </h4>
          </div>
          {/* <Badge color="success" className="ml-2 flex-shrink-0">
            <ArrowUpIcon />
            6.2%
          </Badge> */}
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] md:p-7 lg:p-8 h-full flex flex-col">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <PieChart className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5 flex-1">
          <div className="min-w-0">
            <span className="text-sm text-gray-500 dark:text-gray-400 block truncate">
              Cost Price (BRR)
            </span>
            <h4 className="mt-2 font-bold text-gray-800 dark:text-white/90 break-words text-base lg:text-lg">
              {loading ? "Loading..." : error ? "—" : totalCostPriceInBRR.toLocaleString()}
            </h4>
          </div>
          {/* <Badge color="success" className="ml-2 flex-shrink-0">
            <ArrowUpIcon />
            3.8%
          </Badge> */}
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] md:p-7 lg:p-8 h-full flex flex-col">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <IndianRupee className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5 flex-1">
          <div className="min-w-0">
            <span className="text-sm text-gray-500 dark:text-gray-400 block truncate">
              Cost Price (INR)
            </span>
            <h4 className="mt-2 font-bold text-gray-800 dark:text-white/90 break-words text-base lg:text-lg">
              {loading ? "Loading..." : error ? "—" : `₹${totalCostPriceInINR.toLocaleString()}`}
            </h4>
          </div>
          {/* <Badge color="error" className="ml-2 flex-shrink-0">
            <ArrowDownIcon />
            2.1%
          </Badge> */}
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Profit Box Start - Highlighted --> */}
      <div className={`rounded-2xl border-2 p-6 md:p-7 lg:p-8 h-full flex flex-col lg:col-span-1 sm:col-span-2 ${
        isProfit 
          ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-600'
          : 'border-red-500 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 dark:border-red-600'
      }`}>
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${
          isProfit 
            ? 'bg-green-100 dark:bg-green-900/40'
            : 'bg-red-100 dark:bg-red-900/40'
        }`}>
          <TrendingUp className={`size-6 ${
            isProfit 
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`} />
        </div>

        <div className="flex items-end justify-between mt-5 flex-1">
          <div className="min-w-0">
            <span className={`text-sm font-semibold block truncate ${
              isProfit 
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }`}>
              Net Profit/Loss (INR)
            </span>
            <h4 className={`mt-2 font-bold break-words text-base lg:text-lg ${
              isProfit 
                ? 'text-green-900 dark:text-green-100'
                : 'text-red-900 dark:text-red-100'
            }`}>
              {loading ? "Loading..." : error ? "—" : `₹${netProfitOrLossInINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Profit Box End --> */}
    </div>
  );
}
