import TopNav from "./components/TopNav";
import DashboardContent from "./components/DashboardContent";
import { getLogins, contarVisitas } from "@/lib/logs";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [logins, visitas] = await Promise.all([getLogins(), contarVisitas()]);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <DashboardContent loginsIniciais={logins} visitasIniciais={visitas} />
    </div>
  );
}
