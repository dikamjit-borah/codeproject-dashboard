import { useState } from "react";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
/* import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart"; */

export default function Analytics() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  // Generate list of months
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2024, i).toLocaleString('default', { month: 'long' })
  }));

  // Generate list of years (current year and 5 previous years)
  const years = Array.from({ length: 6 }, (_, i) => currentDate.getFullYear() - i);

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 flex gap-3">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="px-4 py-2 pr-10 rounded-lg border border-gray-300 bg-white text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
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
          className="px-4 py-2 pr-10 rounded-lg border border-gray-300 bg-white text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className="col-span-12 space-y-6">
        <EcommerceMetrics month={selectedMonth} year={selectedYear} />
        {/* <MonthlySalesChart /> */}
      </div>

      <div className="col-span-12">{/* <StatisticsChart /> */}</div>
    </div>
  );
}
