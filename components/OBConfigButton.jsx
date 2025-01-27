'use client';

import Image from "next/image";
import { useRouter } from 'next/navigation';
import useOrderBookStore from '@/lib/store/useOrderBookStore';
import OrderBook from '@/lib/orderbook/OrderBook';

import { processCSVFile } from "@/lib/utils/csvProcessor";
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
      className="flex flex-col items-center justify-center p-8 bg-primary hover:bg-primary-dark backdrop-blur-sm border-2 border-primary-light/90 rounded-xl hover:border-primary-light elevated transition-all duration-300 group shadow-lg hover:shadow-primary/20"
    >
      <Image src={icon} alt={title} width={48} height={48} className="mb-4 brightness-[2] group-hover:brightness-[2.2] transition-all duration-300" />
      <h2 className="text-lg font-semibold mb-2 text-white/90 group-hover:text-white/50">{title}</h2>
      <p className="text-white/90 text-center text-sm group-hover:text-white">{description}</p>
    </button>
  );
}