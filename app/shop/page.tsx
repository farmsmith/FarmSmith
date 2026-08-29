import type { Metadata } from "next";
import ShopClient from "./ShopClient";
import type { Product } from "@/types/product";

export const metadata: Metadata = {
  title: "Organic Shop — GI-Tagged Turmeric & Pure Spices",
  description:
    "Browse FarmSmith Foods' range of GI-tagged, batch-tested organic products. Handcrafted spices, cold-pressed oils, and farm-fresh essentials.",
};

async function getProducts(): Promise<Product[]> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/products`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ShopPage() {
  const products = await getProducts();
  return <ShopClient initialProducts={products} />;
}
