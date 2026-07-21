import crypto from "crypto";

const TIKTOK_PIXEL_ID = process.env.TIKTOK_PIXEL_ID || "D9ECINRC77UBS5FSH6M0";
const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN || "8cc00296129f119d3f38c5f91bf2cfee526c98ff";

/**
 * Send server-side TikTok Events API payload
 * @param {Object} params
 * @param {string} params.eventName - e.g. 'InitiateCheckout', 'CompletePayment', 'Purchase'
 * @param {string} params.orderId - Unique event_id for deduplication
 * @param {number} params.amount - Donation amount in IDR
 * @param {string} params.phone - Donor phone number
 * @param {string} [params.email] - Donor email if available
 * @param {string} [params.pageUrl] - Current page URL
 */
export async function sendTikTokServerEvent({
  eventName,
  orderId,
  amount,
  phone,
  email,
  pageUrl = "https://bimaipeduli.id/donasi",
}) {
  try {
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : "";
    const cleanEmail = email && email.includes("@") ? email.trim().toLowerCase() : `${cleanPhone}@bimaipeduli.id`;

    // Hash user identity with SHA256 according to TikTok Events API specification
    const hashedPhone = cleanPhone ? crypto.createHash("sha256").update(cleanPhone).digest("hex") : undefined;
    const hashedEmail = cleanEmail ? crypto.createHash("sha256").update(cleanEmail).digest("hex") : undefined;

    const payload = {
      event_source: "web",
      event_source_id: TIKTOK_PIXEL_ID,
      data: [
        {
          event: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: orderId || `EVT-${Date.now()}`,
          user: {
            phone_number: hashedPhone,
            email: hashedEmail,
          },
          properties: {
            currency: "IDR",
            value: Number(amount) || 0,
            content_name: "Wakaf Al-Qur'an Braille",
            content_type: "product",
            content_id: "wakaf-quran-braille",
          },
          page: {
            url: pageUrl,
          },
        },
      ],
    };

    const res = await fetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": TIKTOK_ACCESS_TOKEN,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log(`[TikTok Events API] ${eventName} response:`, data);
    return data;
  } catch (err) {
    console.error(`[TikTok Events API Error] ${eventName}:`, err);
    return null;
  }
}
