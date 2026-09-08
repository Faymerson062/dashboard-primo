import { supabase } from "./supabase";

export type Pedido = {
  id: number;
  cliente: string;
  produto: string;
  valor: number;
  status: string;
  criado_em: string;
};

export async function getPedidos(): Promise<Pedido[]> {
  const { data, error } = await supabase
    .from("pedidos")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar pedidos: ${error.message}`);
  }

  return (data ?? []) as Pedido[];
}
