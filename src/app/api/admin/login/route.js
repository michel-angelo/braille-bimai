import crypto from "crypto";

export async function POST(req) {
  try {
    const { password } = await req.json();
    const correctPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (password !== correctPassword) {
      return Response.json({ success: false, message: "Password salah, akses ditolak" }, { status: 401 });
    }

    // Buat token sesi aman (SHA-256 hash dari password)
    const token = crypto.createHash("sha256").update(correctPassword).digest("hex");

    const response = Response.json({ success: true, message: "Login berhasil" });

    // Atur cookie admin_session menggunakan Set-Cookie
    const isProd = process.env.NODE_ENV === "production";
    const cookieString = [
      `admin_session=${token}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Strict",
      "Max-Age=86400", // Berlaku 1 hari
    ];
    
    if (isProd) {
      cookieString.push("Secure");
    }

    response.headers.set("Set-Cookie", cookieString.join("; "));

    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    return Response.json({ success: false, message: "Terjadi kesalahan internal server" }, { status: 500 });
  }
}
