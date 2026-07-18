import CampaignClient from "@/components/CampaignClient";
import { getCampaignData } from "@/lib/db";

// Paksa halaman untuk selalu dinamis agar data donasi terbaru selalu ter-update
export const dynamic = "force-dynamic";

export default async function Home() {
  const initialData = await getCampaignData();
  return <CampaignClient initialData={initialData} />;
}
