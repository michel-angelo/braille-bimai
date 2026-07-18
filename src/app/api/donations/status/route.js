import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("id");

    if (!orderId) {
      return Response.json({ success: false, message: "ID wajib diisi" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('donations')
      .select('status_payment, donor_name, amount, wakif_name, payment_method, payment_code')
      .eq('merchant_order_id', orderId)
      .single();

    if (error) throw error;

    return Response.json({
      success: true,
      status: data.status_payment,
      donor_name: data.donor_name,
      amount: data.amount,
      wakif_name: data.wakif_name || '',
      payment_method: data.payment_method,
      payment_code: data.payment_code
    });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
