'use client';

export default function OrderTabs({ activeTab, setActiveTab, lookupResult, clearLookupResult }) {
  const getTabStyle = (tab) => {
    return `px-4 py-1 text-sm font-medium ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-blue-600 bg-white/50 hover:bg-white/70'} rounded-lg border ${activeTab === tab ? 'border-blue-600' : 'border-blue-200 hover:border-blue-400'} transition-colors duration-200`;
  };

  return (
    <div className="flex gap-2 mb-4">
      <button
        className={getTabStyle('make')}
        onClick={() => setActiveTab('make')}
      >
        Make Order
      </button>
      <button
        className={getTabStyle('remove')}
        onClick={() => setActiveTab('remove')}
      >
        Remove Order
      </button>
      <button
        className={getTabStyle('lookup')}
        onClick={() => setActiveTab('lookup')}
      >
        Lookup Order
      </button>
      {lookupResult && (
        <button
          className={`${getTabStyle('result')} relative pr-8`}
          onClick={() => setActiveTab('result')}
        >
          Lookup Result
          <span
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab('lookup');
            //   lookupResult.onClose?.();
              clearLookupResult();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm hover:text-blue-800 transition-colors duration-200"
          >
            ×
          </span>
        </button>
      )}
    </div>
  );
}