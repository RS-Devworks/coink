import React from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { AnimatedGridPattern } from "../magicui/animated-grid-pattern";
import { AuroraText } from "../magicui/aurora-text";

const Hero = () => {
  return (
    <section className="h-screen">
      {/* Wrapper: pattern is absolute background, content sits on top with z-10 */}
      <div className="relative h-full w-full overflow-hidden">
        {/* Background pattern (pointer-events-none so it doesn't block clicks) */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <AnimatedGridPattern
            numSquares={30}
            maxOpacity={0.5}
            duration={3}
            repeatDelay={1}
            className={cn(
              "[mask-image:radial-gradient(700px_circle_at_center,white,transparent)]",
              "inset-x-0 inset-y-[-50%] h-[200%] skew-y-12"
            )}
          />
        </div>

        {/* Content on top of pattern */}
        <div className="container mx-auto px-4 text-center relative z-10 flex flex-col items-center justify-center h-full">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Controle suas <AuroraText>finanças</AuroraText> com{" "}
            <AuroraText>Coink</AuroraText>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Categorize suas transações, acompanhe seus gastos e receba insights
            valiosos sobre suas finanças pessoais. Tudo em uma plataforma
            simples e intuitiva.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/register">Começar Grátis</Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto"
              asChild
            >
              <Link href="#features">Conhecer Recursos</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
