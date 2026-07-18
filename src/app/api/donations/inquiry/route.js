import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl = rawUrl ? rawUrl.replace(/\/rest\/v1\/?$/, "") : "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const merchantCode = process.env.DUITKU_MERCHANT_CODE;
const merchantKey = process.env.DUITKU_MERCHANT_KEY;
const environment = process.env.DUITKU_ENVIRONMENT || 'sandbox'; // sandbox / production

export async function POST(req) {
  try {
    const { donor_name, phone, wakif_name, amount, niat, payment_method } = await req.json();

    if (!donor_name || !phone || !amount || !payment_method) {
      return Response.json({ success: false, message: "Semua kolom wajib diisi" }, { status: 400 });
    }

    // Generate merchantOrderId unik (misal: BIMAI-1721301234)
    const orderId = `BIMAI-${Date.now()}`;

    // Inisialisasi client Supabase server-side dengan Service Role Key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Simpan data transaksi ke Supabase dengan status_payment = 'pending'
    const { error: dbError } = await supabase
      .from('donations')
      .insert([
        {
          merchant_order_id: orderId,
          donor_name,
          phone,
          wakif_name: wakif_name || null,
          amount: Number(amount),
          niat: niat || null,
          payment_method,
          status_payment: 'pending',
          payment_reference: null,
          payment_code: null
        }
      ]);

    if (dbError) {
      console.error("Database insert error:", dbError);
      throw dbError;
    }

    // 2. Hubungi Duitku API untuk Inquiry Transaksi jika Duitku terkonfigurasi
    const hasConfiguredDuitku = merchantCode && merchantKey && 
      merchantCode !== 'ganti-dengan-merchant-code-anda' && 
      merchantKey !== 'ganti-dengan-merchant-key-anda';

    if (hasConfiguredDuitku) {
      const targetUrl = environment === 'production' 
        ? 'https://passport.duitku.com/webapi/api/merchant/v2/inquiry'
        : 'https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry';

      // Signature Duitku: MD5 dari merchantCode + merchantOrderId + paymentAmount + merchantKey
      const signatureSrc = merchantCode + orderId + amount + merchantKey;
      const signature = crypto.createHash('md5').update(signatureSrc).digest('hex');

      // Tentukan Callback dan Return URL
      const callbackUrl = process.env.DUITKU_CALLBACK_URL || `${req.headers.get('origin') || 'http://localhost:3000'}/api/payment-callback`;
      const returnUrl = `${req.headers.get('origin') || 'http://localhost:3000'}/thankyou/${orderId}`;

      const payload = {
        merchantCode,
        paymentAmount: Number(amount),
        merchantOrderId: orderId,
        productDetails: "Wakaf Al-Qur'an Braille BIMAI",
        email: `${phone.replace(/[^0-9]/g, '')}@bimaipeduli.id`, // Email otomatis agar valid di Duitku
        phoneNumber: phone,
        paymentMethod: payment_method,
        callbackUrl,
        returnUrl,
        signature,
        expiryPeriod: 1440 // Masa berlaku 24 jam (dalam menit)
      };

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Duitku error response body:", errorText);
        throw new Error(`Duitku HTTP error: ${response.status} - ${errorText}`);
      }

      const resData = await response.json();

      if (resData.resultCode === '00') {
        const ref = resData.reference;
        const code = resData.qrString || resData.vaNumber || resData.paymentUrl;

        // Perbarui kode bayar dan referensi dari Duitku ke database
        await supabase
          .from('donations')
          .update({
            payment_reference: ref,
            payment_code: code
          })
          .eq('merchant_order_id', orderId);

        return Response.json({
          success: true,
          orderId,
          paymentUrl: resData.paymentUrl,
          qrString: resData.qrString || null,
          vaNumber: resData.vaNumber || null,
          reference: ref
        });
      } else {
        throw new Error(resData.resultMessage || "Gagal inkuiri pembayaran Duitku");
      }
    } else {
      // Duitku belum dikonfigurasi, jalankan mode simulasi pembayaran!
      console.log("Duitku tidak terkonfigurasi. Berjalan dalam mode simulasi.");
      
      let simulatedCode = "";
      if (payment_method === 'DQ') {
        // Raw QRIS mock string
        simulatedCode = "00020101021226380010ID.CO.QRIS.WWW02151234567890123455204000053033605802ID5921Yayasan BIMAI Peduli6008Pamulang6105154166304abcd";
      } else {
        // VA Number mock
        simulatedCode = `8800${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      }

      await supabase
        .from('donations')
        .update({
          payment_reference: `SIM-${Date.now()}`,
          payment_code: simulatedCode
        })
        .eq('merchant_order_id', orderId);

      return Response.json({
        success: true,
        orderId,
        simulated: true,
        qrString: payment_method === 'DQ' ? simulatedCode : null,
        vaNumber: payment_method !== 'DQ' ? simulatedCode : null,
        paymentUrl: "#"
      });
    }
  } catch (error) {
    console.error("API Inquiry error:", error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
