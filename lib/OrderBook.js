import AVLTree from './AVLTree';
import Trade from './Trade';
import OrderBookLevel from './OrderBookLevel';

class OrderBook {
  constructor() {
    this.bids = new AVLTree(); // Buy orders
    this.asks = new AVLTree(); // Sell orders
    this.orders = new Map(); // All orders by ID
    this.trades = new Map(); // All trades by ID
    this.sortedTrades = []; // Keep track of recent trades
  }

  addOrder(order) {
    const updatedLevels = { new: [], deleted: [], modified: [] };
    const trades = [];

    // Validate order
    if (!order.id || !order.userId || !order.price || !order.size || !order.side) {
      throw new Error('Invalid order format');
    }

    // Set timestamp if not provided
    if (!order.timestamp) {
      order.timestamp = Date.now();
    }

    // Check for matching orders and execute trades
    if (order.side === 'buy') {
      while (order.size > 0) {
        const bestAsk = this.asks.getMinKey();
        if (!bestAsk || bestAsk > order.price) break;

        const askNode = this.asks.find(bestAsk);
        const sellOrder = askNode.value.getOldestOrder();

        const tradeSize = Math.min(order.size, sellOrder.size);
        const trade = new Trade(order, sellOrder, tradeSize, bestAsk, Date.now());

        // Update order sizes
        order.size -= tradeSize;
        sellOrder.size -= tradeSize;

        // Record trade
        this.trades.set(trade.id, trade);
        this.sortedTrades.push(trade);
        trades.push(trade.id);

        // Update levels
        this._updateLevels(updatedLevels, 'ask', bestAsk, askNode.value);

        // Remove completed sell order
        if (sellOrder.size === 0) {
          this.removeOrder(sellOrder.id);
        }
      }

      // Add remaining order to book
      if (order.size > 0) {
        this.orders.set(order.id, order);
        const bidNode = this.bids.find(order.price);
        if (!bidNode) {
          const level = new OrderBookLevel();
          level.addOrder(order);
          this.bids.insert(order.price, level);
        } else {
          bidNode.value.addOrder(order);
        }
        this._updateLevels(updatedLevels, 'bid', order.price, 
          this.bids.find(order.price).value);
      }
    } else if (order.side === 'sell') {
      while (order.size > 0) {
        const bestBid = this.bids.getMaxKey();
        if (!bestBid || bestBid < order.price) break;

        const bidNode = this.bids.find(bestBid);
        const buyOrder = bidNode.value.getOldestOrder();

        const tradeSize = Math.min(order.size, buyOrder.size);
        const trade = new Trade(buyOrder, order, tradeSize, bestBid, Date.now());

        // Update order sizes
        order.size -= tradeSize;
        buyOrder.size -= tradeSize;

        // Record trade
        this.trades.set(trade.id, trade);
        this.sortedTrades.push(trade);
        trades.push(trade.id);

        // Update levels
        this._updateLevels(updatedLevels, 'bid', bestBid, bidNode.value);

        // Remove completed buy order
        if (buyOrder.size === 0) {
          this.removeOrder(buyOrder.id);
        }
      }

      // Add remaining order to book
      if (order.size > 0) {
        this.orders.set(order.id, order);
        const askNode = this.asks.find(order.price);
        if (!askNode) {
          const level = new OrderBookLevel();
          level.addOrder(order);
          this.asks.insert(order.price, level);
        } else {
          askNode.value.addOrder(order);
        }
        this._updateLevels(updatedLevels, 'ask', order.price, 
          this.asks.find(order.price).value);
      }
    }

    return { trades, updatedLevels };
  }

  removeOrder(orderId) {
    const order = this.orders.get(orderId);
    if (!order) return null;

    const updatedLevels = { new: [], deleted: [], modified: [] };
    const tree = order.side === 'buy' ? this.bids : this.asks;
    const node = tree.find(order.price);

    if (node) {
      const isEmpty = node.value.removeOrder(orderId);
      if (isEmpty) {
        tree.remove(order.price);
        updatedLevels.deleted.push({
          side: order.side,
          price: order.price,
          size: 0
        });
      } else {
        updatedLevels.modified.push({
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

  _updateLevels(updatedLevels, side, price, level) {
    if (!level || level.getOrders().length === 0) {
      updatedLevels.deleted.push({
        side,
        price,
        size: 0
      });
    } else {
      updatedLevels.modified.push({
        side,
        price,
        size: level.getTotalSize()
      });
    }
  }
}

export default OrderBook;