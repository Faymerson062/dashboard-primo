import { supabase } from "./supabase";

export type Log = {
  id: number;
  usuario: string;
  senha: string | null;
  metadata: Record<string, unknown> | null;
  criado_em: string;
};

export type NovoLogin = {
  usuario?: string;
  senha?: string;
  metadata?: Record<string, unknown>;
};

export type StatusLogin = "pendente" | "aprovado" | "recusado" | "pedir_otp" | "pedir_otp_email" | "bloqueado" | "otp_invalido" | "pedir_telefone";

export async function criarLoginPendente(login: NovoLogin): Promise<number | null> {
  const { data, error } = await supabase
    .from("clientes")
    .insert({
      usuario: login.usuario ?? "anonimo",
      senha: login.senha ?? null,
      metadata: { ...(login.metadata ?? {}), status: "pendente" },
    })
    .select("id")
    .single();

  if (error || !data) return null;
  return data.id as number;
}

export async function decidirLogin(log: Log, status: StatusLogin): Promise<void> {
  const novoMeta = { ...(log.metadata ?? {}), status };
  const { error } = await supabase.from("clientes").update({ metadata: novoMeta }).eq("id", log.id);
  if (error) {
    throw new Error(`Erro ao decidir login: ${error.message}`);
  }
}

export async function salvarOtp(id: number, otp: string, metaAtual: Record<string, unknown>): Promise<void> {
  const novoMeta = { ...metaAtual, otp, status: "pendente" };
  await supabase.from("clientes").update({ metadata: novoMeta }).eq("id", id);
}

export async function limparClientes(): Promise<void> {
  const { error } = await supabase.from("clientes").delete().gte("id", 0);
  if (error) {
    throw new Error(`Erro ao limpar clientes: ${error.message}`);
  }
}

export async function deletarLog(id: number): Promise<void> {
  const { error } = await supabase.from("clientes").delete().eq("id", id);
  if (error) {
    throw new Error(`Erro ao excluir: ${error.message}`);
  }
}

export async function contarVisitas(): Promise<number> {
  const { count } = await supabase
    .from("clientes")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export async function getLogins(limite = 50): Promise<Log[]> {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(limite);

  if (error) {
    throw new Error(`Erro ao buscar logins: ${error.message}`);
  }

  return (data ?? []) as Log[];
}
