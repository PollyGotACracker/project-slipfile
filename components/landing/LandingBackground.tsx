import { MeshNetworkBackground } from "@/components/landing/MeshNetworkBackground";

export function LandingBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="bg-landing-gradient absolute inset-0" />
      <MeshNetworkBackground />
    </div>
  );
}
