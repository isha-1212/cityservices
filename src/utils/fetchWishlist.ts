// utils/fetchWishlist.ts
export async function fetchWishlist(token: string) {
  const response = await fetch("/api/wishlist", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Failed to fetch wishlist");
  return response.json();
}
