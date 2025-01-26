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
      className="flex flex-col items-center justify-center p-8 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
    >
      <Image src={icon} alt={title} width={48} height={48} className="mb-4" />
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600 text-center">{description}</p>
    </button>
  );
}