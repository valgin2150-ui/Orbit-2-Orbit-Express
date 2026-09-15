import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SpaceStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const fallbackStocks: SpaceStock[] = [
  { symbol: "RKLB", name: "Rocket Lab", price: 28.45, change: 1.23, changePercent: 4.52 },
  { symbol: "LUNR", name: "Intuitive Machines", price: 18.92, change: 0.87, changePercent: 4.82 },
  { symbol: "ASTS", name: "AST SpaceMobile", price: 24.15, change: -0.45, changePercent: -1.83 },
  { symbol: "PL", name: "Planet Labs", price: 4.28, change: 0.12, changePercent: 2.88 },
  { symbol: "SPCE", name: "Virgin Galactic", price: 6.75, change: -0.32, changePercent: -4.53 },
  { symbol: "RDW", name: "Redwire", price: 12.88, change: 0.65, changePercent: 5.31 },
  { symbol: "BKSY", name: "BlackSky", price: 5.62, change: 0.18, changePercent: 3.31 },
  { symbol: "VSAT", name: "Viasat", price: 11.45, change: 0.28, changePercent: 2.51 },
  { symbol: "IRDM", name: "Iridium", price: 32.56, change: 0.45, changePercent: 1.40 },
  { symbol: "SATL", name: "Satellogic", price: 3.12, change: -0.15, changePercent: -4.59 },
];

export function StockTicker() {
  const [offset, setOffset] = useState(0);
  
  const { data } = useQuery<{ quotes: SpaceStock[] }>({
    queryKey: ['/api/stocks'],
    refetchInterval: 60000,
    staleTime: 30000,
  });
  
  const stocks = data?.quotes && data.quotes.length > 0 ? data.quotes : fallbackStocks;
  const isLive = data?.quotes && data.quotes.length > 0 && data.quotes[0].price > 0;
  
  const duplicatedStocks = [...stocks, ...stocks];

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => {
        const newOffset = prev - 1;
        if (Math.abs(newOffset) >= stocks.length * 180) {
          return 0;
        }
        return newOffset;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [stocks.length]);

  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="w-full bg-gray-50 border-y border-gray-200">
      <button 
        className="md:hidden w-full flex items-center justify-center gap-2 py-1.5 text-xs text-gray-500 hover:text-gray-700"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <>
            <TrendingUp className="w-3 h-3" />
            <span>Show Market Ticker</span>
          </>
        ) : (
          <span>Hide Ticker</span>
        )}
      </button>
      <div className={`overflow-hidden ${collapsed ? 'hidden md:block' : 'block'}`}>
        <div className="relative py-2">
          <motion.div
            className="flex gap-8 whitespace-nowrap"
            style={{ x: offset }}
          >
            {duplicatedStocks.map((stock, idx) => (
              <div
                key={`${stock.symbol}-${idx}`}
                className="flex items-center gap-2 px-3 py-1 text-sm"
                data-testid={`stock-${stock.symbol}-${idx}`}
              >
                <span className="font-semibold text-gray-900">{stock.symbol}</span>
                <span className="text-gray-500">{stock.name}</span>
                <span className="font-mono text-gray-900">${stock.price.toFixed(2)}</span>
                <span
                  className={`flex items-center gap-0.5 font-mono ${
                    stock.change >= 0 ? "text-green-600" : "text-[#e3000f]"
                  }`}
                >
                  {stock.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {stock.change >= 0 ? "+" : ""}
                  {stock.changePercent.toFixed(2)}%
                </span>
              </div>
            ))}
          </motion.div>
          {!isLive && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-gray-50 px-2">
              Sample data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StockTicker;
