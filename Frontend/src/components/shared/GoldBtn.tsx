import { ReactNode } from "react";
import { GOLD, LIGHT_GOLD, BG } from "../../store/constants";

export function GoldBtn({
  children, onClick, variant = "solid", size = "md", className = "", type = "button", disabled = false
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const sizes = { sm: "px-4 py-2 text-sm", md: "px-6 py-3 text-sm", lg: "px-8 py-4 text-base" };
  const base = `inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 cursor-pointer active:scale-95 ${sizes[size]} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;
  if (variant === "solid")
    return <button disabled={disabled} type={type} onClick={onClick} className={base} style={{ background: `linear-gradient(135deg, ${GOLD} 0%, ${LIGHT_GOLD} 100%)`, color: BG }}>{children}</button>;
  if (variant === "outline")
    return <button disabled={disabled} type={type} onClick={onClick} className={base} style={{ border: `1.5px solid ${GOLD}`, color: GOLD }}>{children}</button>;
  return <button disabled={disabled} type={type} onClick={onClick} className={`${base} text-gray-400 hover:text-white`}>{children}</button>;
}
