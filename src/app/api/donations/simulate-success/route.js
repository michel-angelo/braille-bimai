import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl = rawUrl ? rawUrl.replace(/\/rest\/v1\/?$/, "") : "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return Response.json({ success: false, message: "Order ID wajib diisi" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from('donations')
      .update({
        status_payment: 'success',
        payment_reference: `SIM-PAY-${Date.now()}`
      })
      .eq('merchant_order_id', orderId);

    if (error) throw error;

    return Response.json({ success: true, message: "Status simulasi sukses diset ke lunas" });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
