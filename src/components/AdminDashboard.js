"use client";

import React, { useState, useEffect } from "react";

export default function AdminDashboard({ initialDonations }) {
  const [donations, setDonations] = useState(initialDonations || []);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // State untuk Dialog Konfirmasi Kustom
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null
  });

  const triggerConfirm = (title, message, type, onConfirm) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm
    });
  };

  // Reset ke halaman 1 setiap kali query pencarian atau filter diubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFilter]);

  // Ambil ulang data donasi terbaru dari server
  const refreshData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/donations");
      const data = await res.json();
      if (res.ok && data.success) {
        setDonations(data.donations);
      }
    } catch (err) {
      console.error("Gagal merefresh data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    triggerConfirm(
      "Keluar Sesi",
      "Apakah Anda yakin ingin keluar dari panel admin?",
      "warning",
      async () => {
        try {
          const res = await fetch("/api/admin/logout", { method: "POST" });
          if (res.ok) {
            window.location.reload();
          }
        } catch (err) {
          console.error(err);
          alert("Gagal keluar dari sesi");
        }
      }
    );
  };

  // Konfirmasi pembayaran manual (pending -> success)
  const handleConfirmPayment = (id, orderId) => {
    triggerConfirm(
      "Konfirmasi Lunas",
      `Apakah Anda yakin ingin mengonfirmasi pembayaran lunas secara manual untuk transaksi ${orderId}?`,
      "info",
      async () => {
        setActionLoadingId(id);
        try {
          const res = await fetch("/api/admin/donations", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ id, status_payment: "success" })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            alert("Transaksi berhasil dikonfirmasi!");
            refreshData();
          } else {
            alert(data.message || "Gagal mengonfirmasi transaksi");
          }
        } catch (err) {
          console.error(err);
          alert("Kesalahan jaringan");
        } finally {
          setActionLoadingId(null);
        }
      }
    );
  };

  // Menghapus data transaksi (test / salah input)
  const handleDeleteDonation = (id, donorName, orderId) => {
    triggerConfirm(
      "Hapus Transaksi",
      `HATI-HATI! Apakah Anda yakin ingin menghapus data donasi dari "${donorName}" (${orderId}) secara permanen? Data yang dihapus tidak dapat dikembalikan.`,
      "danger",
      async () => {
        setActionLoadingId(id);
        try {
          const res = await fetch(`/api/admin/donations?id=${id}`, {
            method: "DELETE"
          });
          const data = await res.json();
          if (res.ok && data.success) {
            alert("Data donasi berhasil dihapus!");
            refreshData();
          } else {
            alert(data.message || "Gagal menghapus data");
          }
        } catch (err) {
          console.error(err);
          alert("Kesalahan jaringan");
        } finally {
          setActionLoadingId(null);
        }
      }
    );
  };

  // Format ke Rupiah
  const formatCurrency = (amt) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amt);
  };

  // Membuat tautan kirim pesan otomatis WhatsApp (Pending vs Sukses)
  const getWhatsAppLink = (phone, donorName, amount, status, method, code) => {
    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.substring(1);
    }

    let message = "";
    if (status === "success") {
      message = `Assalamu'alaikum Wr. Wb. Kak *${donorName}*,\n\nTerima kasih banyak atas Wakaf Al-Qur'an Braille sebesar *${formatCurrency(amount)}* yang telah disalurkan melalui Yayasan BIMAI.\n\nSemoga menjadi amal jariyah yang terus mengalir, mendatangkan keberkahan, serta menjadi pembuka pintu-pintu kemudahan untuk Kakak sekeluarga. Aamiin ya Rabbal 'Alamin.\n\nSalam Hangat,\n*Yayasan Bina Masyarakat Indonesia*`;
    } else {
      // Dapatkan nama metode pembayaran yang ramah dibaca
      const friendlyMethod =
        method === "DQ" ? "QRIS" :
        method === "BC" ? "BCA Virtual Account" :
        method === "M2" ? "Mandiri Virtual Account" :
        method === "I1" ? "BNI Virtual Account" :
        method === "BR" ? "BRI Virtual Account" :
        method === "DA" ? "DANA E-Wallet" :
        method === "OV" ? "OVO E-Wallet" :
        method === "SP" ? "ShopeePay" : method;

      const codeDetails = code ? `*${code}*` : "(Silakan klik link pembayaran pada SMS/Email Anda)";

      message = `Assalamu'alaikum Wr. Wb. Kak *${donorName}*,\n\nKami dari Yayasan BIMAI melihat Kakak memilih metode pembayaran *${friendlyMethod}* sebesar *${formatCurrency(amount)}* untuk program Wakaf Al-Qur'an Braille.\n\nBerikut rincian kode bayar / nomor Virtual Account Kakak:\n👉 Kode/No. VA: ${codeDetails}\n\nMohon menyelesaikan pembayaran sebelum batas waktu kedaluwarsa berakhir. Bantuan Kakak sangat berarti bagi santri tunanetra binaan kami. Terima kasih banyak.\n\nSalam Hangat,\n*Yayasan Bina Masyarakat Indonesia*`;
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // Ekspor data donasi ke CSV secara lokal
  const exportToCSV = () => {
    if (filteredDonations.length === 0) {
      alert("Tidak ada data yang dapat diekspor.");
      return;
    }

    const headers = [
      "Tanggal",
      "Order ID",
      "Nama Donatur",
      "WhatsApp",
      "Nama Wakif",
      "Nominal Donasi",
      "Niat/Doa",
      "Metode Pembayaran",
      "Status Pembayaran",
      "Kode Bayar/VA",
      "Referensi Duitku"
    ];

    const rows = filteredDonations.map((d) => [
      new Date(d.created_at).toLocaleString("id-ID"),
      d.merchant_order_id,
      d.donor_name,
      d.phone,
      d.wakif_name || "-",
      d.amount,
      d.niat ? d.niat.replace(/[\n\r,]/g, " ") : "-",
      d.payment_method,
      d.status_payment,
      d.payment_code || "-",
      d.payment_reference || "-"
    ]);

    const csvContent =
      "\uFEFF" + // BOM untuk Excel UTF-8
      [headers.join(","), ...rows.map((row) => row.map((val) => `"${val}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan_donasi_bimai_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Kalkulasi data statistik untuk dashboard
  const stats = {
    totalSuccessAmount: donations
      .filter((d) => d.status_payment === "success")
      .reduce((sum, d) => sum + Number(d.amount), 0),
    totalSuccessDonors: donations.filter((d) => d.status_payment === "success").length,
    totalPending: donations.filter((d) => d.status_payment === "pending").length,
    totalExpired: donations.filter((d) => d.status_payment === "expired").length
  };

  // Filter Tanggal Logic
  const filterByDate = (d) => {
    if (dateFilter === "all") return true;

    const createdAt = new Date(d.created_at);
    const today = new Date();

    if (dateFilter === "today") {
      return (
        createdAt.getDate() === today.getDate() &&
        createdAt.getMonth() === today.getMonth() &&
        createdAt.getFullYear() === today.getFullYear()
      );
    }

    if (dateFilter === "last7") {
      const diffTime = Math.abs(today - createdAt);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }

    if (dateFilter === "month") {
      return (
        createdAt.getMonth() === today.getMonth() &&
        createdAt.getFullYear() === today.getFullYear()
      );
    }

    return true;
  };

  // Filter & Cari Data
  const filteredDonations = donations.filter((d) => {
    const matchesStatus = statusFilter === "all" || d.status_payment === statusFilter;
    const matchesDate = filterByDate(d);
    
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      d.donor_name.toLowerCase().includes(query) ||
      d.merchant_order_id.toLowerCase().includes(query) ||
      d.phone.includes(query) ||
      (d.wakif_name && d.wakif_name.toLowerCase().includes(query)) ||
      (d.niat && d.niat.toLowerCase().includes(query));

    return matchesStatus && matchesDate && matchesSearch;
  });

  // Paginasi Data (15 item per halaman)
  const itemsPerPage = 15;
  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage) || 1;
  const paginatedDonations = filteredDonations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- KALKULASI DATA GRAFIK 7 HARI TERAKHIR ---
  const getChartData = () => {
    const today = new Date();
    const daysData = [];

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() - i);
      const targetString = targetDate.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

      // Hitung total donasi sukses pada hari tersebut
      const dailyTotal = donations
        .filter((d) => {
          if (d.status_payment !== "success") return false;
          const dDate = new Date(d.created_at);
          return (
            dDate.getDate() === targetDate.getDate() &&
            dDate.getMonth() === targetDate.getMonth() &&
            dDate.getFullYear() === targetDate.getFullYear()
          );
        })
        .reduce((sum, d) => sum + Number(d.amount), 0);

      daysData.push({ label: targetString, value: dailyTotal });
    }

    const maxValue = Math.max(...daysData.map((d) => d.value)) || 1;

    return { daysData, maxValue };
  };

  const { daysData, maxValue } = getChartData();

  return (
    <div className="admin-page-bg">
      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px", background: "none", boxShadow: "none" }}>
        
        {/* Header Panel */}
        <header className="admin-header">
          <div className="admin-title-group">
            <h1>Dashboard Administrator</h1>
            <p>Sistem Manajemen & Rekapitulasi Data Donasi Wakaf Al-Qur'an Braille</p>
          </div>
          <button className="btn-admin-logout" onClick={handleLogout}>
            <i className="ri-logout-box-r-line"></i> Keluar
          </button>
        </header>

        {/* Dashboard Stats */}
        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon total">
              <i className="ri-money-dollar-circle-line"></i>
            </div>
            <div className="admin-stat-info">
              <span className="admin-stat-label">Total Donasi Lunas</span>
              <h3 className="admin-stat-value">{formatCurrency(stats.totalSuccessAmount)}</h3>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon success">
              <i className="ri-user-heart-line"></i>
            </div>
            <div className="admin-stat-info">
              <span className="admin-stat-label">Donatur Lunas</span>
              <h3 className="admin-stat-value">{stats.totalSuccessDonors} Orang</h3>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon pending">
              <i className="ri-time-line"></i>
            </div>
            <div className="admin-stat-info">
              <span className="admin-stat-label">Transaksi Pending</span>
              <h3 className="admin-stat-value">{stats.totalPending} Data</h3>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon expired">
              <i className="ri-close-circle-line"></i>
            </div>
            <div className="admin-stat-info">
              <span className="admin-stat-label">Transaksi Expired</span>
              <h3 className="admin-stat-value">{stats.totalExpired} Data</h3>
            </div>
          </div>
        </section>

        {/* Tren Donasi 7 Hari Terakhir (CSS Bar Chart) */}
        {!loading && donations.length > 0 && (
          <section className="admin-chart-container">
            <h4 className="admin-chart-title">
              <i className="ri-bar-chart-2-line"></i> Tren Penerimaan Donasi Harian (7 Hari Terakhir)
            </h4>
            <div className="admin-chart-bars">
              {daysData.map((d, index) => {
                const heightPercent = (d.value / maxValue) * 100;
                return (
                  <div className="admin-chart-col" key={index}>
                    <div className="admin-chart-bar-val">{formatCurrency(d.value)}</div>
                    <div className="admin-chart-bar-bg">
                      <div 
                        className="admin-chart-bar-fill" 
                        style={{ height: `${Math.max(heightPercent, d.value > 0 ? 5 : 0)}%` }}
                      ></div>
                    </div>
                    <span className="admin-chart-label">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Bilah Kontrol (Search, Filter Periode, Filter Status, & Ekspor) */}
        <section className="admin-controls">
          <div className="admin-controls-group-left">
            <div className="admin-search-wrapper">
              <i className="ri-search-line"></i>
              <input
                type="text"
                className="admin-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, No WA, order ID..."
              />
            </div>

            <select
              className="select-control-date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="last7">7 Hari Terakhir</option>
              <option value="month">Bulan Ini</option>
            </select>

            <button 
              className="btn-control-refresh" 
              onClick={refreshData} 
              title="Perbarui Data Donasi"
            >
              <i className="ri-refresh-line"></i>
            </button>
          </div>

          <div className="admin-controls-group-right">
            <div className="admin-filter-tabs">
              <button
                className={`admin-tab-btn ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                Semua ({donations.length})
              </button>
              <button
                className={`admin-tab-btn ${statusFilter === "success" ? "active" : ""}`}
                onClick={() => setStatusFilter("success")}
              >
                Sukses ({stats.totalSuccessDonors})
              </button>
              <button
                className={`admin-tab-btn ${statusFilter === "pending" ? "active" : ""}`}
                onClick={() => setStatusFilter("pending")}
              >
                Pending ({stats.totalPending})
              </button>
              <button
                className={`admin-tab-btn ${statusFilter === "expired" ? "active" : ""}`}
                onClick={() => setStatusFilter("expired")}
              >
                Expired ({stats.totalExpired})
              </button>
            </div>

            <button className="btn-control-export" onClick={exportToCSV} title="Unduh Rekap Laporan CSV">
              <i className="ri-download-line"></i> Ekspor CSV
            </button>
          </div>
        </section>

        {/* Status Loading */}
        {loading && (
          <p style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", margin: "0" }}>
            Memuat ulang data...
          </p>
        )}

        {/* Status Kosong */}
        {!loading && filteredDonations.length === 0 && (
          <p style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", margin: "0", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            Tidak ditemukan data transaksi yang sesuai filter / pencarian.
          </p>
        )}

        {/* Tabel Data Donasi (Desktop View) */}
        {!loading && filteredDonations.length > 0 && (
          <section className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Tanggal</th>
                  <th>Order ID</th>
                  <th>Donatur</th>
                  <th>No. WhatsApp</th>
                  <th>Wakif</th>
                  <th>Nominal</th>
                  <th style={{ minWidth: "150px" }}>Niat / Doa</th>
                  <th>Metode</th>
                  <th>Kode VA / QRIS</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDonations.map((d, index) => (
                  <tr key={d.id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {new Date(d.created_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}<br />
                      <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                        {new Date(d.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                      </span>
                    </td>
                    <td><span style={{ fontWeight: "700", fontSize: "11px" }}>{d.merchant_order_id}</span></td>
                    <td><strong>{d.donor_name}</strong></td>
                    <td style={{ whiteSpace: "nowrap" }}>{d.phone}</td>
                    <td>{d.wakif_name || "-"}</td>
                    <td><strong>{formatCurrency(d.amount)}</strong></td>
                    <td>
                      {d.niat ? (
                        <span style={{ fontStyle: "italic", fontSize: "12px", color: "var(--text-muted)" }}>
                          "{d.niat}"
                        </span>
                      ) : "-"}
                    </td>
                    <td>
                      <span style={{ fontWeight: "800", fontSize: "11px", color: "var(--primary)" }}>
                        {d.payment_method}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: "700", fontSize: "12px", color: "#475569" }}>
                        {d.payment_code || "-"}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-status-badge ${d.status_payment}`}>
                        {d.status_payment === "success" ? "Sukses" :
                         d.status_payment === "pending" ? "Pending" : "Expired"}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div className="admin-actions">
                        
                        {/* Tombol hubungi via WhatsApp */}
                        <a
                          href={getWhatsAppLink(d.phone, d.donor_name, d.amount, d.status_payment, d.payment_method, d.payment_code)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-admin-action whatsapp"
                          title="Hubungi Donatur WhatsApp"
                        >
                          <i className="ri-whatsapp-line"></i> WA
                        </a>

                        {/* Tombol manual konfirmasi pembayaran (hanya jika pending) */}
                        {d.status_payment === "pending" && (
                          <button
                            onClick={() => handleConfirmPayment(d.id, d.merchant_order_id)}
                            className="btn-admin-action confirm"
                            title="Konfirmasi Lunas Manual"
                            disabled={actionLoadingId === d.id}
                          >
                            {actionLoadingId === d.id ? "..." : <><i className="ri-check-line"></i> Lunas</>}
                          </button>
                        )}

                        {/* Tombol hapus data transaksi */}
                        <button
                          onClick={() => handleDeleteDonation(d.id, d.donor_name, d.merchant_order_id)}
                          className="btn-admin-action delete"
                          title="Hapus Catatan"
                          disabled={actionLoadingId === d.id}
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Daftar Kartu Donasi (Mobile View) */}
        {!loading && filteredDonations.length > 0 && (
          <div className="admin-mobile-list">
            {paginatedDonations.map((d) => (
              <div className="admin-mobile-card" key={d.id}>
                {/* Card Header */}
                <div className="admin-card-header">
                  <span className="admin-card-order">{d.merchant_order_id}</span>
                  <span className={`admin-status-badge ${d.status_payment}`}>
                    {d.status_payment === "success" ? "Sukses" :
                     d.status_payment === "pending" ? "Pending" : "Expired"}
                  </span>
                </div>

                {/* Card Body */}
                <div className="admin-card-body">
                  <div className="admin-card-row">
                    <h4 className="admin-card-name">{d.donor_name}</h4>
                    <span className="admin-card-amount">{formatCurrency(d.amount)}</span>
                  </div>

                  <div className="admin-card-detail-item" style={{ marginTop: "6px" }}>
                    <span className="admin-card-detail-label">Tanggal:</span>
                    <span className="admin-card-detail-val">
                      {new Date(d.created_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })} ({new Date(d.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB)
                    </span>
                  </div>

                  <div className="admin-card-detail-item">
                    <span className="admin-card-detail-label">WhatsApp:</span>
                    <span className="admin-card-detail-val">{d.phone}</span>
                  </div>

                  <div className="admin-card-detail-item">
                    <span className="admin-card-detail-label">Wakif:</span>
                    <span className="admin-card-detail-val">{d.wakif_name || "-"}</span>
                  </div>

                  <div className="admin-card-detail-item">
                    <span className="admin-card-detail-label">Metode:</span>
                    <span className="admin-card-detail-val" style={{ color: "var(--primary)", fontWeight: "800" }}>{d.payment_method}</span>
                  </div>

                  <div className="admin-card-detail-item">
                    <span className="admin-card-detail-label">Kode VA/QRIS:</span>
                    <span className="admin-card-detail-val" style={{ color: "#475569" }}>{d.payment_code || "-"}</span>
                  </div>

                  {d.niat && (
                    <div className="admin-card-niat">
                      "{d.niat}"
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="admin-card-footer">
                  <a
                    href={getWhatsAppLink(d.phone, d.donor_name, d.amount, d.status_payment, d.payment_method, d.payment_code)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-admin-action whatsapp"
                    title="Kirim Pesan Terima Kasih ke WhatsApp"
                  >
                    <i className="ri-whatsapp-line"></i> WA Follow-up/Thanks
                  </a>

                  {d.status_payment === "pending" && (
                    <button
                      onClick={() => handleConfirmPayment(d.id, d.merchant_order_id)}
                      className="btn-admin-action confirm"
                      title="Konfirmasi Lunas"
                      disabled={actionLoadingId === d.id}
                    >
                      {actionLoadingId === d.id ? "..." : <><i className="ri-check-line"></i> Lunas</>}
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteDonation(d.id, d.donor_name, d.merchant_order_id)}
                    className="btn-admin-action delete"
                    title="Hapus Data Donasi"
                    disabled={actionLoadingId === d.id}
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginasi Halaman (Hanya tampil jika data melebihi 1 halaman) */}
        {!loading && filteredDonations.length > itemsPerPage && (
          <section className="admin-pagination">
            <button
              className="btn-pagination"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <i className="ri-arrow-left-s-line"></i> Seb
            </button>
            <span className="pagination-info">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              className="btn-pagination"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Sel <i className="ri-arrow-right-s-line"></i>
            </button>
          </section>
        )}

        {/* Dialog Konfirmasi Kustom */}
        <div className={`custom-confirm-overlay ${confirmModal.isOpen ? "active" : ""}`}>
          <div className="custom-confirm-box">
            <div className={`custom-confirm-icon ${confirmModal.type}`}>
              {confirmModal.type === "warning" && <i className="ri-alert-fill"></i>}
              {confirmModal.type === "danger" && <i className="ri-delete-bin-5-fill"></i>}
              {confirmModal.type === "info" && <i className="ri-checkbox-circle-fill"></i>}
            </div>
            <h3>{confirmModal.title}</h3>
            <p>{confirmModal.message}</p>
            <div className="custom-confirm-buttons">
              <button 
                className="btn-confirm-cancel" 
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              >
                Batal
              </button>
              <button 
                className={`btn-confirm-ok ${confirmModal.type === "danger" ? "danger" : "confirm"}`}
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
