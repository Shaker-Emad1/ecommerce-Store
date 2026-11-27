import { Truck } from "lucide-react";
import { GOLD } from "../../store/constants";

export function FreeShippingBar({ total, threshold }: { total: number; threshold: number }) {
  const free = total > threshold;
  const pct = Math.min(100, Math.round((total / threshold) * 100));
  return (
    <div className="rounded-xl p-3" style={{ background: "rgba(201,162,74,0.06)", border: "1px solid rgba(201,162,74,0.15)" }}>
      <div className="flex items-center gap-2 text-xs mb-2" style={{ color: free ? "#22c55e" : GOLD }}>
        <Truck size={14} aria-hidden="true" />
        <span className="font-bold">{free ? "مبروك! شحن طلبك مجاني" : `باقي ${threshold - total + 1} ج.م ويبقى الشحن مجاني`}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: free ? "#22c55e" : `linear-gradient(90deg, ${GOLD}, #F0D878)` }} />
      </div>
    </div>
  );
}
