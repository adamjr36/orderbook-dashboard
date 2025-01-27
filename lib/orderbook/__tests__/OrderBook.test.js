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
      const storedOrder = orderBook.getOrderById('order1');
      expect(storedOrder.initialSize).toBe(10);
      expect(storedOrder.remainingSize).toBe(10);
    });

    test('should handle duplicate order ID correctly', () => {
      // Add initial order
      const initialOrder = {
        id: 'order1',
        userId: 'user1',
        side: 'buy',
        price: 100,
        size: 10,
      };
      orderBook.addOrder(initialOrder);

      // Add duplicate order with different size
      const duplicateOrder = {
        id: 'order1',
        userId: 'user1',
        side: 'buy',
        price: 100,
        size: 5,
      };
      const result = orderBook.addOrder(duplicateOrder);

      // Verify old order is replaced
      const storedOrder = orderBook.getOrderById('order1');
      expect(storedOrder).toMatchObject({
        id: duplicateOrder.id,
        userId: duplicateOrder.userId,
        side: duplicateOrder.side,
        price: duplicateOrder.price,
        initialSize: duplicateOrder.size,
        remainingSize: duplicateOrder.size
      });
      expect(storedOrder.timestamp).toBeDefined();
      expect(orderBook.getTopBidLevels(1)).toEqual([
        {
          price: 100,
          orders: [{
            id: duplicateOrder.id,
            userId: duplicateOrder.userId,
            side: duplicateOrder.side,
            price: duplicateOrder.price,
            initialSize: duplicateOrder.size,
            remainingSize: duplicateOrder.size,
            timestamp: expect.any(Number)
          }],
          totalSize: 5,
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
      const storedOrder = orderBook.getOrderById('order1');
      expect(storedOrder).toMatchObject({
        id: order.id,
        userId: order.userId,
        side: order.side,
        price: order.price,
        initialSize: order.size,
        remainingSize: order.size
      });
      expect(storedOrder.timestamp).toBeDefined();
      expect(orderBook.getTopAskLevels(1)).toEqual([
        {
          price: 100,
          orders: [{
            id: order.id,
            userId: order.userId,
            side: order.side,
            price: order.price,
            initialSize: order.size,
            remainingSize: order.size,
            timestamp: expect.any(Number)
          }],
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

      expect(result).toEqual([
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
      expect(remainingSell.remainingSize).toBe(5);
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
      expect(remainingBuy.remainingSize).toBe(5);
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
      expect(remainingSell.remainingSize).toBe(2);
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
      expect(topBids.length).toBe(2);
      expect(topBids[0].price).toBe(101);
      expect(topBids[0].totalSize).toBe(3);
      expect(topBids[0].orders[0].id).toBe('buy2');
      expect(topBids[1].price).toBe(100);
      expect(topBids[1].totalSize).toBe(5);
      expect(topBids[1].orders[0].id).toBe('buy1');
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
      expect(topAsks.length).toBe(2);
      expect(topAsks[0].price).toBe(99);
      expect(topAsks[0].totalSize).toBe(3);
      expect(topAsks[0].orders[0].id).toBe('sell2');
      expect(topAsks[1].price).toBe(100);
      expect(topAsks[1].totalSize).toBe(5);
      expect(topAsks[1].orders[0].id).toBe('sell1');
    });
  });

  describe('Floating Point Price Handling', () => {
    test('should handle decimal prices in order matching', () => {
      // Add sell order with decimal price
      orderBook.addOrder({
        id: 'sell1',
        userId: 'user1',
        side: 'sell',
        price: 100.50,
        size: 5,
      });

      // Add matching buy order with same decimal price
      const result = orderBook.addOrder({
        id: 'buy1',
        userId: 'user2',
        side: 'buy',
        price: 100.50,
        size: 3,
      });

      expect(result.trades.length).toBe(1);
      const trade = orderBook.getTradeById(result.trades[0]);
      expect(trade.price).toBe(100.50);
      expect(trade.size).toBe(3);
    });

    test('should maintain price level ordering with decimal prices', () => {
      // Add multiple buy orders with decimal prices
      orderBook.addOrder({
        id: 'buy1',
        userId: 'user1',
        side: 'buy',
        price: 100.50,
        size: 5,
      });

      orderBook.addOrder({
        id: 'buy2',
        userId: 'user2',
        side: 'buy',
        price: 100.75,
        size: 3,
      });

      orderBook.addOrder({
        id: 'buy3',
        userId: 'user3',
        side: 'buy',
        price: 100.25,
        size: 4,
      });

      const topBids = orderBook.getTopBidLevels(3);
      expect(topBids[0].price).toBe(100.75);
      expect(topBids[1].price).toBe(100.50);
      expect(topBids[2].price).toBe(100.25);
    });

    test('should handle high precision decimal prices', () => {
      const sellOrder = {
        id: 'sell1',
        userId: 'user1',
        side: 'sell',
        price: 100.12345,
        size: 5,
      };
      
      const buyOrder = {
        id: 'buy1',
        userId: 'user2',
        side: 'buy',
        price: 100.12345,
        size: 5,
      };

      orderBook.addOrder(sellOrder);
      const result = orderBook.addOrder(buyOrder);

      expect(result.trades.length).toBe(1);
      const trade = orderBook.getTradeById(result.trades[0]);
      expect(trade.price).toBe(100.12345);
    });

    test('should handle extreme decimal values', () => {
      const sellOrder = {
        id: 'sell1',
        userId: 'user1',
        side: 'sell',
        price: 0.00001,
        size: 1000000,
      };

      const buyOrder = {
        id: 'buy1',
        userId: 'user2',
        side: 'buy',
        price: 0.00001,
        size: 1000000,
      };

      orderBook.addOrder(sellOrder);
      const result = orderBook.addOrder(buyOrder);

      expect(result.trades.length).toBe(1);
      const trade = orderBook.getTradeById(result.trades[0]);
      expect(trade.price).toBe(0.00001);
      expect(trade.size).toBe(1000000);
    });

    test('should correctly match orders with different decimal precisions', () => {
      // Add sell order with 2 decimal places
      orderBook.addOrder({
        id: 'sell1',
        userId: 'user1',
        side: 'sell',
        price: 100.50,
        size: 5,
      });

      // Add buy order with 5 decimal places but same actual price
      const result = orderBook.addOrder({
        id: 'buy1',
        userId: 'user2',
        side: 'buy',
        price: 100.50000,
        size: 5,
      });

      expect(result.trades.length).toBe(1);
      const trade = orderBook.getTradeById(result.trades[0]);
      expect(trade.buyOrderId).toBe('buy1');
      expect(trade.sellOrderId).toBe('sell1');
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

  describe('Floating Point Price Handling', () => {
    test('should handle decimal prices in order matching', () => {
      // Add sell order with decimal price
      orderBook.addOrder({
        id: 'sell1',
        userId: 'user1',
        side: 'sell',
        price: 100.50,
        size: 5,
      });

      // Add matching buy order with same decimal price
      const result = orderBook.addOrder({
        id: 'buy1',
        userId: 'user2',
        side: 'buy',
        price: 100.50,
        size: 3,
      });

      expect(result.trades.length).toBe(1);
      const trade = orderBook.getTradeById(result.trades[0]);
      expect(trade.price).toBe(100.50);
      expect(trade.size).toBe(3);
    });

    test('should maintain price level ordering with decimal prices', () => {
      // Add multiple buy orders with decimal prices
      orderBook.addOrder({
        id: 'buy1',
        userId: 'user1',
        side: 'buy',
        price: 100.50,
        size: 5,
      });

      orderBook.addOrder({
        id: 'buy2',
        userId: 'user2',
        side: 'buy',
        price: 100.75,
        size: 3,
      });

      orderBook.addOrder({
        id: 'buy3',
        userId: 'user3',
        side: 'buy',
        price: 100.25,
        size: 4,
      });

      const topBids = orderBook.getTopBidLevels(3);
      expect(topBids[0].price).toBe(100.75);
      expect(topBids[1].price).toBe(100.50);
      expect(topBids[2].price).toBe(100.25);
    });

    test('should handle high precision decimal prices', () => {
      const sellOrder = {
        id: 'sell1',
        userId: 'user1',
        side: 'sell',
        price: 100.12345,
        size: 5,
      };
      
      const buyOrder = {
        id: 'buy1',
        userId: 'user2',
        side: 'buy',
        price: 100.12345,
        size: 5,
      };

      orderBook.addOrder(sellOrder);
      const result = orderBook.addOrder(buyOrder);

      expect(result.trades.length).toBe(1);
      const trade = orderBook.getTradeById(result.trades[0]);
      expect(trade.price).toBe(100.12345);
    });

    test('should handle extreme decimal values', () => {
      const sellOrder = {
        id: 'sell1',
        userId: 'user1',
        side: 'sell',
        price: 0.00001,
        size: 1000000,
      };

      const buyOrder = {
        id: 'buy1',
        userId: 'user2',
        side: 'buy',
        price: 0.00001,
        size: 1000000,
      };

      orderBook.addOrder(sellOrder);
      const result = orderBook.addOrder(buyOrder);

      expect(result.trades.length).toBe(1);
      const trade = orderBook.getTradeById(result.trades[0]);
      expect(trade.price).toBe(0.00001);
      expect(trade.size).toBe(1000000);
    });

    test('should correctly match orders with different decimal precisions', () => {
      // Add sell order with 2 decimal places
      orderBook.addOrder({
        id: 'sell1',
        userId: 'user1',
        side: 'sell',
        price: 100.50,
        size: 5,
      });

      // Add buy order with 5 decimal places but same actual price
      const result = orderBook.addOrder({
        id: 'buy1',
        userId: 'user2',
        side: 'buy',
        price: 100.50000,
        size: 5,
      });

      expect(result.trades.length).toBe(1);
      const trade = orderBook.getTradeById(result.trades[0]);
      expect(trade.buyOrderId).toBe('buy1');
      expect(trade.sellOrderId).toBe('sell1');
    });
  });

  describe('Level Updates', () => {
    test('should return correct level updates for partial fills', () => {
      // Add sell order
      const sellResult = orderBook.addOrder({
        id: 'sell1',
        userId: 'user1',
        side: 'sell',
        price: 100,
        size: 10,
      });

      // Add partially matching buy order
      const buyResult = orderBook.addOrder({
        id: 'buy1',
        userId: 'user2',
        side: 'buy',
        price: 100,
        size: 6,
      });

      expect(buyResult.updatedLevels).toEqual([
        {
          side: 'ask',
          price: 100,
          size: 4
        }
      ]);
    });

    test('should handle level updates for multiple price levels', () => {
      // Add multiple sell orders at different prices
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
        price: 101,
        size: 3,
      });

      // Add buy order that matches multiple levels
      const result = orderBook.addOrder({
        id: 'buy1',
        userId: 'user3',
        side: 'buy',
        price: 101,
        size: 7,
      });

      const updates = result.updatedLevels;
      expect(updates).toEqual([
        {
          side: 'ask',
          price: 100,
          size: 0
        },
        {
          side: 'ask',
          price: 101,
          size: 1
        }
      ]);
    });

    test('should update levels correctly when removing orders', () => {
      // Add multiple orders at same price
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
        price: 100,
        size: 3,
      });

      const result = orderBook.removeOrder('buy1');
      expect(result).toEqual([
        {
          side: 'buy',
          price: 100,
          size: 3
        }
      ]);
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero size orders', () => {
      expect(() => {
        orderBook.addOrder({
          id: 'buy1',
          userId: 'user1',
          side: 'buy',
          price: 100,
          size: 0,
        });
      }).toThrow('Invalid order format');
    });

    test('should handle removal of non-existent order', () => {
      const result = orderBook.removeOrder('nonexistent');
      expect(result).toEqual([]);
    });

    test('should handle multiple orders at same price level', () => {
      // Add multiple orders at same price
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
        size: 3,
      });

      const topAsks = orderBook.getTopAskLevels(1);
      expect(topAsks[0].totalSize).toBe(8);
      expect(topAsks[0].orders.length).toBe(2);
    });
  });

  describe('Level Updates', () => {
    test('should return correct updatedLevels when adding new bid', () => {
      const order = {
        id: 'buy1',
        userId: 'user1',
        side: 'buy',
        price: 100,
        size: 5,
      };

      const result = orderBook.addOrder(order);
      expect(result.updatedLevels).toEqual([{
        side: 'bid',
        price: 100,
        size: 5
      }]);
    });

    test('should return correct updatedLevels when adding new ask', () => {
      const order = {
        id: 'sell1',
        userId: 'user1',
        side: 'sell',
        price: 100,
        size: 5,
      };

      const result = orderBook.addOrder(order);
      expect(result.updatedLevels).toEqual([{
        side: 'ask',
        price: 100,
        size: 5
      }]);
    });

    test('should return correct updatedLevels for partial fills', () => {
      // Add initial sell order
      orderBook.addOrder({
        id: 'sell1',
        userId: 'user1',
        side: 'sell',
        price: 100,
        size: 10,
      });

      // Add partially matching buy order
      const result = orderBook.addOrder({
        id: 'buy1',
        userId: 'user2',
        side: 'buy',
        price: 100,
        size: 6,
      });

      expect(result.updatedLevels).toEqual([{
        side: 'ask',
        price: 100,
        size: 4
      }]);
    });

    test('should return correct updatedLevels when adding to existing level', () => {
      // Add first order
      orderBook.addOrder({
        id: 'buy1',
        userId: 'user1',
        side: 'buy',
        price: 100,
        size: 5,
      });

      // Add second order at same price
      const result = orderBook.addOrder({
        id: 'buy2',
        userId: 'user2',
        side: 'buy',
        price: 100,
        size: 3,
      });

      expect(result.updatedLevels).toEqual([{
        side: 'bid',
        price: 100,
        size: 8
      }]);
    });

    test('should return correct updatedLevels when removing level after full fill', () => {
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

      expect(result.updatedLevels).toEqual([{
        side: 'ask',
        price: 100,
        size: 0
      }]);
    });
  });

  describe('Complex Trading Scenarios', () => {
    test('should handle partial fills with multiple orders at same price', () => {
      // Add multiple buy orders at same price
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
        price: 100,
        size: 3,
      });

      // Add larger sell order
      const result = orderBook.addOrder({
        id: 'sell1',
        userId: 'user3',
        side: 'sell',
        price: 100,
        size: 6,
      });

      expect(result.trades.length).toBe(2);
      
      // First trade should fully fill first buy order
      const trade1 = orderBook.getTradeById(result.trades[0]);
      expect(trade1.buyOrderId).toBe('buy1');
      expect(trade1.size).toBe(5);

      // Second trade should partially fill second buy order
      const trade2 = orderBook.getTradeById(result.trades[1]);
      expect(trade2.buyOrderId).toBe('buy2');
      expect(trade2.size).toBe(1);

      // Check remaining buy order
      const remainingBuy = orderBook.getOrderById('buy2');
      expect(remainingBuy.remainingSize).toBe(2);
    });

    test('should maintain price-time priority in order execution', () => {
      // Add buy orders in specific order
      orderBook.addOrder({
        id: 'buy1',
        userId: 'user1',
        side: 'buy',
        price: 100,
        size: 2,
      });

      orderBook.addOrder({
        id: 'buy2',
        userId: 'user2',
        side: 'buy',
        price: 101, // Higher price
        size: 2,
      });

      orderBook.addOrder({
        id: 'buy3',
        userId: 'user3',
        side: 'buy',
        price: 100, // Same as buy1
        size: 2,
      });

      // Add sell order that matches all
      const result = orderBook.addOrder({
        id: 'sell1',
        userId: 'user4',
        side: 'sell',
        price: 100,
        size: 5,
      });

      expect(result.trades.length).toBe(3);
      
      // Should execute in price-time priority
      expect(orderBook.getTradeById(result.trades[0]).buyOrderId).toBe('buy2'); // Highest price first
      expect(orderBook.getTradeById(result.trades[1]).buyOrderId).toBe('buy1'); // First in time at price
      expect(orderBook.getTradeById(result.trades[2]).buyOrderId).toBe('buy3'); // Second in time at price
    });

    test('should handle order cancellation during active trading', () => {
      // Add initial orders
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
        price: 100,
        size: 3,
      });

      // Cancel first order
      orderBook.removeOrder('buy1');

      // Add matching sell order
      const result = orderBook.addOrder({
        id: 'sell1',
        userId: 'user3',
        side: 'sell',
        price: 100,
        size: 5,
      });

      expect(result.trades.length).toBe(1);
      const trade = orderBook.getTradeById(result.trades[0]);
      expect(trade.buyOrderId).toBe('buy2');
      expect(trade.size).toBe(3);

      // Verify remaining sell order
      const remainingSell = orderBook.getOrderById('sell1');
      expect(remainingSell.remainingSize).toBe(2);
    });

    test('should handle extreme market conditions', () => {
      // Add many small orders on both sides
      for (let i = 0; i < 10; i++) {
        orderBook.addOrder({
          id: `buy${i}`,
          userId: `user${i}`,
          side: 'buy',
          price: 100 - (i * 0.1), // Decreasing prices
          size: 1,
        });

        orderBook.addOrder({
          id: `sell${i}`,
          userId: `user${i+10}`,
          side: 'sell',
          price: 100 + (i * 0.1), // Increasing prices
          size: 1,
        });
      }

      // Add large market order
      const result = orderBook.addOrder({
        id: 'marketBuy',
        userId: 'marketMaker',
        side: 'buy',
        price: 101, // Above all sell orders
        size: 5,
      });

        
        console.log(result)
      expect(result.trades.length).toBe(5); // Should match with first 5 sell orders
      expect(orderBook.getTopAskLevels(10).length).toBe(4); // Should have 5 remaining sell orders
    });
  });
});