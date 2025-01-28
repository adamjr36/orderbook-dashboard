'use server'

import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export async function readAndProcessCSV(filename) {
  const filePath = path.join(process.cwd(), 'data', filename);
  const fileContent = await fs.readFile(filePath, 'utf8');
  
  return parseCSV(fileContent);
}

function parseCSV(csvString) {
  const records = parse(csvString, {
    columns: true,
    skip_empty_lines: true
  });

  return records;
}