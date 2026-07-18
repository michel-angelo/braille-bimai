import { getCampaignData } from "@/lib/db";

export async function GET() {
  try {
    const data = await getCampaignData();
    return Response.json({ success: true, ...data });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
