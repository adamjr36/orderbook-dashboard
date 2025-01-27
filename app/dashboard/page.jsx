import VerticalOB from '@/components/orderbook/VerticalOB';
import PriceLevelGraph from '@/components/orderbook/PriceLevelGraph';
import CumulativeGraph from '@/components/orderbook/CumulativeGraph';

export default function Dashboard() {
  return (
    <div className="flex h-screen p-4 gap-4 bg-[rgb(var(--background))]">
      {/* Left side - Vertical OrderBook */}
      <div className="w-1/2 glass-effect rounded-xl shadow-lg p-6 border border-[rgb(var(--primary-light))] hover:border-[rgb(var(--primary))] transition-all duration-300">
        <VerticalOB />
      </div>

      {/* Right side - Graphs and Order Management */}
      <div className="w-1/2 flex flex-col gap-4">
        {/* Price Level Graph */}
        <div className="h-1/3 glass-effect rounded-xl shadow-lg p-4 border border-[rgb(var(--secondary-light))] hover:border-[rgb(var(--secondary))] transition-all duration-300">
          <PriceLevelGraph />
        </div>

        {/* Cumulative Graph */}
        <div className="h-1/3 glass-effect rounded-xl shadow-lg p-4 border border-[rgb(var(--secondary-light))] hover:border-[rgb(var(--secondary))] transition-all duration-300">
          <CumulativeGraph />
        </div>

        {/* Order Management */}
        <div className="h-1/3 glass-effect rounded-xl shadow-lg p-4 border border-[rgb(var(--accent-light))] hover:border-[rgb(var(--accent))] transition-all duration-300">
          <h2 className="text-xl font-semibold mb-4 text-[rgb(var(--foreground))]">
            Order Management
          </h2>
          <p className="text-[rgb(var(--foreground))/60]">
            Order management interface coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}