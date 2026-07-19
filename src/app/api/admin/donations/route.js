import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl = rawUrl ? rawUrl.replace(/\/rest\/v1\/?$/, "") : "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Helper untuk membaca cookie dari request
function getCookie(req, name) {
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = cookieHeader.split(";").reduce((acc, c) => {
    const parts = c.split("=");
    if (parts.length >= 2) {
      acc[parts[0].trim()] = parts.slice(1).join("=").trim();
    }
    return acc;
  }, {});
  return cookies[name];
}

// Helper untuk memverifikasi token sesi admin
function validateAdmin(req) {
  const correctPassword = process.env.ADMIN_PASSWORD || "admin123";
  const expectedToken = crypto.createHash("sha256").update(correctPassword).digest("hex");
  const sessionToken = getCookie(req, "admin_session");
  
  return sessionToken === expectedToken;
}

export async function GET(req) {
  try {
    if (!validateAdmin(req)) {
      return Response.json({ success: false, message: "Akses ditolak: Sesi tidak valid" }, { status: 401 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return Response.json({ success: false, message: "Kredensial Supabase belum dikonfigurasi" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return Response.json({ success: true, donations: data || [] });
  } catch (error) {
    console.error("Admin GET Error:", error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    if (!validateAdmin(req)) {
      return Response.json({ success: false, message: "Akses ditolak: Sesi tidak valid" }, { status: 401 });
    }

    const { id, status_payment } = await req.json();

    if (!id || !status_payment) {
      return Response.json({ success: false, message: "Parameter tidak lengkap" }, { status: 400 });
    }

    if (!['pending', 'success', 'expired'].includes(status_payment)) {
      return Response.json({ success: false, message: "Status tidak valid" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from("donations")
      .update({ status_payment })
      .eq("id", id);

    if (error) throw error;

    return Response.json({ success: true, message: `Status transaksi berhasil diperbarui menjadi ${status_payment}` });
  } catch (error) {
    console.error("Admin PATCH Error:", error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    if (!validateAdmin(req)) {
      return Response.json({ success: false, message: "Akses ditolak: Sesi tidak valid" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ success: false, message: "ID wajib disertakan" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from("donations")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return Response.json({ success: true, message: "Catatan transaksi berhasil dihapus dari database" });
  } catch (error) {
    console.error("Admin DELETE Error:", error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
