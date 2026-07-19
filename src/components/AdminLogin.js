"use client";

import React, { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Muat ulang halaman agar Server Component mendeteksi cookie sesi baru
        window.location.reload();
      } else {
        setError(data.message || "Password salah, akses ditolak");
      }
    } catch (err) {
      console.error(err);
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-overlay">
      <div className="admin-login-box">
        <img
          src="/images/bimai-logo.png"
          alt="BIMAI Logo"
          className="admin-login-logo"
          onError={(e) => {
            e.target.src = "/images/bimai.ico";
          }}
        />
        <h2>Panel Admin BIMAI</h2>
        <p>Masukkan password administrator untuk melihat data donatur</p>

        <form onSubmit={handleLoginSubmit} className="admin-login-form">
          <input
            type="password"
            className="admin-login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password admin..."
            autoFocus
            required
          />

          {error && (
            <p style={{ color: "#ef4444", fontSize: "12px", margin: "0", fontWeight: "600" }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn-admin-login" disabled={loading}>
            {loading ? "Memverifikasi..." : "Masuk Halaman Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
