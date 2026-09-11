import type { Metadata } from "next";
import { LandingView } from "@/components/landing/LandingView";

export const metadata: Metadata = {
  title: "slipfile | 링크로 여는 공유 공간",
};

export default function Home() {
  return <LandingView />;
}
