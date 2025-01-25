export const metadata = {
  title: "OrderBook Dashboard",
  description: "An OrderBook visualization tool",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
