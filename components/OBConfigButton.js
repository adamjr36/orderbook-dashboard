'use client';

import Image from "next/image";
import { useRouter } from 'next/navigation';
import useOrderBookStore from '@/lib/store/useOrderBookStore';
import OrderBook from '@/lib/OrderBook';

import { processCSVFile } from "@/lib/csvProcessor";
import { readAndProcessCSV } from '@/lib/actions';

export default function OBConfigButton({ type, title, description, icon }) {
  const router = useRouter();
  const setOrderBook = useOrderBookStore((state) => state.setOrderBook);

  const handleClick = async () => {
    let orderBook;
    
    // Handle different initialization types
    switch (type) {
      case 'csv':
        // TODO
      case 'example':
        const records = await readAndProcessCSV('sample.csv');
        orderBook = processCSVFile(records)
        break;
      default:
        orderBook = new OrderBook();
        break;
    }

    console.log(orderBook);
    setOrderBook(orderBook);
    router.push('/dashboard');
  };

  return (
    <button 
      onClick={handleClick}
      className="flex flex-col items-center justify-center p-8 glass-effect border-2 border-primary/20 rounded-xl hover:border-primary-light elevated transition-all group"
    >
      <Image src={icon} alt={title} width={48} height={48} className="mb-4 opacity-80 group-hover:opacity-100" />
      <h2 className="text-xl font-semibold mb-2 text-primary-dark">{title}</h2>
      <p className="text-gray-600 text-center text-sm">{description}</p>
    </button>
  );
}