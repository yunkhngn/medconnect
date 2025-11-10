export function formatAddress(addressLike) {
  if (!addressLike) return "";
  if (typeof addressLike === "string") return addressLike;
  const addr = addressLike || {};
  if (addr.full && typeof addr.full === "string") return addr.full;
  const parts = [];
  if (addr.address_detail) parts.push(addr.address_detail);
  if (addr.ward_name) parts.push(addr.ward_name);
  if (addr.district_name) parts.push(addr.district_name);
  if (addr.province_name) parts.push(addr.province_name);
  return parts.filter(Boolean).join(", ");
}


