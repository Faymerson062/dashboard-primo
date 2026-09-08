import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  secondary?: string;
  icon: LucideIcon;
};

export default function StatCard({
  label,
  value,
  change,
  positive = true,
  secondary,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl glass p-3 transition-all duration-500 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100" />

      <div className="relative flex items-center gap-2.5">
        <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-2 transition-all duration-500 group-hover:scale-110 group-hover:from-primary/20 group-hover:to-primary/10">
          <Icon className="h-3.5 w-3.5 text-primary transition-transform duration-500 group-hover:rotate-12" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
            {label}
          </p>
          <div className="flex flex-wrap items-baseline gap-1.5">
            <p className="truncate text-lg font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
              {value}
            </p>
            {change && (
              <span
                className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                  positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                }`}
              >
                {positive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                {change}
              </span>
            )}
            {secondary && (
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500">
                {secondary}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  );
}
