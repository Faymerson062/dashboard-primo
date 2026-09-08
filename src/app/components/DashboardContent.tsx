"use client";

import { Users } from "lucide-react";
import type { Log } from "@/lib/logs";
import StatCard from "./StatCard";
import ClientesCard from "./ClientesCard";
import VisitantesCard from "./VisitantesCard";
import { usePresenca } from "@/lib/usePresenca";

export default function DashboardContent({
  loginsIniciais,
  visitasIniciais,
}: {
  loginsIniciais: Log[];
  visitasIniciais: number;
}) {
  const { online: usuariosOnline, emails: emailsOnline } = usePresenca(false);

  return (
    <main className="mx-auto max-w-[1600px] space-y-6 px-6 py-6">
      <section
        className="animate-fade-in-up grid grid-cols-1 gap-3 sm:grid-cols-2"
        style={{ animationDelay: "0.1s" }}
      >
        <VisitantesCard inicial={visitasIniciais} />
        <StatCard
          label="Usuários Online"
          value={String(usuariosOnline)}
          change="Ao vivo"
          positive
          icon={Users}
        />
      </section>

      <section className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <ClientesCard logsIniciais={loginsIniciais} emailsOnline={emailsOnline} />
      </section>
    </main>
  );
}
