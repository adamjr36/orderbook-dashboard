'use client';

import useOrderBookStore from '@/lib/store/useOrderBookStore';

export default function LoadingOverlay() {
  const isLoading = useOrderBookStore(state => state.isLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-md">
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-primary font-medium">Loading...</p>
      </div>
    </div>
  );
}