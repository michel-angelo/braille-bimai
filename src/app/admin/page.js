import { cookies } from "next/headers";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;

  const correctPassword = process.env.ADMIN_PASSWORD || "admin123";
  const expectedToken = crypto.createHash("sha256").update(correctPassword).digest("hex");

  const isAuthenticated = sessionToken === expectedToken;

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  // Ambil data langsung dari Supabase secara aman di sisi server
  let initialDonations = [];
  try {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseUrl = rawUrl ? rawUrl.replace(/\/rest\/v1\/?$/, "") : "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error fetching admin data:", error);
      } else if (data) {
        // Serialisasi data agar aman dikirim ke Client Component
        initialDonations = JSON.parse(JSON.stringify(data));
      }
    }
  } catch (err) {
    console.error("Gagal mengambil data awal donasi di Server Component:", err);
  }

  return <AdminDashboard initialDonations={initialDonations} />;
}
