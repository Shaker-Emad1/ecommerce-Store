import { useEffect, useState } from "react";

const KEY = "asb_wishlist";
export const readWishlist = (): number[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };

export function useWishlist() {
  const [ids, setIds] = useState<number[]>(readWishlist);
  useEffect(() => {
    const sync = () => setIds(readWishlist());
    window.addEventListener("asb-wishlist", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("asb-wishlist", sync); window.removeEventListener("storage", sync); };
  }, []);
  return ids;
}
