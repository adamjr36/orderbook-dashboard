'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';

export default function BaseOrderBookChart({
  title,
  chartData,
  spreadPrice,
  minPrice,
  maxPrice,
  yAxisLabel,
  tooltipFormatter,
  children
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-blue-800">{title}</h2>
        <div className="flex gap-4 text-sm">
        </div>
      </div>
      <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-lg p-2">
        <ResponsiveContainer width="100%" height="100%" debounce={1}>
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 35 }}>
            <XAxis
              dataKey="price"
              type="number"
              domain={[minPrice || 'dataMin', maxPrice || 'dataMax']}
              angle={-45}
              textAnchor="end"
              tick={{ fill: '#1e40af', fontSize: 12 }}
              label={{ value: 'Price Level', position: 'bottom', offset: 10, fill: '#1e40af' }}
              scale="linear"
              ticks={chartData.map(d => parseFloat(d.price))}
            />
            <YAxis 
              tick={{ fill: '#1e40af', fontSize: 12 }}
              label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#1e40af', style: { textAnchor: 'middle' } }}              
            />
            {spreadPrice && (
              <ReferenceLine
                x={parseFloat(spreadPrice)}
                stroke="#1e40af"
                strokeDasharray="3 3"
                label={{
                  value: `${spreadPrice}`,
                  position: 'top',
                  fill: '#1e40af'
                }}
              />
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(30, 64, 175, 0.1)',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                padding: '0.75rem'
              }}
              formatter={tooltipFormatter}
              labelStyle={{
                color: '#1e40af',
                fontWeight: '600',
                marginBottom: '0.25rem'
              }}
            />
            {children}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}