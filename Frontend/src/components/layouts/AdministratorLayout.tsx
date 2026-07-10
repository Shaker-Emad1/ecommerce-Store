import { ReactNode, useEffect } from "react";
import { Toaster } from "sonner";

export function AdministratorLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return <>{children}<Toaster richColors theme="dark" /></>;
}
