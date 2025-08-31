import React from "react";
import { DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

const Header = () => {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Coink</span>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <a
            href="#features"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Recursos
          </a>
          <a
            href="#benefits"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Benefícios
          </a>
          <a
            href="#about"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
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
  );
};

export default Header;
