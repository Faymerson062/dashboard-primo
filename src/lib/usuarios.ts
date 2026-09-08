import { supabase } from "./supabase";

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  senha: string;
  funcao: string;
  criado_em: string;
};

export async function getUsuarios(): Promise<Usuario[]> {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .order("criado_em", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Usuario[];
}

export async function criarUsuario(nome: string, email: string, senha: string): Promise<void> {
  const { error } = await supabase
    .from("usuarios")
    .insert({ nome, email, senha, funcao: "Administrador" });
  if (error) throw new Error(error.message);
}

export async function trocarSenha(email: string, novaSenha: string): Promise<void> {
  const { error } = await supabase.from("usuarios").update({ senha: novaSenha }).eq("email", email);
  if (error) throw new Error(error.message);
}

export async function excluirUsuario(id: number): Promise<void> {
  const { error } = await supabase.from("usuarios").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
