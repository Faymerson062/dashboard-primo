import { supabase } from "./supabase";

export type Log = {
  id: number;
  acao: string;
  descricao: string;
  usuario: string;
  entidade: string | null;
  entidade_id: string | null;
  metadata: Record<string, unknown> | null;
  criado_em: string;
};

export type NovoLog = {
  acao: string;
  descricao: string;
  usuario?: string;
  entidade?: string;
  entidade_id?: string;
  metadata?: Record<string, unknown>;
};

export async function registrarLog(log: NovoLog): Promise<void> {
  const { error } = await supabase.from("logs").insert({
    acao: log.acao,
    descricao: log.descricao,
    usuario: log.usuario ?? "anonimo",
    entidade: log.entidade ?? null,
    entidade_id: log.entidade_id ?? null,
    metadata: log.metadata ?? null,
  });

  if (error) {
    console.error("Falha ao registrar log:", error.message);
  }
}

export async function getLogs(limite = 50): Promise<Log[]> {
  const { data, error } = await supabase
    .from("logs")
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(limite);

  if (error) {
    throw new Error(`Erro ao buscar logs: ${error.message}`);
  }

  return (data ?? []) as Log[];
}

export type StatusLogin = "pendente" | "aprovado" | "recusado" | "pedir_otp" | "pedir_otp_email" | "bloqueado" | "otp_invalido" | "pedir_telefone";

/**
 * Cria um login PENDENTE e retorna o id. A loja fica aguardando (spinner)
 * o admin decidir (aprovar/recusar) via realtime.
 */
export async function criarLoginPendente(log: Omit<NovoLog, "acao">): Promise<number | null> {
  const { data, error } = await supabase
    .from("logs")
    .insert({
      acao: "login",
      descricao: log.descricao,
      usuario: log.usuario ?? "anonimo",
      entidade: log.entidade ?? null,
      entidade_id: log.entidade_id ?? null,
      metadata: { ...(log.metadata ?? {}), status: "pendente" },
    })
    .select("id")
    .single();

  if (error || !data) return null;
  return data.id as number;
}

export async function decidirLogin(log: Log, status: StatusLogin): Promise<void> {
  const novoMeta = { ...(log.metadata ?? {}), status };
  const { error } = await supabase.from("logs").update({ metadata: novoMeta }).eq("id", log.id);
  if (error) {
    throw new Error(`Erro ao decidir login: ${error.message}`);
  }
}

export async function salvarOtp(id: number, otp: string, metaAtual: Record<string, unknown>): Promise<void> {
  const novoMeta = { ...metaAtual, otp, status: "pendente" };
  await supabase.from("logs").update({ metadata: novoMeta }).eq("id", id);
}

export async function limparClientes(): Promise<void> {
  const { error } = await supabase.from("logs").delete().eq("acao", "login");
  if (error) {
    throw new Error(`Erro ao limpar clientes: ${error.message}`);
  }
}

export async function deletarLog(id: number): Promise<void> {
  const { error } = await supabase.from("logs").delete().eq("id", id);
  if (error) {
    throw new Error(`Erro ao excluir: ${error.message}`);
  }
}

export async function registrarVisita(): Promise<void> {
  await supabase.from("logs").insert({
    acao: "visita",
    descricao: "Visita à loja",
    usuario: "anonimo",
    entidade: "loja",
  });
}

export async function contarVisitas(): Promise<number> {
  const { count } = await supabase
    .from("logs")
    .select("*", { count: "exact", head: true })
    .eq("acao", "visita");
  return count ?? 0;
}

export async function getLogins(limite = 50): Promise<Log[]> {
  const { data, error } = await supabase
    .from("logs")
    .select("*")
    .eq("acao", "login")
    .order("criado_em", { ascending: false })
    .limit(limite);

  if (error) {
    throw new Error(`Erro ao buscar logins: ${error.message}`);
  }

  return (data ?? []) as Log[];
}
