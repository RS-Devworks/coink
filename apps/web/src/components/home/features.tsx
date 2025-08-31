import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUp,
  Shield,
  BarChart3,
  DollarSign,
  PieChart,
  Users,
} from "lucide-react";
import { BlurFade } from "../magicui/blur-fade";
import { constants } from "@/constants/landing-page";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard = ({ title, description, icon }: FeatureCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
};

const Features = () => {
  const features = [
    {
      title: "Categorização Inteligente",
      description:
        "Classifique suas transações em categorias personalizáveis para melhor organização",
      icon: <PieChart className="h-6 w-6 text-primary" />,
    },
    {
      title: "Dashboard Completo",
      description:
        "Visualize um resumo completo de suas finanças em um painel personalizado",
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
    },
    {
      title: "Insights Financeiros",
      description:
        "Relatórios detalhados que ajudam a entender seus hábitos de gastos",
      icon: <TrendingUp className="h-6 w-6 text-primary" />,
    },
    {
      title: "Segurança Garantida",
      description:
        "Seus dados financeiros protegidos com autenticação segura e criptografia",
      icon: <Shield className="h-6 w-6 text-primary" />,
    },
    {
      title: "Controle Total",
      description:
        "Adicione receitas e despesas facilmente com filtros avançados por data e categoria",
      icon: <DollarSign className="h-6 w-6 text-primary" />,
    },
    {
      title: "Interface Intuitiva",
      description:
        "Navegação fácil e acesso rápido às suas informações financeiras",
      icon: <Users className="h-6 w-6 text-primary" />,
    },
  ];

  const BLUR_FADE_TIME = constants.BLUR_FADE_TIME;

  return (
    <section id="features" className="bg-muted/50 h-screen flex items-center">
      <BlurFade
        className="container mx-auto px-4"
        delay={BLUR_FADE_TIME}
        duration={BLUR_FADE_TIME}
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Recursos Principais
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ferramentas poderosas para gerenciar suas finanças de forma
            eficiente
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <BlurFade
              key={index}
              delay={index * BLUR_FADE_TIME}
              duration={BLUR_FADE_TIME}
            >
              <FeatureCard
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            </BlurFade>
          ))}
        </div>
      </BlurFade>
    </section>
  );
};

export default Features;
