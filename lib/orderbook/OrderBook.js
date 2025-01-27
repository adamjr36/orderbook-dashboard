import AVLTree from './AVLTree';
import Trade from './Trade';
import OrderBookLevel from './OrderBookLevel';

class Order {
  constructor(id, userId, price, size, side, timestamp = Date.now()) {
    this.id = id;
    this.userId = userId;
    this.price = price;
    this.initialSize = size;
    this.remainingSize = size;
    this.side = side;
    this.timestamp = timestamp;
  }
}

class OrderBook {
  constructor() {
    this.bids = new AVLTree(); // Buy orders
    this.asks = new AVLTree(); // Sell orders
    this.orders = new Map(); // All orders by ID
    this.trades = new Map(); // All trades by ID
    this.sortedTrades = []; // Keep track of recent trades
  }

  addOrder(orderData) {
    const updatedLevels = new Map();
    const trades = [];

    // Validate order data
    if (!orderData.id || !orderData.userId || !orderData.price || !orderData.size || !orderData.side) {
      throw new Error('Invalid order format');
    }

    // Create new order instance
    const order = new Order(
      orderData.id,
      orderData.userId,
      orderData.price,
      orderData.size,
      orderData.side,
      orderData.timestamp
    );

    // Handle duplicate order ID by removing the old order first
    const existingOrder = this.orders.get(order.id);
    if (existingOrder) {
      const removedLevels = this.removeOrder(order.id);
      const removedPrice = removedLevels[0].price;
      if (removedLevels) {
        updatedLevels.set(removedPrice, removedLevels[0]);
      }
    }

    // Check for matching orders and execute trades
    if (order.side === 'buy') {
      while (order.remainingSize > 0) {
        const bestAsk = this.asks.getMinKey();
        if (!bestAsk || bestAsk > order.price) break;

        const askNode = this.asks.find(bestAsk);
        const sellOrder = askNode.value.getOldestOrder();

        const tradeSize = Math.min(order.remainingSize, sellOrder.remainingSize);
        const trade = new Trade(order, sellOrder, tradeSize, bestAsk, Date.now());

        // Update order sizes using fillOrder
        order.remainingSize -= tradeSize;
        askNode.value.fillOrder(sellOrder.id, tradeSize);

        // Record trade
        this.trades.set(trade.id, trade);
        this.sortedTrades.push(trade);
        trades.push(trade.id);

        // Update levels
        this._addLevelUpdate(updatedLevels, 'ask', bestAsk, askNode.value.getTotalSize());

        // Remove completed sell order
        if (sellOrder.remainingSize === 0) {
          this.removeOrder(sellOrder.id);
        }
      }

      // Add remaining order to book
      if (order.remainingSize > 0) {
        this.orders.set(order.id, order);
        const bidNode = this.bids.find(order.price);
        if (!bidNode) {
          const level = new OrderBookLevel();
          level.addOrder(order);
          this.bids.insert(order.price, level);
        } else {
          bidNode.value.addOrder(order);
        }
        this._addLevelUpdate(updatedLevels, 'bid', order.price, 
          this.bids.find(order.price).value.getTotalSize());
      }
    } else if (order.side === 'sell') {
      while (order.remainingSize > 0) {
        const bestBid = this.bids.getMaxKey();
        if (!bestBid || bestBid < order.price) break;

        const bidNode = this.bids.find(bestBid);
        const buyOrder = bidNode.value.getOldestOrder();

        const tradeSize = Math.min(order.remainingSize, buyOrder.remainingSize);
        const trade = new Trade(buyOrder, order, tradeSize, bestBid, Date.now());

        // Update order sizes using fillOrder
        order.remainingSize -= tradeSize;
        bidNode.value.fillOrder(buyOrder.id, tradeSize);

        // Record trade
        this.trades.set(trade.id, trade);
        this.sortedTrades.push(trade);
        trades.push(trade.id);

        // Update levels
        this._addLevelUpdate(updatedLevels, 'bid', bestBid, bidNode.value.getTotalSize());

        // Remove completed buy order
        if (buyOrder.remainingSize === 0) {
          this.removeOrder(buyOrder.id);
        }
      }

      // Add remaining order to book
      if (order.remainingSize > 0) {
        this.orders.set(order.id, order);
        const askNode = this.asks.find(order.price);
        if (!askNode) {
          const level = new OrderBookLevel();
          level.addOrder(order);
          this.asks.insert(order.price, level);
        } else {
          askNode.value.addOrder(order);
        }
        this._addLevelUpdate(updatedLevels, 'ask', order.price, 
          this.asks.find(order.price).value.getTotalSize());
      }
    }

    return { trades, updatedLevels: Array.from(updatedLevels.values()) };
  }

  removeOrder(orderId) {
    const order = this.orders.get(orderId);
    if (!order) return [];

    const updatedLevels = [];
    const tree = order.side === 'buy' ? this.bids : this.asks;
    const node = tree.find(order.price);

    if (node) {
      const isEmpty = node.value.removeOrder(orderId);
      if (isEmpty) {
        tree.remove(order.price);
        updatedLevels.push({
          side: order.side,
          price: order.price,
          size: 0
        });
      } else {
        updatedLevels.push({
          side: order.side,
          price: order.price,
          size: node.value.getTotalSize()
        });
      }
      this.orders.delete(orderId);
    }

    return updatedLevels;
  }

  getOrderById(orderId) {
    return this.orders.get(orderId) || null;
  }

  getTradeById(tradeId) {
    return this.trades.get(tradeId) || null;
  }

  getTopBidLevels(k) {
    return this.bids.getNodes(k).map(node => ({
      price: node.key,
      orders: node.value.getOrders(),
      totalSize: node.value.getTotalSize()
    }));
  }

  getTopAskLevels(k) {
    return this.asks.getNodes(k, true).map(node => ({
      price: node.key,
      orders: node.value.getOrders(),
      totalSize: node.value.getTotalSize()
    }));
  }

  getRecentTrades(k) {
    return this.sortedTrades.slice(-k).reverse();
  }

  _addLevelUpdate(updatedLevels, side, price, size) {
    updatedLevels.set(price, {
      side,
      price,
      size
    });
  }
}

export { Order, OrderBook as default };