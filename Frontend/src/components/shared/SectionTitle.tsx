import { ArrowLeft } from "lucide-react";
import { GOLD } from "../../store/constants";

export function SectionTitle({ title, sub, action, onAction }: { title: string; sub?: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-white">{title}</h2>
        {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
        <div className="mt-2.5 h-0.5 w-14 rounded-full" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
      </div>
      {action && (
        <button onClick={onAction} className="text-sm font-semibold flex items-center gap-1.5 hover:opacity-70 transition-opacity" style={{ color: GOLD }}>
          {action}
          <ArrowLeft size={15} />
        </button>
      )}
    </div>
  );
}
