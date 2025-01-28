'use client';

import useOrderBookStore from '@/lib/store/useOrderBookStore';
import PriceLevel from './PriceLevel';

export default function VerticalOB() {
  const orderBook = useOrderBookStore(state => state.orderBook);
  const K = 10;
  
  if (!orderBook) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No orderbook data available</p>
      </div>
    );
  }

  const askLevels = orderBook.getTopAskLevels(K).reverse();
  const bidLevels = orderBook.getTopBidLevels(K);

  const maxAskSize = Math.max(...askLevels.map(l => l.totalSize));
  const maxBidSize = Math.max(...bidLevels.map(l => l.totalSize));

  const spread = askLevels[0] && bidLevels[0] ?
    (askLevels[askLevels.length - 1].price - bidLevels[0].price).toFixed(2) :
    'N/A';

  return (
    <div className="h-full flex flex-col bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-800">Order Book</h2>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-ask-light"></div>
            <span className="text-blue-600">Asks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-bid-light"></div>
            <span className="text-blue-600">Bids</span>
          </div>
        </div>
      </div>
      
      {/* Column Headers */}
      <div className="grid grid-cols-[1fr,2fr,1fr] gap-4 text-right py-2 px-4 text-sm font-semibold text-blue-600 border-b border-blue-100">
        <span>Price</span>
        <span className="text-center">Volume</span>
        <span>Size</span>
      </div>
      
      {/* Ask Levels */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent flex flex-col-reverse">
        <div className="space-y-0.5">
          {askLevels.map((level) => (
            <PriceLevel
              key={level.price}
              level={level}
              side="ask"
              maxSize={maxAskSize}
            />
          ))}
        </div>
      </div>

      {/* Spread */}
      <div className="py-2 text-center text-blue-600 border-y border-blue-100 bg-blue-50/80 backdrop-blur-sm rounded-md my-2 shrink-0">
        <span className="text-sm font-medium">Spread:</span>{' '}
        <span className="text-sm font-semibold">{spread}</span>
      </div>

      {/* Bid Levels */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
        <div className="flex flex-col space-y-0.5 mt-3">
          {bidLevels.map((level) => (
            <PriceLevel
              key={level.price}
              level={level}
              side="bid"
              maxSize={maxBidSize}
            />
          ))}
        </div>
      </div>
    </div>
  );
}