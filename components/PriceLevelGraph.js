'use client';

import useOrderBookStore from '@/lib/store/useOrderBookStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
  const maxBid = bidLevels.length > 0 ? bidLevels[0].price : 0;

  // Transform data for the chart
  const bidChartData = bidLevels.map(level => ({
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
  const chartData = [...bidChartData, ...askChartData];
  // const chartData = [...bidLevels, ...askLevels].map(level => ({
  //   price: level.price.toFixed(2),
  //   size: level.totalSize,
  //   type: level.price <= maxBid ? 'bid' : 'ask'
  // }));

  return (
    <div className="h-full flex flex-col">
      <div className="mb-1 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-blue-800">Price Level Distribution</h2>
        <div className="flex gap-4 text-sm">
        </div>
      </div>
      <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-lg p-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 25 }}>
            <XAxis
              dataKey="price"
              angle={-45}
              textAnchor="end"
              tick={{ fill: '#1e40af', fontSize: 12 }}
              label={{ value: 'Price Level', position: 'bottom', offset: 10, fill: '#1e40af' }}
            />
            <YAxis 
              tick={{ fill: '#1e40af', fontSize: 12 }}
              label={{ value: 'Volume', angle: -90, position: 'insideLeft', fill: '#1e40af', style: { textAnchor: 'middle' } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(30, 64, 175, 0.1)',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                padding: '0.75rem'
              }}
              formatter={(value, name) => {
                if (value === 0) return [];
                return [value.toLocaleString(), 'Volume'];
              }}
              labelStyle={{
                color: '#1e40af',
                fontWeight: '600',
                marginBottom: '0.25rem'
              }}
            />
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
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}