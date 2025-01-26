'use client';

import useOrderBookStore from '@/lib/store/useOrderBookStore';

export default function VerticalOB() {
  const orderBook = useOrderBookStore(state => state.orderBook);
  
  if (!orderBook) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No orderbook data available</p>
      </div>
    );
  }

  const askLevels = orderBook.getTopAskLevels(10).reverse();
  const bidLevels = orderBook.getTopBidLevels(10);

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Order Book</h2>
      
      {/* Ask Levels */}
      <div className="flex-1 flex flex-col justify-end mb-2">
        {askLevels.map((level) => (
          <div key={level.price} className="grid grid-cols-3 text-right py-1">
            <span className="text-gray-600">{level.totalSize}</span>
            <span className="text-red-500">{level.price.toFixed(2)}</span>
            <div className="relative h-full">
              <div
                className="absolute right-0 top-0 h-full bg-red-100"
                style={{ width: `${(level.totalSize / Math.max(...askLevels.map(l => l.totalSize))) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Spread */}
      <div className="py-2 text-center text-gray-500 border-y border-gray-200">
        Spread: {askLevels[0] && bidLevels[0] ? 
          (askLevels[0].price - bidLevels[0].price).toFixed(2) : 
          'N/A'
        }
      </div>

      {/* Bid Levels */}
      <div className="flex-1 flex flex-col mt-2">
        {bidLevels.map((level) => (
          <div key={level.price} className="grid grid-cols-3 text-right py-1">
            <span className="text-gray-600">{level.totalSize}</span>
            <span className="text-green-500">{level.price.toFixed(2)}</span>
            <div className="relative h-full">
              <div
                className="absolute right-0 top-0 h-full bg-green-100"
                style={{ width: `${(level.totalSize / Math.max(...bidLevels.map(l => l.totalSize))) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}