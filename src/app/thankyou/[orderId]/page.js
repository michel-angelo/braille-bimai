import React from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function getDonationDetails(orderId) {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data } = await supabase
    .from('donations')
    .select('donor_name, amount, wakif_name')
    .eq('merchant_order_id', orderId)
    .single();
    
  return data;
}

export default async function ThankYouPage({ params }) {
  // Await params karena di Next.js 15 params bertipe Promise
  const { orderId } = await params;
  const details = await getDonationDetails(orderId);

  const donorName = details?.donor_name || "Donatur";
  const amount = details?.amount || 0;
  const wakifName = details?.wakif_name || "-";

  const formattedAmt = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(amount);

  // Pesan WhatsApp kustom sesuai permintaan Anda
  const waText = `Assalamu'alaikum, Admin BIMAI,

Perkenalkan, saya ${donorName}. Saya ingin melakukan konfirmasi donasi untuk program Wakaf Qur'an Braille dengan rincian sebagai berikut:

Nama Donatur: ${donorName}

Atas Nama Wakif: ${wakifName}

Nominal Donasi: ${formattedAmt}

ID Transaksi: ${orderId}

Mohon bantuannya untuk melakukan verifikasi penerimaan dana tersebut. Terima kasih.`;

  const waUrl = `https://api.whatsapp.com/send?phone=628123456789&text=${encodeURIComponent(waText)}`;

  return (
    <div style={styles.pageBackground}>
      <header className="brand-header">
        <div className="container brand-container">
          <img src="/images/bimai-logo.png" alt="Logo BIMAI" className="brand-logo" />
          <span className="brand-title">Yayasan Bina Masyarakat Indonesia</span>
        </div>
      </header>

      <div className="container" style={{ padding: "32px 16px", maxWidth: "480px", margin: "0 auto" }}>
        <div style={styles.thankyouCard}>
          <div style={styles.iconWrapper}>
            <i className="ri-checkbox-circle-fill" style={{ fontSize: "64px", color: "#10b981" }}></i>
          </div>
          
          <h2 style={styles.titleText}>Wakaf Berhasil Diterima!</h2>
          <p style={styles.subtext}>
            Jazakumullah Khairan Katsiran. Terima kasih atas kedermawanan Anda. Semoga menjadi pahala jariyah yang terus mengalir abadi bagi Anda dan keluarga.
          </p>

          <div style={styles.receiptBox}>
            <h4 style={styles.receiptTitle}>Rincian Wakaf</h4>
            <div style={styles.receiptRow}>
              <span>Nama Donatur:</span>
              <strong>{donorName}</strong>
            </div>
            <div style={styles.receiptRow}>
              <span>Atas Nama Wakif:</span>
              <strong>{wakifName}</strong>
            </div>
            <div style={styles.receiptRow}>
              <span>Nominal Wakaf:</span>
              <strong>{formattedAmt}</strong>
            </div>
            <div style={styles.receiptRow}>
              <span>ID Transaksi:</span>
              <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: "700", color: "#475569" }}>{orderId}</span>
            </div>
          </div>

          <p style={{ fontSize: "12.5px", color: "#64748b", margin: "20px 0 12px 0", lineHeight: "1.5" }}>
            Harap klik tombol di bawah untuk mengirimkan pesan konfirmasi donasi otomatis ke WhatsApp admin kami untuk mempermudah pelaporan.
          </p>

          <div style={styles.buttonGroup}>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" style={styles.btnWhatsapp}>
              <i className="ri-whatsapp-line" style={{ fontSize: "20px" }}></i> Konfirmasi Admin via WA
            </a>
            <Link href="/" style={styles.btnHome}>
              Kembali ke Beranda
            </Link>
          </div>
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
  thankyouCard: {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e2e8f0",
    padding: "40px 24px",
    textAlign: "center"
  },
  iconWrapper: {
    marginBottom: "16px"
  },
  titleText: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 12px 0",
    letterSpacing: "-0.5px"
  },
  subtext: {
    fontSize: "14px",
    color: "#475569",
    lineHeight: "1.6",
    margin: "0 0 24px 0"
  },
  receiptBox: {
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    padding: "20px",
    textAlign: "left",
    marginBottom: "16px"
  },
  receiptTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 16px 0",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "8px"
  },
  receiptRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#475569",
    marginBottom: "10px",
    alignItems: "center"
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "20px"
  },
  btnWhatsapp: {
    padding: "14px",
    borderRadius: "8px",
    background: "#10b981",
    color: "#fff",
    border: "none",
    fontWeight: "700",
    fontSize: "15px",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  },
  btnHome: {
    padding: "14px",
    borderRadius: "8px",
    background: "transparent",
    color: "#1e3a8a",
    border: "1px solid #1e3a8a",
    fontWeight: "600",
    fontSize: "14px",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
};
