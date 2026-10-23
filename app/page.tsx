import { CtaSection } from "@/components/organisms/cta-section";
import { FeaturesSection } from "@/components/organisms/features-section";
import { Hero } from "@/components/organisms/hero";
import { KeyboardSection } from "@/components/organisms/keyboard-section";
import { LandingTemplate } from "@/components/templates/landing-template";

export default function Home() {
  return (
    <LandingTemplate>
      <Hero />
      <FeaturesSection />
      <KeyboardSection />
      <CtaSection />
    </LandingTemplate>
  );
}
