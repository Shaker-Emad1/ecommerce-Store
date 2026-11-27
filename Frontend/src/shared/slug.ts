export const categoryPath = (c: { id: number; name: string }) =>
  `/category/${c.id}/${encodeURIComponent(c.name.trim().replace(/\s+/g, "-"))}`;
