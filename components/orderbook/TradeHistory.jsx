'use client';

import useOrderBookStore from '@/lib/store/useOrderBookStore';

export default function TradeHistory() {
  const orderBook = useOrderBookStore(state => state.orderBook);
  const trades = orderBook.getRecentTrades(50); // Get last 50 trades

  if (!trades.length) {
    return (
      <div className="p-4 text-center text-blue-600/60">
        No trades executed yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* <h3 className="text-lg font-semibold text-blue-800 mb-3">Recent Trades</h3> */}
      <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="flex-none w-48 p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-blue-200 hover:border-blue-400 transition-colors duration-200"
          >
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-600">Price</span>
                <span className="text-sm text-blue-800">{trade.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-600">Size</span>
                <span className="text-sm text-blue-800">{trade.size.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-600">Time</span>
                <span className="text-sm text-blue-800">
                  {new Date(trade.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}