import Header from "@/components/home/header";
import Hero from "@/components/home/hero";
import Features from "@/components/home/features";
import Benefits from "@/components/home/how-it-works";
import Cta from "@/components/home/cta";
import About from "@/components/home/about";
import HowItWorks from "@/components/home/how-it-works";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <About />
        <Cta />
      </main>
    </div>
  );
}
