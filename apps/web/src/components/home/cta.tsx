import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BlurFade } from "../magicui/blur-fade";
import { constants } from "@/constants/landing-page";
import Image from "next/image";

const Cta = () => {
  return (
    <section className="overflow-hidden bg-card sm:grid sm:grid-cols-2 sm:items-center py-20">
      <BlurFade
        delay={constants.BLUR_FADE_TIME}
        duration={constants.BLUR_FADE_TIME}
        inView
      >
        <div className="p-8 md:p-12 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-xl text-center ltr:sm:text-left rtl:sm:text-right">
            <h2 className="text-2xl font-bold md:text-3xl">
              Gerencie sua vida financeira conosco
            </h2>

            <p className="hidden md:mt-4 md:block text-gray-400">
              Simplifique suas finanças pessoais. Cadastre-se grátis e comece a
              economizar hoje mesmo!
            </p>

            <div className="mt-4 md:mt-8">
              <Button asChild className="">
                <Link
                  href="/register"
                >
                  Cadastre-se 
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </BlurFade>

      <BlurFade
        delay={constants.BLUR_FADE_TIME * 2}
        duration={constants.BLUR_FADE_TIME}
        inView
      >
        <Image
          alt=""
          src="/technical-analysis-chart-1.jpg"
          width={800}
          height={600}
          className="h-full w-full object-cover sm:h-[calc(100%_-_2rem)] sm:self-end rounded-l-4xl"
        />
      </BlurFade>
    </section>
  );
};

export default Cta;
