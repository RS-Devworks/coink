import React from "react";
import { BlurFade } from "../magicui/blur-fade";
import { constants } from "@/constants/landing-page";

const About = () => {
  return (
    <section id="about" className="overflow-hidden sm:grid sm:grid-cols-2 sm:items-center bg-secondary/20 h-screen py-20">
      <BlurFade
        delay={constants.BLUR_FADE_TIME}
        duration={constants.BLUR_FADE_TIME}
        inView
      >
        <img
          alt=""
          src="https://images.unsplash.com/photo-1484959014842-cd1d967a39cf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
          className="h-full w-full object-cover sm:h-[calc(100%_-_2rem)] sm:self-end rounded-r-4xl"
        />
      </BlurFade>
      <div className="p-8 md:p-12 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-xl text-center ltr:sm:text-left rtl:sm:text-right">
          <BlurFade
            delay={constants.BLUR_FADE_TIME}
            duration={constants.BLUR_FADE_TIME}
            inView
          >
            <h2 className="text-2xl font-bold md:text-3xl">Sobre nós</h2>
          </BlurFade>

          <BlurFade
            delay={constants.BLUR_FADE_TIME * 2}
            duration={constants.BLUR_FADE_TIME}
            inView
          >
            <p className="hidden md:mt-4 md:block text-gray-400">
              No Coink, nossa missão é empoderar você a tomar o controle total
              das suas finanças pessoais. Nós acreditamos que a gestão
              financeira deve ser simples, acessível e eficaz para todos. Com
              nossa plataforma intuitiva, você pode facilmente categorizar suas
              transações, acompanhar seus gastos e receber insights valiosos
              para melhorar sua saúde financeira. Junte-se a nós e comece sua
              jornada rumo a uma vida financeira mais organizada e tranquila!
            </p>
          </BlurFade>
        </div>
      </div>
    </section>
  );
};

export default About;
