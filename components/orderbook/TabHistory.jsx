'use client';

import { useState } from 'react';
import useOrderBookStore from '@/lib/store/useOrderBookStore';
import TradeHistory from './TradeHistory';

export default function TabHistory() {
  const [activeTab, setActiveTab] = useState('trades');
  const orderBook = useOrderBookStore(state => state.orderBook);

  const bids = orderBook.getTopBidLevels(50);
  const asks = orderBook.getTopAskLevels(50);

  const renderOrders = (levels, side) => {
    if (!levels.length) {
      return (
        <div className="p-4 text-center text-blue-600/60">
          No {side} orders available
        </div>
      );
    }

    const orders = levels.flatMap(level => level.orders);

    return (
      <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex-none w-56 p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-blue-200 hover:border-blue-400 transition-colors duration-200"
          >
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-600 shrink-0">Order ID</span>
                <span className="text-sm text-blue-800 text-right break-all">{order.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-600">Price</span>
                <span className="text-sm text-blue-800">{order.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-600">Size</span>
                <span className="text-sm text-blue-800">{order.remainingSize.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'trades':
        return <TradeHistory />;
      case 'bids':
        return renderOrders(bids, 'bid');
      case 'asks':
        return renderOrders(asks, 'ask');
      default:
        return null;
    }
  };

  const getTabStyle = (tab) => {
    return `px-4 py-1 text-sm font-medium ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-blue-600 bg-white/50 hover:bg-white/70'} rounded-lg border ${activeTab === tab ? 'border-blue-600' : 'border-blue-200 hover:border-blue-400'} transition-colors duration-200`;
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 mb-2">
        <button
          className={getTabStyle('trades')}
          onClick={() => setActiveTab('trades')}
        >
          Recent Trades
        </button>
        <button
          className={getTabStyle('bids')}
          onClick={() => setActiveTab('bids')}
        >
          Buy Orders
        </button>
        <button
          className={getTabStyle('asks')}
          onClick={() => setActiveTab('asks')}
        >
          Sell Orders
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}