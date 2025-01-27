'use server'

import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import OrderBook from './orderbook/OrderBook';

export async function readAndProcessCSV(filename) {
  const filePath = path.join(process.cwd(), 'data', filename);
  const fileContent = await fs.readFile(filePath, 'utf8');
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });

  // Return the parsed records that we'll process on the client
  return records;
}