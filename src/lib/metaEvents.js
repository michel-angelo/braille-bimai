import crypto from "crypto";

const META_PIXEL_ID = process.env.META_PIXEL_ID || "1023891886904648";
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || "EAAWKidLT1AIBSFMZCZCt6ERff9V6VO1XDgXXSCawhYk1E1d3joFQ29dGobRht8aVVIPtAYWJeK2R9b3uobynVYzZBoxtYkagLvHLFDuxSVwpYTyzQj8XxZAEhB1jMBMLYDZBZCSh5wpOsUMUWljEGtWr1xOobNHHFvMc9w8NFHWZC4MxbobHjvKjiYHZAHsZBcZA1uOwZDZD";

/**
 * Send server-side Meta Conversions API (CAPI) payload
 * @param {Object} params
 * @param {string} params.eventName - 'Purchase' | 'Lead' | 'InitiateCheckout'
 * @param {string} params.orderId - Unique order ID for deduplication with Meta Pixel
 * @param {number} params.amount - Donation amount in IDR
 * @param {string} params.phone - Donor phone number
 * @param {string} [params.email] - Donor email if available
 * @param {string} [params.pageUrl] - Source page URL
 * @param {string} [params.programName] - Package or campaign name
 */
export async function sendMetaServerEvent({
  eventName,
  orderId,
  amount,
  phone,
  email,
  pageUrl = "https://braille.bimaipeduli.id",
  programName = "Wakaf Al-Qur'an Braille",
}) {
  try {
    let cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : "";
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.substring(1);
    }
    const cleanEmail = email && email.includes("@") ? email.trim().toLowerCase() : (cleanPhone ? `${cleanPhone}@bimaipeduli.id` : "");

    const hashedPhone = cleanPhone ? crypto.createHash("sha256").update(cleanPhone).digest("hex") : undefined;
    const hashedEmail = cleanEmail ? crypto.createHash("sha256").update(cleanEmail).digest("hex") : undefined;

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: orderId || `EVT-${Date.now()}`,
          action_source: "website",
          event_source_url: pageUrl,
          user_data: {
            ph: hashedPhone ? [hashedPhone] : undefined,
            em: hashedEmail ? [hashedEmail] : undefined,
          },
          custom_data: {
            currency: "IDR",
            value: Number(amount) || 0,
            content_name: programName,
            content_type: "product",
          },
        },
      ],
    };

    const targetUrl = `https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`;

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log(`[Meta Conversions API] ${eventName} response:`, data);
    return data;
  } catch (err) {
    console.error(`[Meta Conversions API Error] ${eventName}:`, err);
    return null;
  }
}
