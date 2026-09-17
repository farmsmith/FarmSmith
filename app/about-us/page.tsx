import type { Metadata } from "next";
import AboutUsClient from "./AboutUsClient";

export const metadata: Metadata = {
  title: "About Us — Food Crafted with a Mother's Care",
  description:
    "Learn about FarmSmith Foods' mission to bring unadulterated, GI-tagged Indian spices directly from organic farms to kitchens across India.",
};

export default function AboutUsPage() {
  return <AboutUsClient />;
}

