class OrderBookLevel {
  constructor() {
    this.ordersMap = new Map(); // For O(1) order access by ID
    this.ordersArray = []; // Maintain time priority naturally
    this.total_size = 0;
  }

  addOrder(order) {
    this.ordersMap.set(order.id, order);
    this.ordersArray.push(order); // Orders are naturally added in time priority
    this.total_size += order.remainingSize;
  }

  removeOrder(orderId) {
    const order = this.ordersMap.get(orderId);
    if (order) {
      this.ordersMap.delete(orderId);
      const orderIndex = this.ordersArray.findIndex(o => o.id === orderId);
      this.ordersArray.splice(orderIndex, 1);
      this.total_size -= order.remainingSize;
    }
    return this.ordersMap.size === 0;
  }

  fillOrder(orderId, fillSize) {
    const order = this.ordersMap.get(orderId);
    if (!order || fillSize <= 0 || fillSize > order.remainingSize) {
      return 0;
    }

    const previousSize = order.remainingSize;
    order.remainingSize -= fillSize;
    this.total_size -= fillSize;

    // Remove the order if it's completely filled
    if (order.remainingSize === 0) {
      this.removeOrder(orderId);
    }

    return fillSize;
  }

  getOldestOrder() {
    return this.ordersArray[0] || null;
  }

  getTotalSize() {
    return this.total_size;
  }

  getOrders() {
    return this.ordersArray;
  }
}

export default OrderBookLevel;