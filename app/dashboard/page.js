import VerticalOB from '@/components/VerticalOB';
import PriceLevelGraph from '@/components/PriceLevelGraph';
import CumulativeGraph from '@/components/CumulativeGraph';

export default function Dashboard() {
  return (
    <div className="flex h-screen p-4 gap-4">
      {/* Left side - Vertical OrderBook */}
      <div className="w-1/2 bg-white rounded-lg shadow-lg p-4">
        <VerticalOB />
      </div>

      {/* Right side - Graphs and Order Management */}
      <div className="w-1/2 flex flex-col gap-4">
        {/* Price Level Graph */}
        <div className="h-1/3 bg-white rounded-lg shadow-lg p-4">
          <PriceLevelGraph />
        </div>

        {/* Cumulative Graph */}
        <div className="h-1/3 bg-white rounded-lg shadow-lg p-4">
          <CumulativeGraph />
        </div>

        {/* Order Management (to be implemented later) */}
        <div className="h-1/3 bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Order Management</h2>
          <p className="text-gray-500">Order management interface coming soon...</p>
        </div>
      </div>
    </div>
  );
}