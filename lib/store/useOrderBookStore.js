import { create } from 'zustand'
import OrderBook from '../OrderBook'

const useOrderBookStore = create((set, get) => ({
  orderBook: new OrderBook(),
  setOrderBook: (newOrderBook) => set({ orderBook: newOrderBook }),
  
  // Add any other methods you need to interact with the OrderBook
  getTopBids: (levels) => get().orderBook.getTopBidLevels(levels),
  getTopAsks: (levels) => get().orderBook.getTopAskLevels(levels),
}))

export default useOrderBookStore