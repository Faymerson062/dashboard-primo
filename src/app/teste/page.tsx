"use client";

import { useEffect, useState } from "react";
import { Search, Heart, ShoppingCart, Star, Menu, User } from "lucide-react";
import { PRODUTOS, CATEGORIAS, type ProdutoMock } from "@/lib/mock";
import { usePresenca } from "@/lib/usePresenca";
import { registrarVisita } from "@/lib/logs";

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Loja() {
  usePresenca(true);

  useEffect(() => {
    registrarVisita();
  }, []);

  const [categoria, setCategoria] = useState("Todos");
  const [carrinho, setCarrinho] = useState<ProdutoMock[]>([]);
  const [busca, setBusca] = useState("");

  const produtosFiltrados = PRODUTOS.filter(
    (p) =>
      (categoria === "Todos" || p.categoria === categoria) &&
      p.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  const totalCarrinho = carrinho.reduce((s, p) => s + p.preco, 0);

  function adicionar(produto: ProdutoMock) {
    setCarrinho((c) => [...c, produto]);
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <button className="lg:hidden">
            <Menu className="h-5 w-5 text-slate-600" />
          </button>
          <a href="#" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
              T
            </div>
            <span className="text-lg font-bold tracking-tight">TechStore</span>
          </a>

          <nav className="ml-6 hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
            <a href="#" className="hover:text-indigo-600">Início</a>
            <a href="#produtos" className="hover:text-indigo-600">Produtos</a>
            <a href="#" className="hover:text-indigo-600">Ofertas</a>
            <a href="#" className="hover:text-indigo-600">Contato</a>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-48 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white md:w-64"
              />
            </div>
            <a
              href="/teste/login"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">Entrar</span>
            </a>
            <button className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100">
              <Heart className="h-5 w-5" />
            </button>
            <button className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100">
              <ShoppingCart className="h-5 w-5" />
              {carrinho.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                  {carrinho.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 md:py-20">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
            🔥 Ofertas da Semana
          </span>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
            Tecnologia que transforma o seu dia a dia
          </h1>
          <p className="max-w-xl text-lg text-indigo-100">
            Os melhores eletrônicos com até 40% de desconto. Frete grátis para todo o Brasil.
          </p>
          <a
            href="#produtos"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
          >
            Ver produtos
          </a>
        </div>
      </section>

      <section id="produtos" className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Nossos Produtos</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoria(cat)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  categoria === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {produtosFiltrados.length === 0 ? (
          <p className="py-12 text-center text-slate-400">Nenhum produto encontrado.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {produtosFiltrados.map((p) => (
              <div
                key={p.id}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-lg"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={p.imagem}
                    alt={p.nome}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  {p.precoAntigo && (
                    <span className="absolute left-2 top-2 rounded-md bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                      -{Math.round((1 - p.preco / p.precoAntigo) * 100)}%
                    </span>
                  )}
                  <button className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-slate-600 opacity-0 transition group-hover:opacity-100 hover:text-rose-500">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-xs text-slate-400">{p.categoria}</p>
                  <h3 className="mt-0.5 truncate font-medium text-slate-900">{p.nome}</h3>
                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-slate-700">{p.avaliacao}</span>
                    <span>· {p.vendidos.toLocaleString("pt-BR")} vendidos</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-slate-900">{formatBRL(p.preco)}</span>
                    {p.precoAntigo && (
                      <span className="text-xs text-slate-400 line-through">{formatBRL(p.precoAntigo)}</span>
                    )}
                  </div>
                  <button
                    onClick={() => adicionar(p)}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Adicionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {carrinho.length > 0 && (
        <div className="sticky bottom-4 z-40 mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between rounded-xl bg-slate-900 px-5 py-3 text-white shadow-xl">
            <span className="text-sm">
              <strong>{carrinho.length}</strong> {carrinho.length === 1 ? "item" : "itens"} no carrinho
            </span>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold">{formatBRL(totalCarrinho)}</span>
              <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold transition hover:bg-indigo-700">
                Finalizar compra
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-12 border-t border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 md:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">T</div>
              <span className="font-bold">TechStore</span>
            </div>
            <p className="text-sm text-slate-500">A sua loja de tecnologia com os melhores preços.</p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Loja</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-indigo-600">Produtos</a></li>
              <li><a href="#" className="hover:text-indigo-600">Ofertas</a></li>
              <li><a href="#" className="hover:text-indigo-600">Novidades</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Suporte</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-indigo-600">Contato</a></li>
              <li><a href="#" className="hover:text-indigo-600">Trocas</a></li>
              <li><a href="#" className="hover:text-indigo-600">Entrega</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Empresa</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-indigo-600">Sobre</a></li>
              <li><a href="#" className="hover:text-indigo-600">Privacidade</a></li>
              <li><a href="#" className="hover:text-indigo-600">Termos</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
          © 2026 TechStore. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
