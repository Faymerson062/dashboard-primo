import type { Pedido } from "./pedidos";
import type { PontoReceita } from "@/app/components/RevenueChart";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export type Metrics = {
  receitaTotal: number;
  totalPedidos: number;
  clientesUnicos: number;
  taxaConversao: number;
  serieReceita: PontoReceita[];
  porStatus: { status: string; qtd: number; pct: number }[];
};

export function calcularMetrics(pedidos: Pedido[]): Metrics {
  const pagos = pedidos.filter((p) => p.status === "Pago");
  const receitaTotal = pagos.reduce((s, p) => s + Number(p.valor), 0);
  const totalPedidos = pedidos.length;
  const clientesUnicos = new Set(pedidos.map((p) => p.cliente)).size;
  const taxaConversao = totalPedidos ? (pagos.length / totalPedidos) * 100 : 0;

  const receitaPorMes = new Map<string, number>();
  for (const p of pagos) {
    const d = new Date(p.criado_em);
    const chave = `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
    receitaPorMes.set(chave, (receitaPorMes.get(chave) ?? 0) + Number(p.valor));
  }
  const serieReceita: PontoReceita[] = [...receitaPorMes.entries()].map(([month, value]) => ({
    month,
    value,
  }));

  const porStatus = ["Pago", "Pendente", "Cancelado"].map((status) => {
    const qtd = pedidos.filter((p) => p.status === status).length;
    const pct = totalPedidos ? Math.round((qtd / totalPedidos) * 100) : 0;
    return { status, qtd, pct };
  });

  return { receitaTotal, totalPedidos, clientesUnicos, taxaConversao, serieReceita, porStatus };
}
