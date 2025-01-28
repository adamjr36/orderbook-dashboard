'use client';

import useOrderBookStore from '@/lib/store/useOrderBookStore';
import VerticalOB from '@/components/orderbook/VerticalOB';
import PriceLevelGraph from '@/components/orderbook/PriceLevelGraph';
import CumulativeGraph from '@/components/orderbook/CumulativeGraph';
import OrderManagement from '@/components/orderbook/OrderManagement';
import TabHistory from '@/components/orderbook/TabHistory';

export default function Dashboard() {
  const isLoading = useOrderBookStore(state => state.isLoading);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[rgb(var(--background))]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[rgb(var(--foreground))] text-lg">Loading OrderBook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen p-3 gap-4 bg-[rgb(var(--background))] overflow-hidden">
      {/* Left side - Vertical OrderBook */}
      <div className="w-1/2 glass-effect rounded-xl shadow-lg p-3 border border-[rgb(var(--primary-light))] hover:border-[rgb(var(--primary))] transition-all duration-300 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <VerticalOB />
        </div>
        <div className="h-0.5 bg-[rgb(var(--primary-light))]"></div>
        <div className="h-1/4 mt-4 overflow-hidden">
          <TabHistory />
        </div>
      </div>

      {/* Right side - Graphs and Order Management */}
      <div className="w-1/2 flex flex-col gap-4">
        {/* Price Level Graph */}
        <div className="h-1/3 glass-effect rounded-xl shadow-lg p-4 pb-1 pt-2 border border-[rgb(var(--secondary-light))] hover:border-[rgb(var(--secondary))] transition-all duration-300">
          <PriceLevelGraph />
        </div>

        {/* Cumulative Graph */}
        <div className="h-1/3 glass-effect rounded-xl shadow-lg p-4 pb-1 pt-2 border border-[rgb(var(--secondary-light))] hover:border-[rgb(var(--secondary))] transition-all duration-300">
          <CumulativeGraph />
        </div>

        {/* Order Management */}
        <div className="h-1/3 glass-effect rounded-xl shadow-lg p-3 border border-[rgb(var(--accent-light))] hover:border-[rgb(var(--accent))] transition-all duration-300">
          <h2 className="text-xl font-semibold mb-1 text-blue-800">
            Order Management
          </h2>
          <OrderManagement />
        </div>
      </div>
    </div>
  );
}