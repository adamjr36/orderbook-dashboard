import { create } from 'zustand'
import OrderBook from '../orderbook/OrderBook'

const useOrderBookStore = create((set, get) => ({
  orderBook: new OrderBook(),
  isLoading: false,
  setOrderBook: (newOrderBook) => set({ orderBook: newOrderBook }),
  setLoading: (loading) => set({ isLoading: loading }),
  
  // Add any other methods you need to interact with the OrderBook
  getTopBids: (levels) => get().orderBook.getTopBidLevels(levels),
  getTopAsks: (levels) => get().orderBook.getTopAskLevels(levels),
}))

export default useOrderBookStore