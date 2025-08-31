import React from "react";
import { DollarSign } from "lucide-react";
import { BlurFade } from "../magicui/blur-fade";
import { constants } from "@/constants/landing-page";
import Logo from "../logo";

const Footer = () => {
  return (
    <footer className="bg-black">
      <BlurFade delay={constants.BLUR_FADE_TIME * 2} duration={constants.BLUR_FADE_TIME} inView>
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <Logo />
        </div>
      </BlurFade>
    </footer>
  );
};

export default Footer;
