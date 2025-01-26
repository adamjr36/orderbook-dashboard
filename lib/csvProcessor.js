import { parse } from 'csv-parse/sync';
import OrderBook from './OrderBook';

export function processCSVFile(records) {
  // const fileContent = await file.text();
  // const records = parse(fileContent, {
  //   columns: true,
  //   skip_empty_lines: true
  // });

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