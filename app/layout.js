import Providers from "@/components/Providers";

export const metadata = {
  title: "OrderBook Dashboard",
  description: "An OrderBook visualization tool",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
