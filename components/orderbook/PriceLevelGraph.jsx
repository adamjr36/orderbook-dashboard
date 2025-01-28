'use client';

import useOrderBookStore from '@/lib/store/useOrderBookStore';
import { Bar } from 'recharts';
import BaseOrderBookChart from './BaseOrderBookChart';

export default function PriceLevelGraph() {
  const orderBook = useOrderBookStore(state => state.orderBook);
  
  if (!orderBook) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No orderbook data available</p>
      </div>
    );
  }

  const askLevels = orderBook.getTopAskLevels(10);
  const bidLevels = orderBook.getTopBidLevels(10);

  // Transform data for the chart
  const bidChartData = bidLevels.reverse().map(level => ({
    price: level.price.toFixed(2),
    bidSize: level.totalSize,
    askSize: 0
  }));
  const askChartData = askLevels.map(level => ({
    price: level.price.toFixed(2),
    bidSize: 0,
    askSize: level.totalSize
  }));
  // Combine bid and ask data
  let chartData = [...bidChartData, ...askChartData];

  // Calculate spread price and standard deviation
  let spreadPrice = null;
  let minPrice = null;
  let maxPrice = null;

  if (askLevels.length > 0 && bidLevels.length > 0) {
    spreadPrice = ((askLevels[0].price + bidLevels[bidLevels.length - 1].price) / 2).toFixed(2);
    
    // Get all price levels
    const allPrices = [...bidLevels, ...askLevels].map(level => level.price);
    
    // Calculate mean
    const mean = allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;
    
    // Calculate standard deviation
    const variance = allPrices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / allPrices.length;
    const stdDev = Math.sqrt(variance);
    
    // Set domain to spread ± 1.5 standard deviations
    minPrice = parseFloat(spreadPrice) - (1.75 * stdDev);
    maxPrice = parseFloat(spreadPrice) + (1.75 * stdDev);

    chartData = chartData.filter(level => {
      return parseFloat(level.price) > minPrice && parseFloat(level.price) < maxPrice;
    });

    minPrice = chartData[0].price - (0.2 * stdDev);
    maxPrice = chartData[chartData.length - 1].price + (0.2 * stdDev);
  }

  const tooltipFormatter = (value, name) => {
    if (value === 0) return [];
    return [value.toLocaleString(), 'Volume'];
  };

  return (
    <BaseOrderBookChart
      title="Price Level Distribution"
      chartData={chartData}
      spreadPrice={spreadPrice}
      minPrice={minPrice}
      maxPrice={maxPrice}
      yAxisLabel="Volume"
      tooltipFormatter={tooltipFormatter}
    >
      <Bar
        dataKey="bidSize"
        stackId="stack"
        fill={'rgb(var(--bid-light))'}
        stroke={'rgb(var(--bid))'}
        strokeWidth={1}
        radius={[4, 4, 0, 0]}
        name="Volume"
      />
      <Bar
        dataKey="askSize"
        stackId="stack"
        fill={'rgb(var(--ask-light))'}
        stroke={'rgb(var(--ask))'}
        strokeWidth={1}
        radius={[4, 4, 0, 0]}
        name="Volume"
      />
    </BaseOrderBookChart>
  );
}