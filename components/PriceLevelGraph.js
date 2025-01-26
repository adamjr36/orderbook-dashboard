'use client';

import useOrderBookStore from '@/lib/store/useOrderBookStore';


export default function PriceLevelGraph() {
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
  const maxSize = Math.max(
    ...askLevels.map(l => l.totalSize),
    ...bidLevels.map(l => l.totalSize)
  );

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Price Level Distribution</h2>
      <div className="flex-1 flex items-end gap-1">
        {/* Bid Levels */}
        {bidLevels.map((level) => (
          <div
            key={level.price}
            className="flex-1 flex flex-col items-center justify-end"
          >
            <div
              className="w-full bg-green-100 hover:bg-green-200 transition-colors"
              style={{ height: `${(level.totalSize / maxSize) * 100}%` }}
            />
            <span className="text-xs text-gray-600 mt-1 rotate-45 origin-left">
              {level.price.toFixed(2)}
            </span>
          </div>
        ))}

        {/* Ask Levels */}
        {askLevels.map((level) => (
          <div
            key={level.price}
            className="flex-1 flex flex-col items-center justify-end"
          >
            <div
              className="w-full bg-red-100 hover:bg-red-200 transition-colors"
              style={{ height: `${(level.totalSize / maxSize) * 100}%` }}
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