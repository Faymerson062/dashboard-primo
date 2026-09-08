export type Geo = {
  cidade: string;
  estado: string;
  pais: string;
  paisCodigo: string;
  ip: string;
};

export function bandeiraDe(paisCodigo: string): string {
  const cc = (paisCodigo || "").trim().toUpperCase();
  if (cc.length !== 2 || !/^[A-Z]{2}$/.test(cc)) return "🌐";
  const base = 0x1f1e6;
  return String.fromCodePoint(
    base + (cc.charCodeAt(0) - 65),
    base + (cc.charCodeAt(1) - 65),
  );
}

const FALLBACK: Geo = { cidade: "Desconhecida", estado: "", pais: "", paisCodigo: "", ip: "" };

async function viaIpwho(): Promise<Geo | null> {
  const res = await fetch("https://ipwho.is/", { signal: AbortSignal.timeout(3000) });
  if (!res.ok) return null;
  const d = await res.json();
  if (!d || d.success === false) return null;
  return {
    cidade: d.city ?? "Desconhecida",
    estado: d.region ?? "",
    pais: d.country ?? "",
    paisCodigo: d.country_code ?? "",
    ip: d.ip ?? "",
  };
}

async function viaGeojs(): Promise<Geo | null> {
  const res = await fetch("https://get.geojs.io/v1/ip/geo.json", { signal: AbortSignal.timeout(3000) });
  if (!res.ok) return null;
  const d = await res.json();
  if (!d) return null;
  return {
    cidade: d.city ?? "Desconhecida",
    estado: d.region ?? "",
    pais: d.country ?? "",
    paisCodigo: d.country_code ?? "",
    ip: d.ip ?? "",
  };
}

export async function detectarGeo(): Promise<Geo> {
  for (const fonte of [viaIpwho, viaGeojs]) {
    try {
      const r = await fonte();
      if (r) return r;
    } catch {}
  }
  return FALLBACK;
}
