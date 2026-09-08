"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const CANAL = "presenca-global";

type Resultado = {
  online: number;
  emails: Set<string>;
};

/**
 * Presença em tempo real no canal global.
 * - rastrear: marca esta aba como presente. Se `email` for passado, identifica
 *   o cliente por email (para o dashboard saber quem está online).
 * - O dashboard chama com rastrear=false só para observar.
 */
export function usePresenca(rastrear: boolean, email?: string): Resultado {
  const [online, setOnline] = useState(0);
  const [emails, setEmails] = useState<Set<string>>(new Set());

  useEffect(() => {
    const id = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    const channel = supabase.channel(CANAL, {
      config: { presence: { key: id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const chaves = Object.keys(state);
        const setEmailsOnline = new Set<string>();
        for (const k of chaves) {
          for (const p of state[k] as Array<{ email?: string }>) {
            if (p.email) setEmailsOnline.add(p.email.toLowerCase());
          }
        }
        setOnline(chaves.length);
        setEmails(setEmailsOnline);
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") return;
        if (rastrear) {
          await channel.track({ online_at: new Date().toISOString(), email: email ?? null });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [rastrear, email]);

  return { online, emails };
}
