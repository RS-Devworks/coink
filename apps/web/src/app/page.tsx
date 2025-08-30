import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Shield, BarChart3, DollarSign, PieChart, Users } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Coink</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Recursos
            </a>
            <a href="#benefits" className="text-sm font-medium hover:underline underline-offset-4">
              Benefícios
            </a>
            <a href="#about" className="text-sm font-medium hover:underline underline-offset-4">
              Sobre
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button>Cadastrar</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-6" variant="secondary">
              Gerenciamento Financeiro Simplificado
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Controle suas finanças com
              <span className="text-primary"> Coink</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Categorize suas transações, acompanhe seus gastos e receba insights 
              valiosos sobre suas finanças pessoais. Tudo em uma plataforma simples e intuitiva.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Começar Grátis
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Conhecer Recursos
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Recursos Principais
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Ferramentas poderosas para gerenciar suas finanças de forma eficiente
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <PieChart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Categorização Inteligente</CardTitle>
                  <CardDescription>
                    Classifique suas transações em categorias personalizáveis para melhor organização
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Dashboard Completo</CardTitle>
                  <CardDescription>
                    Visualize um resumo completo de suas finanças em um painel personalizado
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Insights Financeiros</CardTitle>
                  <CardDescription>
                    Relatórios detalhados que ajudam a entender seus hábitos de gastos
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Segurança Garantida</CardTitle>
                  <CardDescription>
                    Seus dados financeiros protegidos com autenticação segura e criptografia
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Controle Total</CardTitle>
                  <CardDescription>
                    Adicione receitas e despesas facilmente com filtros avançados por data e categoria
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Interface Intuitiva</CardTitle>
                  <CardDescription>
                    Design moderno e responsivo que torna o gerenciamento financeiro simples
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section id="benefits" className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Por que escolher o Coink?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Transforme a forma como você gerencia suas finanças pessoais
                </p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <Card className="p-6">
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-xl">Simplicidade em Primeiro Lugar</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-muted-foreground mb-4">
                      Interface clean e intuitiva que não complica seu dia a dia. 
                      Adicione transações, visualize relatórios e acompanhe seus gastos em poucos cliques.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-primary rounded-full" />
                        <span className="text-sm">Cadastro rápido e fácil</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-primary rounded-full" />
                        <span className="text-sm">Navegação intuitiva</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-primary rounded-full" />
                        <span className="text-sm">Design responsivo</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="p-6">
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-xl">Controle Completo</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-muted-foreground mb-4">
                      Tenha visão completa de suas finanças com ferramentas que realmente fazem a diferença 
                      no seu planejamento financeiro.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-primary rounded-full" />
                        <span className="text-sm">Relatórios detalhados</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-primary rounded-full" />
                        <span className="text-sm">Categorias personalizáveis</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-primary rounded-full" />
                        <span className="text-sm">Filtros avançados</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Pronto para começar?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Junte-se a milhares de usuários que já transformaram sua vida financeira com o Coink
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-primary">
                Criar Conta Gratuita
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <DollarSign className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Coink</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Coink. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
