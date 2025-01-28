'use client';

import Image from "next/image";
import { useRouter } from 'next/navigation';
import useOrderBookStore from '@/lib/store/useOrderBookStore';
import OrderBook from '@/lib/orderbook/OrderBook';

import { processCSVFile } from "@/lib/utils/csvProcessor";
import { parse } from 'csv-parse/sync';
import { sample } from "@/data/sample";

export default function OBConfigButton({ type, title, description, icon }) {
  const router = useRouter();
  const setOrderBook = useOrderBookStore((state) => state.setOrderBook);
  const setLoading = useOrderBookStore((state) => state.setLoading);

  const handleClick = async () => {
    try {
      setLoading(true);
      let orderBook;
      
      // Handle different initialization types
      switch (type) {
        case 'csv':
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = '.csv';
          
          try {
            const file = await new Promise((resolve, reject) => {
              fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) resolve(file);
                else reject(new Error('No file selected'));
              };
              fileInput.click();
            });

            const text = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target.result);
              reader.onerror = () => reject(new Error('Failed to read file'));
              reader.readAsText(file);
            });

            const records = parse(text, {
              columns: true,
              skip_empty_lines: true,
            });
            orderBook = processCSVFile(records);
          } catch (error) {
            console.error('Error processing CSV:', error);
            throw new Error('Failed to process CSV file. Please ensure the file format is correct.');
          }
          break;
        case 'example':
          const records = sample;
          orderBook = processCSVFile(records);
          break;
        default:
          orderBook = new OrderBook();
          break;
      }

      router.push('/dashboard');
      setOrderBook(orderBook);
    } catch (error) {
      console.error('Error initializing orderbook:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleClick}
      className="flex flex-col items-center justify-center p-8 bg-primary hover:bg-primary-dark backdrop-blur-sm border-2 border-primary-light/90 rounded-xl hover:border-primary-light elevated transition-all duration-300 group shadow-lg hover:shadow-primary/20"
      disabled={useOrderBookStore((state) => state.isLoading)}
    >
      <Image src={icon} alt={title} width={48} height={48} className="mb-4 brightness-[2] group-hover:brightness-[2.2] transition-all duration-300" />
      <h2 className="text-lg font-semibold mb-2 text-white/90 group-hover:text-white/50">{title}</h2>
      <p className="text-white/90 text-center text-sm group-hover:text-white">{description}</p>
    </button>
  );
}