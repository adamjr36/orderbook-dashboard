'use client';

import { useState } from 'react';
import useOrderBookStore from '@/lib/store/useOrderBookStore';
import { v4 as uuidv4 } from 'uuid';
import OrderTabs from './OrderTabs';

export default function OrderManagement() {
  const orderBook = useOrderBookStore(state => state.orderBook);
  const setOrderBook = useOrderBookStore(state => state.setOrderBook);
  
  const [orderForm, setOrderForm] = useState({
    userId: 'user1', // Default user ID
    price: '',
    size: '',
    side: 'buy'
  });
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Set success for 2 seconds
  const setSuccessState = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 2000);
  };

  // Set error for 2 seconds
  const setErrorState = (message) => {
    setError(message);
    setTimeout(() => setError(''), 2000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'size' ? Number(value) || '' : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const orderId = `${uuidv4()}`;
      const result = orderBook.addOrder({
        ...orderForm,
        id: orderId,
        price: Number(orderForm.price),
        size: Number(orderForm.size)
      });
      // Create a new OrderBook instance to trigger state update
      const updatedOrderBook = Object.create(Object.getPrototypeOf(orderBook));
      Object.assign(updatedOrderBook, orderBook);
      setOrderBook(updatedOrderBook);
      
      setSuccessState(`Order added successfully${result.trades.length ? ` with ${result.trades.length} trade(s)` : ''}`);
      setOrderForm(prev => ({ ...prev, price: '', size: '' }));
    } catch (err) {
      setErrorState(err.message);
    }
  };

  const handleLookup = (e) => {
    e.preventDefault();
    setError('');
    setLookupResult(null);

    const order = orderBook.getOrderById(lookupId);
    if (order) {
      setLookupResult(order);
      setActiveTab('result');
    } else {
      setErrorState('Order not found');
    }
  };

  const handleRemove = (id) => {
    setError('');
    setSuccess('');

    try {
      const order = orderBook.getOrderById(id);
      if (!order) {
        throw new Error('Order not found');
      }
      orderBook.removeOrder(id);
      // Create a new OrderBook instance to trigger state update
      const updatedOrderBook = Object.create(Object.getPrototypeOf(orderBook));
      Object.assign(updatedOrderBook, orderBook);
      setOrderBook(updatedOrderBook);
      
      setSuccessState('Order removed successfully');
      setLookupResult(null);
      setLookupId('');
      if (activeTab === 'result') {
        setActiveTab('lookup');
      }
    } catch (err) {
      setErrorState(err.message);
    }
  };

  const [activeTab, setActiveTab] = useState('make');

  const renderContent = () => {
    switch (activeTab) {
      case 'make':
        return (
          <form onSubmit={handleSubmit} className="space-y-3 flex-shrink-0">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-blue-600 mb-1">Side</label>
                <select
                  name="side"
                  value={orderForm.side}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white/50 backdrop-blur-sm text-blue-800"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-600 mb-1">Price</label>
                <input
                  type="number"
                  name="price"
                  value={orderForm.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white/50 backdrop-blur-sm text-blue-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-600 mb-1">Size</label>
                <input
                  type="number"
                  name="size"
                  value={orderForm.size}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white/50 backdrop-blur-sm text-blue-800"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Place Order
            </button>
          </form>
        );
      case 'remove':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-blue-600 mb-1">Order ID</label>
              <input
                type="text"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white/50 backdrop-blur-sm text-blue-800"
                placeholder="Enter order ID to remove"
              />
            </div>
            <button
              onClick={() => handleRemove(lookupId)}
              className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              Remove Order
            </button>
          </div>
        );
      case 'lookup':
        return (
          <form onSubmit={handleLookup} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-blue-600 mb-1">Order ID</label>
              <input
                type="text"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white/50 backdrop-blur-sm text-blue-800"
                placeholder="Enter order ID to lookup"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Lookup Order
            </button>
          </form>
        );
      case 'result':
        if (!lookupResult) {
          setActiveTab('lookup');
          return null;
        }
        return (
          <div className="p-4 rounded-lg bg-blue-50/50 backdrop-blur-sm border border-blue-200 relative">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-blue-600 font-medium">Order ID:</span>
                <span className="ml-2 text-blue-800">{lookupResult.id}</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">User ID:</span>
                <span className="ml-2 text-blue-800">{lookupResult.userId}</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Side:</span>
                <span className="ml-2 text-blue-800">{lookupResult.side}</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Price:</span>
                <span className="ml-2 text-blue-800">{lookupResult.price}</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Initial Size:</span>
                <span className="ml-2 text-blue-800">{lookupResult.initialSize}</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Remaining Size:</span>
                <span className="ml-2 text-blue-800">{lookupResult.remainingSize}</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <OrderTabs activeTab={activeTab} setActiveTab={setActiveTab} lookupResult={lookupResult} clearLookupResult={() => setLookupResult(null)} />
      {renderContent()}
     
      {/* Status Messages */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm shadow-lg animate-fade-in">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm shadow-lg animate-fade-in">
            {success}
          </div>
        )}
      </div>
    </div>
  );
}