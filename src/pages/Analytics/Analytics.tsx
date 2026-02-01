import { useState } from "react";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
/* import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart"; */

export default function Analytics() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Generate list of months
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2024, i).toLocaleString('default', { month: 'long' })
  }));

  // Generate list of years (current year and 5 previous years)
  const years = Array.from({ length: 6 }, (_, i) => currentDate.getFullYear() - i);

  /* const isCurrentMonthSelected = 
    selectedMonth === currentDate.getMonth() + 1 && 
    selectedYear === currentDate.getFullYear();

  const selectedMonthName = months.find(m => m.value === selectedMonth)?.label || ''; */

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Header Section */}
      <div className="col-span-12">
        <div className="rounded-2xl border border-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 dark:border-gray-700 p-8 md:p-10 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Monthly Analytics
              </h1>
            </div>
            {/* <p className="text-gray-700 dark:text-gray-300 text-lg flex items-center gap-2 mt-3">
              {isCurrentMonthSelected ? (
                <>
                  <span className="font-semibold text-green-600 dark:text-green-400">Current Month:</span>
                  <span className="font-medium">{selectedMonthName} {selectedYear}</span>
                </>
              ) : (
                <>
                  <span>Viewing:</span>
                  <span className="font-medium">{selectedMonthName} {selectedYear}</span>
                </>
              )}
            </p> */}
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="col-span-12">
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Select Period:</label>
            <div className="flex gap-3 flex-wrap">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-4 py-2.5 pr-10 rounded-lg border border-gray-300 bg-white text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer font-medium transition"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2.5 pr-10 rounded-lg border border-gray-300 bg-white text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer font-medium transition"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="col-span-12">
        <EcommerceMetrics month={selectedMonth} year={selectedYear} />
        {/* <MonthlySalesChart /> */}
      </div>

      <div className="col-span-12">{/* <StatisticsChart /> */}</div>
    </div>
  );
}
