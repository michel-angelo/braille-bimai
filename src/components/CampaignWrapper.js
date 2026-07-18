"use client";

import dynamic from "next/dynamic";

const CampaignClient = dynamic(() => import("./CampaignClient"), {
  ssr: false,
});

export default function CampaignWrapper({ initialData }) {
  return <CampaignClient initialData={initialData} />;
}
