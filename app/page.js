import OBConfigButton from '@/components/OBConfigButton';

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-primary-light/10 to-primary/5">
      <main className="flex flex-col gap-8 row-start-2 items-center w-full max-w-4xl glass-effect p-12 rounded-2xl">
        <h1 className="text-4xl font-bold mb-8 text-primary-dark">OrderBook Visualizer</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <OBConfigButton
            type="csv"
            title="Upload CSV"
            description="Start with your own data"
            icon="/file.svg"
          />
          <OBConfigButton
            type="fresh"
            title="Start Fresh"
            description="Begin with an empty orderbook"
            icon="/window.svg"
          />
          <OBConfigButton
            type="example"
            title="Example Data"
            description="Start with sample orders"
            icon="/globe.svg"
          />
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-sm text-primary-dark/70">
        <p>Built with Next.js and TailwindCSS</p>
      </footer>
    </div>
  );
}
