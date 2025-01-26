'use client';

import useOrderBookStore from '@/lib/store/useOrderBookStore';

export default function CumulativeGraph() {
  const orderBook = useOrderBookStore(state => state.orderBook);
  
  if (!orderBook) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No orderbook data available</p>
      </div>
    );
  }

  const askLevels = orderBook.getTopAskLevels(10);
  const bidLevels = orderBook.getTopBidLevels(10);

  // Calculate cumulative sizes
  let cumulativeBids = [];
  let cumulativeAsks = [];
  let runningBidSize = 0;
  let runningAskSize = 0;

  // Calculate cumulative bids (from highest to lowest price)
  bidLevels.reverse().forEach(level => {
    runningBidSize += level.totalSize;
    cumulativeBids.push({
      price: level.price,
      size: runningBidSize
    });
  });
  cumulativeBids.reverse();

  // Calculate cumulative asks (from lowest to highest price)
  askLevels.forEach(level => {
    runningAskSize += level.totalSize;
    cumulativeAsks.push({
      price: level.price,
      size: runningAskSize
    });
  });

  const maxSize = Math.max(
    cumulativeBids[0]?.size || 0,
    cumulativeAsks[cumulativeAsks.length - 1]?.size || 0
  );

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Cumulative Size Distribution</h2>
      <div className="flex-1 flex items-end gap-1">
        {/* Cumulative Bids */}
        {cumulativeBids.map((level) => (
          <div
            key={level.price}
            className="flex-1 flex flex-col items-center justify-end"
          >
            <div
              className="w-full bg-green-100 hover:bg-green-200 transition-colors"
              style={{ height: `${(level.size / maxSize) * 100}%` }}
            />
            <span className="text-xs text-gray-600 mt-1 rotate-45 origin-left">
              {level.price.toFixed(2)}
            </span>
          </div>
        ))}

        {/* Cumulative Asks */}
        {cumulativeAsks.map((level) => (
          <div
            key={level.price}
            className="flex-1 flex flex-col items-center justify-end"
          >
            <div
              className="w-full bg-red-100 hover:bg-red-200 transition-colors"
              style={{ height: `${(level.size / maxSize) * 100}%` }}
            />
            <span className="text-xs text-gray-600 mt-1 rotate-45 origin-left">
              {level.price.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}