import type { Metadata } from "next";
import ShopClient from "./ShopClient";
import { getActiveProducts } from "@/lib/data/products";

export const revalidate = 60; // Incremental Static Regeneration every 60 seconds

export const metadata: Metadata = {
  title: "Organic Shop — GI-Tagged Turmeric & Pure Spices",
  description:
    "Browse FarmSmith Foods' range of GI-tagged, batch-tested organic products. Handcrafted spices, cold-pressed oils, and farm-fresh essentials.",
};

export default async function ShopPage() {
  const products = await getActiveProducts();
  return <ShopClient initialProducts={products} />;
}
