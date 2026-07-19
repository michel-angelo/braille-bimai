export async function POST(req) {
  try {
    const response = Response.json({ success: true, message: "Logout berhasil" });

    // Hapus cookie admin_session dengan menyetel Max-Age=0
    response.headers.set(
      "Set-Cookie",
      "admin_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict"
    );

    return response;
  } catch (error) {
    console.error("Logout API Error:", error);
    return Response.json({ success: false, message: "Terjadi kesalahan internal server" }, { status: 500 });
  }
}
