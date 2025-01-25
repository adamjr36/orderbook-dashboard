import OrderBook from '../OrderBook';

describe('OrderBook', () => {
  let orderBook;

  beforeEach(() => {
    orderBook = new OrderBook();
  });

  describe('Order Management', () => {
    test('should add buy order to empty book', () => {
      const order = {
        id: 'order1',
        userId: 'user1',
        side: 'buy',
        price: 100,
        size: 10,
      };

      const result = orderBook.addOrder(order);
      expect(result.trades).toEqual([]);
      expect(orderBook.getOrderById('order1')).toEqual(order);
      expect(orderBook.getTopBidLevels(1)).toEqual([
        {
          price: 100,
          orders: [order],
          totalSize: 10,
        },
      ]);
    });

    test('should add sell order to empty book', () => {
      const order = {
        id: 'order1',
        userId: 'user1',
        side: 'sell',
        price: 100,
        size: 10,
      };

      const result = orderBook.addOrder(order);
      expect(result.trades).toEqual([]);
      expect(orderBook.getOrderById('order1')).toEqual(order);
      expect(orderBook.getTopAskLevels(1)).toEqual([
        {
          price: 100,
          orders: [order],
          totalSize: 10,
        },
      ]);
    });

    test('should reject invalid order format', () => {
      const invalidOrder = {
        id: 'order1',
        // missing required fields
      };

      expect(() => orderBook.addOrder(invalidOrder)).toThrow('Invalid order format');
    });

    test('should remove order correctly', () => {
      const order = {
        id: 'order1',
        userId: 'user1',
        side: 'buy',
        price: 100,
        size: 10,
      };

      orderBook.addOrder(order);
      const result = orderBook.removeOrder('order1');

      expect(result.deleted).toEqual([
        {
          side: 'buy',
          price: 100,
          size: 0,
        },
      ]);
      expect(orderBook.getOrderById('order1')).toBeNull();
      expect(orderBook.getTopBidLevels(1)).toEqual([]);
    });
  });

  describe('Trade Execution', () => {
    test('should execute matching buy order', () => {
      // Add sell order first
      const sellOrder = {
        id: 'sell1',
        userId: 'user1',
        side: 'sell',
        price: 100,
        size: 10,
      };
      orderBook.addOrder(sellOrder);

      // Add matching buy order
      const buyOrder = {
        id: 'buy1',
        userId: 'user2',
        side: 'buy',
        price: 100,
        size: 5,
      };

      const result = orderBook.addOrder(buyOrder);
      expect(result.trades.length).toBe(1);
      
      const trade = orderBook.getTradeById(result.trades[0]);
      expect(trade.buyOrderId).toBe('buy1');
      expect(trade.sellOrderId).toBe('sell1');
      expect(trade.size).toBe(5);
      expect(trade.price).toBe(100);

      // Check remaining sell order
      const remainingSell = orderBook.getOrderById('sell1');
      expect(remainingSell.size).toBe(5);
    });

    test('should execute matching sell order', () => {
      // Add buy order first
      const buyOrder = {
        id: 'buy1',
        userId: 'user1',
        side: 'buy',
        price: 100,
        size: 10,
      };
      orderBook.addOrder(buyOrder);

      // Add matching sell order
      const sellOrder = {
        id: 'sell1',
        userId: 'user2',
        side: 'sell',
        price: 100,
        size: 5,
      };

      const result = orderBook.addOrder(sellOrder);
      expect(result.trades.length).toBe(1);
      
      const trade = orderBook.getTradeById(result.trades[0]);
      expect(trade.buyOrderId).toBe('buy1');
      expect(trade.sellOrderId).toBe('sell1');
      expect(trade.size).toBe(5);
      expect(trade.price).toBe(100);

      // Check remaining buy order
      const remainingBuy = orderBook.getOrderById('buy1');
      expect(remainingBuy.size).toBe(5);
    });

    test('should handle multiple trades for one order', () => {
      // Add multiple sell orders
      orderBook.addOrder({
        id: 'sell1',
        userId: 'user1',
        side: 'sell',
        price: 100,
        size: 5,
      });

      orderBook.addOrder({
        id: 'sell2',
        userId: 'user2',
        side: 'sell',
        price: 100,
        size: 5,
      });

      // Add matching buy order
      const buyOrder = {
        id: 'buy1',
        userId: 'user3',
        side: 'buy',
        price: 100,
        size: 8,
      };

      const result = orderBook.addOrder(buyOrder);
      expect(result.trades.length).toBe(2);
      
      // First trade should be with sell1
      const trade1 = orderBook.getTradeById(result.trades[0]);
      expect(trade1.sellOrderId).toBe('sell1');
      expect(trade1.size).toBe(5);

      // Second trade should be with sell2
      const trade2 = orderBook.getTradeById(result.trades[1]);
      expect(trade2.sellOrderId).toBe('sell2');
      expect(trade2.size).toBe(3);

      // Check remaining sell order
      const remainingSell = orderBook.getOrderById('sell2');
      expect(remainingSell.size).toBe(2);
    });
  });

  describe('Price Level Management', () => {
    test('should maintain correct price levels for bids', () => {
      orderBook.addOrder({
        id: 'buy1',
        userId: 'user1',
        side: 'buy',
        price: 100,
        size: 5,
      });

      orderBook.addOrder({
        id: 'buy2',
        userId: 'user2',
        side: 'buy',
        price: 101,
        size: 3,
      });

      const topBids = orderBook.getTopBidLevels(2);
      expect(topBids).toEqual([
        {
          price: 101,
          orders: [{ id: 'buy2', userId: 'user2', side: 'buy', price: 101, size: 3 }],
          totalSize: 3,
        },
        {
          price: 100,
          orders: [{ id: 'buy1', userId: 'user1', side: 'buy', price: 100, size: 5 }],
          totalSize: 5,
        },
      ]);
    });

    test('should maintain correct price levels for asks', () => {
      orderBook.addOrder({
        id: 'sell1',
        userId: 'user1',
        side: 'sell',
        price: 100,
        size: 5,
      });

      orderBook.addOrder({
        id: 'sell2',
        userId: 'user2',
        side: 'sell',
        price: 99,
        size: 3,
      });

      const topAsks = orderBook.getTopAskLevels(2);
      expect(topAsks).toEqual([
        {
          price: 99,
          orders: [{ id: 'sell2', userId: 'user2', side: 'sell', price: 99, size: 3 }],
          totalSize: 3,
        },
        {
          price: 100,
          orders: [{ id: 'sell1', userId: 'user1', side: 'sell', price: 100, size: 5 }],
          totalSize: 5,
        },
      ]);
    });
  });

  describe('Recent Trades', () => {
    test('should track recent trades correctly', () => {
      // Add sell order
      orderBook.addOrder({
        id: 'sell1',
        userId: 'user1',
        side: 'sell',
        price: 100,
        size: 5,
      });

      // Add matching buy order
      const result = orderBook.addOrder({
        id: 'buy1',
        userId: 'user2',
        side: 'buy',
        price: 100,
        size: 5,
      });

      const recentTrades = orderBook.getRecentTrades(1);
      expect(recentTrades.length).toBe(1);
      expect(recentTrades[0].id).toBe(result.trades[0]);
    });
  });
});