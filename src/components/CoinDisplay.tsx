import type { ParsedCoin } from "../lib/coinParser";

interface CoinDisplayProps {
  coin: ParsedCoin;
}

export default function CoinDisplay({ coin }: CoinDisplayProps) {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-star-500/15 text-star-400 text-xs font-medium">
      <span>{coin.displayAmount}</span>
      <span className="text-star-500 font-bold">{coin.displayDenom}</span>
    </span>
  );
}
