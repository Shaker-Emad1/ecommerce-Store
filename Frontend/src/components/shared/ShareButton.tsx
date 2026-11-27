import { useState } from "react";
import { Share2, Link2, Check } from "lucide-react";
import { GOLD } from "../../store/constants";

type Props = { id: number | string; name: string; price: number };

const WHATSAPP_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11 11 0 0 0 3.2 17.3L2 22l4.8-1.2A11 11 0 1 0 20.5 3.5Zm-8.4 17a9 9 0 0 1-4.6-1.3l-.3-.2-2.8.7.8-2.7-.2-.3a9 9 0 1 1 7.1 3.8Zm5-6.7c-.3-.1-1.6-.8-1.9-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6 0a7.4 7.4 0 0 1-3.7-3.2c-.3-.5.3-.5.8-1.5a.5.5 0 0 0 0-.5l-.9-2c-.2-.5-.5-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.800 11.800 0 0 0 4.500 4c1.700.7 2.300.8 3.100.7a2.600 2.600 0 0 0 1.700-1.200 2.100 2.100 0 0 0 .1-1.200c0-.1-.2-.2-.5-.3Z"/></svg>
);

export function ShareButton({ id, name, price }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/p/${id}`;
  const text = `${name} - ${price} ج.م | A.S Brand Store`;

  const share = async () => {
    if (typeof navigator.share === "function") {
      try { await navigator.share({ title: name, text, url }); return; } catch (e) { if ((e as Error).name === "AbortError") return; }
    }
    setOpen((o) => !o);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); } catch {
      const t = document.createElement("textarea"); t.value = url; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove();
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative inline-block">
      <button type="button" onClick={share} aria-label="مشاركة المنتج"
        className="flex items-center gap-2 rounded-xl px-4 text-sm font-bold"
        style={{ minHeight: "2.75rem", border: "1px solid rgba(212,175,55,0.35)", color: GOLD, background: "transparent" }}>
        <Share2 size={16} /> مشاركة
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-56 rounded-xl p-2" style={{ background: "#1a1a1a", border: "1px solid rgba(212,175,55,0.25)", insetInlineStart: 0 }}>
          <a href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 text-sm text-white hover:bg-white/10" style={{ minHeight: "2.75rem" }}>
            {WHATSAPP_ICON} واتساب
          </a>
          <button type="button" onClick={copy} className="flex w-full items-center gap-2 rounded-lg px-3 text-sm text-white hover:bg-white/10" style={{ minHeight: "2.75rem" }}>
            {copied ? <Check size={16} /> : <Link2 size={16} />} {copied ? "تم نسخ الرابط" : "نسخ الرابط"}
          </button>
        </div>
      )}
    </div>
  );
}
