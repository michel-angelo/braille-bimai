import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl = rawUrl ? rawUrl.replace(/\/rest\/v1\/?$/, "") : "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const merchantKey = process.env.DUITKU_MERCHANT_KEY;

export async function POST(req) {
  try {
    let body = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      // Parse form urlencoded yang sering digunakan Duitku
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
    }

    const {
      merchantCode,
      amount,
      merchantOrderId,
      productDetails,
      additionalParam,
      paymentCode,
      resultCode,
      reference,
      signature
    } = body;

    console.log("Duitku Callback Diterima:", body);

    if (!merchantOrderId || !resultCode || !signature) {
      return Response.json({ success: false, message: "Parameter tidak lengkap" }, { status: 400 });
    }

    // Verifikasi Signature Duitku Callback V2: HMAC-SHA256 dari merchantCode + amount + merchantOrderId menggunakan merchantKey
    const expectedSignatureSrc = merchantCode + amount + merchantOrderId;
    const expectedSignature = crypto.createHmac('sha256', merchantKey).update(expectedSignatureSrc).digest('hex');

    const isSignatureValid = (signature === expectedSignature);

    // Jika Duitku terkonfigurasi, pastikan signature valid
    const hasConfiguredDuitku = merchantKey && merchantKey !== 'ganti-dengan-merchant-key-anda';
    if (hasConfiguredDuitku && !isSignatureValid) {
      console.warn("Signature Duitku Callback TIDAK COCOK!");
      return Response.json({ success: false, message: "Signature tidak valid" }, { status: 401 });
    }

    // Inisialisasi client Supabase server-side
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (resultCode === '00') {
      // Perbarui status pembayaran menjadi 'success'
      const { error } = await supabase
        .from('donations')
        .update({
          status_payment: 'success',
          payment_reference: reference
        })
        .eq('merchant_order_id', merchantOrderId);

      if (error) throw error;
      console.log(`Donasi ${merchantOrderId} sukses diperbarui menjadi 'success'.`);
    } else {
      // Perbarui status pembayaran menjadi 'expired' jika gagal/batal
      await supabase
        .from('donations')
        .update({
          status_payment: 'expired'
        })
        .eq('merchant_order_id', merchantOrderId);
      console.log(`Donasi ${merchantOrderId} diubah menjadi 'expired'. ResultCode: ${resultCode}`);
    }

    return Response.json({ success: true, message: "Callback processed successfully" });
  } catch (error) {
    console.error("Callback processing error:", error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
