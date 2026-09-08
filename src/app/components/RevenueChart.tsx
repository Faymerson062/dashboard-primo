"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";

export type PontoReceita = { month: string; value: number };

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export default function RevenueChart({ data = [] }: { data?: PontoReceita[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = data.length ? Math.max(...data.map((d) => d.value)) : 0;
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="relative h-full overflow-hidden rounded-xl glass p-5">
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Receita por Período</h3>
            <p className="text-xs text-muted-foreground">Pedidos pagos</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
            <TrendingUp className="h-3 w-3" />
            ao vivo
          </span>
        </div>

        <div className="mb-4">
          <span className="gradient-text text-2xl font-bold">
            {hovered !== null ? formatBRL(data[hovered].value) : formatBRL(total)}
          </span>
          {hovered !== null && (
            <span className="ml-2 text-xs text-muted-foreground">{data[hovered].month}</span>
          )}
        </div>

        {data.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            Sem dados de receita ainda.
          </div>
        ) : (
          <>
            <div className="flex h-24 items-end gap-1.5">
              {data.map((d, i) => (
                <div
                  key={d.month}
                  className="group flex flex-1 cursor-pointer flex-col items-center"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        hovered === i ? "bg-primary/40" : "bg-primary/20"
                      }`}
                      style={{ height: max ? `${(d.value / max) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between">
              {data.map((d) => (
                <span key={d.month} className="flex-1 text-center text-[10px] text-muted-foreground">
                  {d.month}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
