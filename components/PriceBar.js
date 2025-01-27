'use client';

export default function PriceBar({ price, height, type }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-end group">
      <div
        className={`w-full ${type === 'bid' ? 'bg-bid-light/20 group-hover:bg-bid-light/30' : 'bg-ask-light/20 group-hover:bg-ask-light/30'} transition-colors rounded-t-md backdrop-blur-sm`}
        style={{ height: `${height}%` }}
      />
      <span className="text-xs text-blue-600 mt-1 rotate-45 origin-left font-medium">
        {price.toFixed(2)}
      </span>
    </div>
  );
}