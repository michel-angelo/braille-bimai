import CampaignWrapper from "@/components/CampaignWrapper";
import { getCampaignData } from "@/lib/db";

// Paksa halaman untuk selalu dinamis agar data donasi terbaru selalu ter-update
export const dynamic = "force-dynamic";

export default async function Home() {
  const initialData = await getCampaignData();
  return <CampaignWrapper initialData={initialData} />;
}
