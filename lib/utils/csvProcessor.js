import OrderBook from '../orderbook/OrderBook';

export function processCSVFile(records) {
  const orderBook = new OrderBook();
  
  // Process each record and add to orderbook
  records.forEach(record => {
    orderBook.addOrder({
      id: record.id,
      userId: record.userId,
      side: record.side,
      price: parseFloat(record.price),
      size: parseFloat(record.size)
    });
  });

  return orderBook;
}