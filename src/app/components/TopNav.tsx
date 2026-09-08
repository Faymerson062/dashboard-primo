"use client";

import { useEffect, useState } from "react";
import {
  Globe,
  LayoutDashboard,
  Users,
  ChevronDown,
  UserPlus,
  KeyRound,
  UserCog,
  X,
  Trash2,
} from "lucide-react";
import { criarUsuario, trocarSenha, excluirUsuario, getUsuarios, type Usuario } from "@/lib/usuarios";
import { supabase } from "@/lib/supabase";

const menuItems = [{ icon: LayoutDashboard, label: "Dashboard", active: true }];

type Modal = "cadastrar" | "senha" | "gerenciar" | null;

export default function TopNav() {
  const [usersOpen, setUsersOpen] = useState(false);
  const [modal, setModal] = useState<Modal>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [emailSenha, setEmailSenha] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  useEffect(() => {
    if (modal !== "gerenciar") return;
    getUsuarios().then(setUsuarios).catch(() => {});
    const canal = supabase
      .channel("usuarios-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "usuarios" }, () => {
        getUsuarios().then(setUsuarios).catch(() => {});
      })
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, [modal]);

  function abrir(m: Modal) {
    setMsg(null);
    setNome("");
    setEmail("");
    setSenha("");
    setEmailSenha("");
    setNovaSenha("");
    setUsersOpen(false);
    setModal(m);
  }

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await criarUsuario(nome.trim(), email.trim(), senha);
      setMsg("Usuário cadastrado com sucesso.");
      setNome("");
      setEmail("");
      setSenha("");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erro ao cadastrar.");
    }
  }

  async function handleTrocarSenha(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await trocarSenha(emailSenha.trim(), novaSenha);
      setMsg("Senha alterada com sucesso.");
      setEmailSenha("");
      setNovaSenha("");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erro ao trocar senha.");
    }
  }

  async function handleExcluir(id: number) {
    try {
      await excluirUsuario(id);
    } catch {}
  }

  return (
    <>
      <header className="sticky top-0 z-50 h-14 border-b border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-1">
            <a href="#" className="mr-2 flex shrink-0 items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                <Globe className="h-4 w-4 text-primary-foreground" />
              </div>
            </a>

            <nav className="hidden items-center gap-1 md:flex">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href="#"
                  className={`relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    item.active ? "text-primary" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${item.active ? "text-primary" : ""}`} />
                  <span>{item.label}</span>
                  {item.active && (
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary" />
                  )}
                </a>
              ))}

              <div className="relative">
                <button
                  onClick={() => setUsersOpen((v) => !v)}
                  onBlur={() => setTimeout(() => setUsersOpen(false), 150)}
                  className="relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary/50 hover:text-foreground"
                >
                  <Users className="h-4 w-4" />
                  <span>Usuários</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                {usersOpen && (
                  <div className="absolute left-0 top-full mt-1 w-56 rounded-lg glass p-1 shadow-xl">
                    <p className="px-2 py-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                      Gestão de Usuários
                    </p>
                    <div className="my-1 h-px bg-border/50" />
                    <button
                      onClick={() => abrir("cadastrar")}
                      className="flex w-full items-center rounded px-2 py-1.5 text-sm text-foreground hover:bg-secondary/50"
                    >
                      <UserPlus className="mr-2 h-4 w-4 text-primary" /> Cadastrar Usuário
                    </button>
                    <button
                      onClick={() => abrir("senha")}
                      className="flex w-full items-center rounded px-2 py-1.5 text-sm text-foreground hover:bg-secondary/50"
                    >
                      <KeyRound className="mr-2 h-4 w-4 text-amber-500" /> Trocar Senha
                    </button>
                    <div className="my-1 h-px bg-border/50" />
                    <button
                      onClick={() => abrir("gerenciar")}
                      className="flex w-full items-center rounded px-2 py-1.5 text-sm text-foreground hover:bg-secondary/50"
                    >
                      <UserCog className="mr-2 h-4 w-4 text-muted-foreground" /> Gerenciar Usuários
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {modal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={() => setModal(null)}>
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">
                {modal === "cadastrar" && "Cadastrar Usuário"}
                {modal === "senha" && "Trocar Senha"}
                {modal === "gerenciar" && "Gerenciar Usuários"}
              </h2>
              <button onClick={() => setModal(null)} className="rounded p-1 text-muted-foreground hover:bg-secondary/50">
                <X className="h-4 w-4" />
              </button>
            </div>

            {msg && (
              <div className="mb-3 rounded-lg bg-secondary/50 px-3 py-2 text-xs text-foreground">{msg}</div>
            )}

            {modal === "cadastrar" && (
              <form onSubmit={handleCadastrar} className="space-y-3">
                <input
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome"
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
                />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
                />
                <input
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Senha"
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
                />
                <button className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
                  Cadastrar
                </button>
              </form>
            )}

            {modal === "senha" && (
              <form onSubmit={handleTrocarSenha} className="space-y-3">
                <input
                  required
                  type="email"
                  value={emailSenha}
                  onChange={(e) => setEmailSenha(e.target.value)}
                  placeholder="Email do usuário"
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
                />
                <input
                  required
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Nova senha"
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
                />
                <button className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
                  Alterar senha
                </button>
              </form>
            )}

            {modal === "gerenciar" && (
              <div className="space-y-2">
                {usuarios.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">Nenhum usuário cadastrado.</p>
                ) : (
                  usuarios.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{u.nome}</p>
                        <p className="truncate text-xs text-muted-foreground">{u.email} · {u.funcao}</p>
                      </div>
                      <button
                        onClick={() => handleExcluir(u.id)}
                        className="rounded p-1.5 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
