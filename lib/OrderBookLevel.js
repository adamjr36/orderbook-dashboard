class OrderBookLevel {
  constructor() {
    this.ordersMap = new Map(); // For O(1) order access by ID
    this.ordersArray = []; // Maintain time priority naturally
    this.total_size = 0;
  }

  addOrder(order) {
    this.ordersMap.set(order.id, order);
    this.ordersArray.push(order); // Orders are naturally added in time priority
    this.total_size += order.size;
  }

  removeOrder(orderId) {
    const order = this.ordersMap.get(orderId);
    if (order) {
      this.ordersMap.delete(orderId);
      const orderIndex = this.ordersArray.findIndex(o => o.id === orderId);
      this.ordersArray.splice(orderIndex, 1);
      this.total_size -= order.size;
    }
    return this.ordersMap.size === 0;
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