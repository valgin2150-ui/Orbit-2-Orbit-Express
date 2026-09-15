import type { LauncherRecord } from "@/lib/launcherData";
import { formatLastReviewed } from "@/lib/launcherData";

export function LaunchMarketReviewStamp({ launchers }: { launchers: LauncherRecord[] }) {
  return (
    <p className="text-xs text-gray-500">
      Launch market data last reviewed: {formatLastReviewed(launchers)}
    </p>
  );
}