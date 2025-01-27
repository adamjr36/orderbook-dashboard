class Trade {
  constructor(buyOrder, sellOrder, size, price, timestamp) {
    this.id = `t${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.buyOrderId = buyOrder.id;
    this.sellOrderId = sellOrder.id;
    this.buyUserId = buyOrder.userId;
    this.sellUserId = sellOrder.userId;
    this.size = size;
    this.price = price;
    this.timestamp = timestamp;
  }
}

export default Trade;