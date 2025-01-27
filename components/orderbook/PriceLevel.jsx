'use client';

export default function PriceLevel({ level, side, maxSize }) {
  const isAsk = side === 'ask';
  
  return (
    <div className="grid grid-cols-[1fr,2fr,1fr] gap-4 text-right py-1.5 px-4 hover:bg-blue-50/5 backdrop-blur-md rounded-lg transition-all duration-300 group relative border border-blue-200/5 bg-blue-100/5">
      {/* Price */}
      <span className={`${isAsk ? 'text-ask' : 'text-bid'} font-semibold text-sm`}>
        {level.price.toFixed(2)}
      </span>

      {/* Volume Bar */}
      <div className="relative h-full flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`h-5 ${isAsk ? 'bg-ask/20 group-hover:bg-ask/30' : 'bg-bid/20 group-hover:bg-bid/30'} transition-all duration-300 rounded-md backdrop-blur-sm`}
            style={{ width: `${(level.totalSize / maxSize) * 100}%` }}
          />
        </div>
      </div>

      {/* Quantity */}
      <span className="text-primary font-medium text-sm">
        {level.totalSize.toLocaleString()}
      </span>
    </div>
  );
}