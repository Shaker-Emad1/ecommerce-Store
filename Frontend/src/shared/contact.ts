import type { SettingDto } from "../services/settingService";

/**
 * Single source for the store's contact numbers.
 * Set PHONE / WHATSAPP below once the real numbers are confirmed, and every
 * place (top bar, footer, WhatsApp order buttons) switches together.
 * While they are null, behaviour is unchanged: the API settings are used, and
 * the footer keeps its old number.
 */
const PHONE: string | null = null;       // e.g. "01xxxxxxxxx"
const WHATSAPP: string | null = null;    // international digits, e.g. "201xxxxxxxxx"
const LEGACY_FOOTER_PHONE = "01275414542"; // remove once PHONE is set

const digits = (s: string) => s.replace(/\D/g, "");

export function getContact(settings?: SettingDto | null) {
  const phone = PHONE ?? settings?.contactPhone ?? LEGACY_FOOTER_PHONE;
  const footerPhone = PHONE ?? LEGACY_FOOTER_PHONE;
  const fromUrl = settings?.whatsappUrl ? digits(settings.whatsappUrl.split("?")[0]) : "";
  const whatsapp = WHATSAPP ?? (fromUrl || "201234567890");
  return { phone, footerPhone, whatsapp };
}

export const whatsappLink = (number: string, text: string) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
