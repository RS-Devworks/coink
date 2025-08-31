import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BlurFade } from "../magicui/blur-fade";
import { constants } from "@/constants/landing-page";
import { Safari } from "../magicui/safari";
import { User, Lock, ChartBar, BadgeDollarSign, ChartLine } from "lucide-react";

interface StepProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Step = ({ title, description, icon }: StepProps) => {
  return (
    <Card className="w-full flex justify-start">
      <CardContent className="h-full w-full flex items-center gap-8">
        <div className="">{icon}</div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardContent>
    </Card>
  );
};

const HowItWorks = () => {
  const BLUR_FADE_TIME = constants.BLUR_FADE_TIME;

  const steps = [
    {
      title: "Crie a sua conta",
      description:
        "Para ter acesso as funcionalidades do Coink, precisa de poucos dados, apenas o seu nome, email e uma senha.",
      icon: <User />,
    },
    {
      title: "Adicione suas transações",
      description: "Adicione despesas ou receitas com seus diferentes métodos de pagamento de forma rápida e fácil.",
      icon: <BadgeDollarSign />,
    },
    {
      title: "Acompanhe seus resultados",
      description: "Visualize suas despesas em um dashboard",
      icon: <ChartLine />,
    },
  ];

  return (
    <section id="how-it-works" className="w-full h-screen p-20">
      <BlurFade className="w-full h-full flex flex-col items-center justify-center mx-auto" delay={BLUR_FADE_TIME} duration={BLUR_FADE_TIME}>
        <div className="text-center mb-16">
          <p className="text-lg text-muted-foreground">COMO FUNCIONA</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Apenas 3 passos para começar
          </h2>
        </div>

        <div className="grid w-full h-full grid-cols-5 gap-8 items-center">
          <div className="col-span-2 flex flex-col gap-8 items-center justify-center h-full">
            {steps.map((step, index) => (
              <BlurFade
          key={index}
          delay={BLUR_FADE_TIME * (index + 2)}
          duration={BLUR_FADE_TIME}
          className="w-full"
              >
          <Step
            title={step.title}
            description={step.description}
            icon={step.icon}
          />
              </BlurFade>
            ))}
          </div>
          <BlurFade
            delay={BLUR_FADE_TIME * 3}
            duration={BLUR_FADE_TIME}
            className="col-span-3 w-full h-full flex items-center justify-center"
          >
            <Safari url={constants.SAFARI_MOCK_URL} className="w-11/12" />
          </BlurFade>
        </div>
      </BlurFade>
    </section>
  );
};

export default HowItWorks;
