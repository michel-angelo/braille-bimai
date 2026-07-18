"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId;

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [customAlert, setCustomAlert] = useState({ isOpen: false, message: "", type: "info" });

  const showAlert = (message, type = "info") => {
    setCustomAlert({ isOpen: true, message, type });
  };

  // Mengambil detail transaksi pembayaran dari Supabase via API Route
  useEffect(() => {
    if (!orderId) return;

    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/donations/status?id=${orderId}`);
        if (!res.ok) throw new Error("Gagal mengambil rincian pembayaran");
        const data = await res.json();
        if (data.success) {
          setTransaction(data);
          // Jika status sudah sukses (lunas), langsung alihkan ke thank you
          if (data.status === 'success') {
            router.push(`/thankyou/${orderId}`);
          }
        } else {
          throw new Error(data.message || "Transaksi tidak ditemukan");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [orderId, router]);

  // Lakukan polling status transaksi setiap 5 detik
  useEffect(() => {
    if (!orderId || !transaction || transaction.status === 'success') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/donations/status?id=${orderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.status === 'success') {
            clearInterval(interval);
            router.push(`/thankyou/${orderId}`);
          }
        }
      } catch (err) {
        console.error("Error polling status:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId, transaction, router]);

  // Simulasi Pembayaran Sukses (Bermanfaat untuk testing offline / localhost)
  const handleSimulateSuccess = async () => {
    setSimulating(true);
    try {
      const res = await fetch("/api/donations/simulate-success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (data.success) {
        // Polling status di atas akan mendeteksi perubahan status dan melakukan redirect otomatis
      } else {
        showAlert(data.message || "Simulasi gagal", "error");
        setSimulating(false);
      }
    } catch (err) {
      console.error(err);
      showAlert("Koneksi gagal", "error");
      setSimulating(false);
    }
  };

  const handleCopy = () => {
    if (!transaction) return;
    navigator.clipboard.writeText(transaction.payment_code).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amt);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: "16px", color: "var(--primary)", fontWeight: "600" }}>Memuat rincian pembayaran...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <i className="ri-error-warning-line" style={{ fontSize: "48px", color: "#ef4444" }}></i>
        <h3 style={{ marginTop: "16px", color: "var(--primary)" }}>Kesalahan</h3>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>{error}</p>
        <button onClick={() => router.push("/")} style={styles.btnBack}>Kembali ke Beranda</button>
      </div>
    );
  }

  const isQris = transaction.payment_method === "DQ";

  return (
    <div style={styles.pageBackground}>
      <header className="brand-header">
        <div className="container brand-container">
          <img src="/images/bimai-logo.png" alt="Logo BIMAI" className="brand-logo" onError={(e) => { e.target.src = "/images/bimai.ico"; }} />
          <span className="brand-title">Yayasan Bina Masyarakat Indonesia</span>
        </div>
      </header>

      <div className="container" style={{ padding: "24px 16px", maxWidth: "480px", margin: "0 auto" }}>
        <div style={styles.paymentCard}>
          <div style={styles.cardHeader}>
            <span style={styles.tag}>INSTRUKSI PEMBAYARAN</span>
            <h2 style={styles.amountText}>{formatCurrency(transaction.amount)}</h2>
            <p style={styles.orderText}>ID Transaksi: {orderId}</p>
          </div>

          <div style={styles.cardBody}>
            {isQris ? (
              <div style={styles.qrisSection}>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "16px", textAlign: "center", lineHeight: "1.4" }}>
                  Scan QRIS di bawah menggunakan aplikasi M-Banking atau dompet digital (GoPay, OVO, ShopeePay, DANA, LinkAja) Anda:
                </p>
                <div style={styles.qrWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(transaction.payment_code)}&size=220x220`}
                    alt="QRIS Code" 
                    style={{ width: "220px", height: "220px", display: "block" }}
                  />
                </div>
                <div style={styles.qrisBadge}>
                  <i className="ri-qr-code-line" style={{ fontSize: "18px" }}></i> QRIS GPN
                </div>
              </div>
            ) : (
              <div style={styles.vaSection}>
                <span style={styles.bankLabel}>
                  {transaction.payment_method === "BC" ? "BCA Virtual Account" :
                   transaction.payment_method === "M2" ? "Mandiri Virtual Account" :
                   transaction.payment_method === "I1" ? "BNI Virtual Account" :
                   transaction.payment_method === "BR" ? "BRI Virtual Account" :
                   transaction.payment_method === "DA" ? "Dana E-Wallet / QRIS" : "Virtual Account"}
                </span>
                <div style={styles.vaNumberBox}>
                  <span style={styles.vaNumber}>{transaction.payment_code}</span>
                  <button onClick={handleCopy} style={styles.btnCopyInline}>
                    {copySuccess ? <><i className="ri-check-line"></i> Terkopi</> : <><i className="ri-file-copy-line"></i> Salin</>}
                  </button>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "16px", textAlign: "center", lineHeight: "1.5" }}>
                  Silakan transfer pembayaran sesuai dengan kode unik Virtual Account di atas. Transaksi Anda akan diverifikasi otomatis oleh sistem kami setelah sukses transfer.
                </p>
              </div>
            )}

            <div style={styles.statusBox}>
              <div style={styles.pulseSpinner}></div>
              <span>Menunggu pembayaran donasi Anda...</span>
            </div>

            <div style={styles.buttonGroup}>
              <button 
                onClick={handleSimulateSuccess} 
                style={styles.btnSimulate}
                disabled={simulating}
              >
                {simulating ? "Memproses..." : "Simulasikan Pembayaran Sukses (Uji Coba)"}
              </button>
              <button onClick={() => router.push("/")} style={styles.btnCancel}>
                Kembali & Bayar Nanti
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Alert Overlay */}
      <div className={`custom-alert-overlay ${customAlert.isOpen ? "active" : ""}`}>
        <div className="custom-alert-box">
          <div className={`custom-alert-icon ${customAlert.type}`}>
            {customAlert.type === "success" && <i className="ri-checkbox-circle-fill"></i>}
            {customAlert.type === "warning" && <i className="ri-alert-fill"></i>}
            {customAlert.type === "error" && <i className="ri-close-circle-fill"></i>}
            {customAlert.type === "info" && <i className="ri-information-fill"></i>}
          </div>
          <p className="custom-alert-message">{customAlert.message}</p>
          <button
            className="btn-custom-alert-close"
            onClick={() => setCustomAlert({ ...customAlert, isOpen: false })}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageBackground: {
    background: "#f8fafc",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column"
  },
  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#f8fafc"
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #1e3a8a",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  errorContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
    textAlign: "center",
    background: "#f8fafc"
  },
  btnBack: {
    marginTop: "24px",
    padding: "12px 24px",
    borderRadius: "8px",
    background: "#1e3a8a",
    color: "#fff",
    border: "none",
    fontWeight: "600",
    cursor: "pointer"
  },
  paymentCard: {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    marginTop: "24px"
  },
  cardHeader: {
    background: "#1e3a8a",
    padding: "32px 24px",
    textAlign: "center",
    color: "#fff"
  },
  tag: {
    fontSize: "11px",
    fontWeight: "700",
    background: "rgba(255, 255, 255, 0.2)",
    padding: "4px 10px",
    borderRadius: "20px",
    letterSpacing: "0.5px",
    display: "inline-block",
    marginBottom: "12px"
  },
  amountText: {
    fontSize: "28px",
    fontWeight: "800",
    margin: "0",
    letterSpacing: "-0.5px"
  },
  orderText: {
    fontSize: "12px",
    opacity: "0.8",
    marginTop: "6px",
    marginBottom: "0"
  },
  cardBody: {
    padding: "24px"
  },
  qrisSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  qrWrapper: {
    padding: "16px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
    marginBottom: "12px"
  },
  qrisBadge: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  vaSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  bankLabel: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: "10px"
  },
  vaNumberBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "14px 16px",
    background: "#f8fafc",
    border: "1px dashed #cbd5e1",
    borderRadius: "8px"
  },
  vaNumber: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "1px"
  },
  btnCopyInline: {
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "600",
    background: "#1e3a8a",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  statusBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginTop: "24px",
    padding: "14px",
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "8px",
    color: "#b45309",
    fontSize: "14px",
    fontWeight: "600"
  },
  pulseSpinner: {
    width: "10px",
    height: "10px",
    background: "#f59e0b",
    borderRadius: "50%",
    animation: "pulse 1.2s infinite ease-in-out"
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "24px"
  },
  btnSimulate: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    background: "#10b981",
    color: "#fff",
    border: "none",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer"
  },
  btnCancel: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    background: "transparent",
    color: "#64748b",
    border: "1px solid #cbd5e1",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer"
  }
};
