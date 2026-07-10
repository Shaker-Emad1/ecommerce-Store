import { useEffect } from "react";

const BRAND = "A.S Brand Store";

/**
 * Sets the browser tab title.
 * Usage: usePageTitle("Products") → "Products | A.S Brand Store"
 *        usePageTitle()           → "A.S Brand Store | Premium Electronics Store"
 */
export function usePageTitle(pageTitle?: string) {
  useEffect(() => {
    document.title = pageTitle
      ? `${pageTitle} | ${BRAND}`
      : `${BRAND} | Premium Electronics Store`;
  }, [pageTitle]);
}
