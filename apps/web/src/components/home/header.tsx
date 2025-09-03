"use client";
import React from "react";
import Logo from "../logo";
import Link from "next/link";
import { Button } from "../ui/button";
import { getSession } from "@/lib/auth";

const Header = () => {
  const session = getSession();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Logo />
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="#features"
            className="text-sm font-medium hover:underline underline-offset-4"
            scroll={false}
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Recursos
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium hover:underline underline-offset-4"
            scroll={false}
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("how-it-works")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Como Funciona
          </Link>
          <Link
            href="#about"
            className="text-sm font-medium hover:underline underline-offset-4"
            scroll={false}
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("about")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Sobre
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          {!session ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Cadastrar</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
