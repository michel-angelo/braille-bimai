"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Map Alfabet ke Titik Braille (representasi 6 titik: [titik1, titik2, titik3, titik4, titik5, titik6])
const brailleMap = {
  a: [1, 0, 0, 0, 0, 0],
  b: [1, 1, 0, 0, 0, 0],
  c: [1, 0, 0, 1, 0, 0],
  d: [1, 0, 0, 1, 1, 0],
  e: [1, 0, 0, 0, 1, 0],
  f: [1, 1, 0, 1, 0, 0],
  g: [1, 1, 0, 1, 1, 0],
  h: [1, 1, 0, 0, 1, 0],
  i: [0, 1, 0, 1, 0, 0],
  j: [0, 1, 0, 1, 1, 0],
  k: [1, 0, 1, 0, 0, 0],
  l: [1, 1, 1, 0, 0, 0],
  m: [1, 0, 1, 1, 0, 0],
  n: [1, 0, 1, 1, 1, 0],
  o: [1, 0, 1, 0, 1, 0],
  p: [1, 1, 1, 1, 0, 0],
  q: [1, 1, 1, 1, 1, 0],
  r: [1, 1, 1, 0, 1, 0],
  s: [0, 1, 1, 1, 0, 0],
  t: [0, 1, 1, 1, 1, 0],
  u: [1, 0, 1, 0, 0, 1],
  v: [1, 1, 1, 0, 0, 1],
  w: [0, 1, 0, 1, 1, 1],
  x: [1, 0, 1, 1, 0, 1],
  y: [1, 0, 1, 1, 1, 1],
  z: [1, 0, 1, 0, 1, 1],
  " ": [0, 0, 0, 0, 0, 0],
};

const galleryItems = [
  {
    id: 1,
    src: "/images/seorang_tunanetra_sedang_membaca_alquran_braille_dipandu_oleh_ustadz_yang_juga_tunanetra_landscape_3.webp",
    alt: "Bimbingan Mengaji Braille",
    title: "Bimbingan Telaten Pengajar Tunanetra",
    caption: "Ustadz pembimbing tunanetra menuntun ketepatan ujung jari santri dalam membaca titik-titik timbul huruf Al-Qur'an Braille."
  },
  {
    id: 2,
    src: "/images/para_murid_sedang_membaca_masing_masing_potrait.webp",
    alt: "Kelas Tadarus Mandiri",
    title: "Semangat Mengaji & Menghafal Kalamullah",
    caption: "Para santri disabilitas netra khusyuk menyimak mushaf Braille masing-masing saat latihan hafalan harian."
  },
  {
    id: 3,
    src: "/images/murid_dewasa_sedang_membaca_alquran_braille_dibantu_ustadz_potrait.webp",
    alt: "Pembelajaran Braille Dewasa",
    title: "Semangat Belajar Tanpa Batas Usia",
    caption: "Jemaah tunanetra dewasa tekun mendalami cara meraba dan mengeja ayat suci demi kemandirian sholat dan mengaji."
  },
  {
    id: 4,
    src: "/images/acara_bukber_anak-anak_tunanetra_landscape.webp",
    alt: "Kegiatan Bersama Santri",
    title: "Kebersamaan & Santunan Ceria",
    caption: "Kebahagiaan para santri tunanetra dhuafa dalam acara silaturahmi, santunan, dan doa bersama pengurus yayasan."
  },
  {
    id: 5,
    src: "/images/foto_bersama_pengurus_bimai_bersama_anak-anak_tunanetra_dalam_acara_santunan-dan-buka-puasa-bersama.webp",
    alt: "Serah Terima Bantuan",
    title: "Penyaluran Amanah Wakif",
    caption: "Penyerahan dukungan perlengkapan ibadah dan wakaf mushaf Al-Qur'an Braille dari para donatur."
  },
  {
    id: 6,
    src: "/images/tunanetra_perempuan_dewasa_dan_anak-anak_sedang_mebaca_alquran_braille_potrait.webp",
    alt: "Belajar Bersama Santriwati",
    title: "Sesi Bimbingan Santriwati",
    caption: "Santriwati tunanetra mendalami tajwid dan kelancaran membaca Al-Qur'an Braille secara bertahap."
  }
];

export default function CampaignClient({ initialData, whatsappCS }) {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    // Trigger TikTok Pixel ViewContent event
    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.track("ViewContent", {
        contents: [
          {
            content_id: "wakaf_braille",
            content_type: "product",
            content_name: "Wakaf Al-Qur'an Braille"
          }
        ],
        value: 75000,
        currency: "IDR"
      });
    }
    // Trigger Meta Pixel ViewContent event
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "ViewContent", {
        content_name: "Wakaf Al-Qur'an Braille",
        value: 75000,
        currency: "IDR"
      });
    }
  }, []);

  // --- CUSTOM ALERT STATE ---
  const [customAlert, setCustomAlert] = useState({
    isOpen: false,
    message: "",
    type: "info",
  });

  const showAlert = (message, type = "info") => {
    setCustomAlert({ isOpen: true, message, type });
  };

  // --- STATS & DATA POLLING ---
  const [collectedAmount, setCollectedAmount] = useState(
    initialData.collectedAmount,
  );
  const [donorsCount, setDonorsCount] = useState(initialData.donorsCount);
  const [donorsList, setDonorsList] = useState(initialData.donorsList);
  const targetAmount = initialData.targetAmount;

  // Poll API statistik donasi secara berkala (setiap 60 detik)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setCollectedAmount(data.collectedAmount);
            setDonorsCount(data.donorsCount);
            setDonorsList(data.donorsList);
          }
        }
      } catch (err) {
        console.error("Error polling stats:", err);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const progressPercent = Math.min(
    Math.round((collectedAmount / targetAmount) * 100),
    100,
  );

  // --- TRANSLATOR STATE ---
  const [translatorInput, setTranslatorInput] = useState("bismillah");

  // --- FAQ STATE ---
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

  // --- GALLERY INTERACTION STATE ---
  const [activeGalleryId, setActiveGalleryId] = useState(null);

  // --- READ MORE EXPANSION STATES (MOBILE) ---
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);
  const [isDonaturExpanded, setIsDonaturExpanded] = useState(false);

  // --- MODAL & FORM STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPackageName, setModalPackageName] = useState("");
  const [modalAmount, setModalAmount] = useState(0);
  const [customAmountText, setCustomAmountText] = useState("");

  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [wakifName, setWakifName] = useState("");
  const [donorNiat, setDonorNiat] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Transfer Manual");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- IMMERSIVE LOADING STATES ---
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
  const loadingPhrases = [
    "Mencatat Niat Suci Wakaf Anda...",
    "Jazakumullah Khairan Katsiran...",
    "Menyiapkan Akses Terverifikasi & Amanah...",
    "Mengalihkan ke Layanan Konfirmasi..."
  ];

  useEffect(() => {
    let interval;
    if (isSubmitting) {
      interval = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % 4);
      }, 1300);
    } else {
      setLoadingPhraseIndex(0);
    }
    return () => clearInterval(interval);
  }, [isSubmitting]);

  // --- COPY BUTTON STATE ---
  const [copyStatus, setCopyStatus] = useState({});

  // --- SCROLL ELEMENT REFS ---
  const detailRef = useRef(null);
  const donaturRef = useRef(null);

  // --- CAROUSEL SCROLL HANDLING ---
  const carouselRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const width = carouselRef.current.offsetWidth;
    const cardWidth = width * 0.85 + 16;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveSlide(index);
  };

  const scrollToSlide = (idx) => {
    if (!carouselRef.current) return;
    const width = carouselRef.current.offsetWidth;
    const cardWidth = width * 0.85 + 16;
    carouselRef.current.scrollTo({
      left: idx * cardWidth,
      behavior: "smooth",
    });
  };

  // --- OTHER INTERACTIVE HANDLERS ---
  const handleOpenModal = (pkgName, amt) => {
    console.log("handleOpenModal triggered:", pkgName, amt);
    setModalPackageName(pkgName);
    setModalAmount(amt);
    setIsModalOpen(true);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }

    // Trigger TikTok Pixel InitiateCheckout event
    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.track("InitiateCheckout", {
        contents: [
          {
            content_id: "wakaf_braille",
            content_type: "product",
            content_name: pkgName
          }
        ],
        value: Number(amt),
        currency: "IDR"
      });
    }
    // Trigger Meta Pixel InitiateCheckout event
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "InitiateCheckout", {
        content_name: pkgName,
        value: Number(amt),
        currency: "IDR"
      });
    }
  };

  const handleCloseModal = () => {
    console.log("handleCloseModal triggered");
    setIsModalOpen(false);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
    // Reset form fields
    setDonorName("");
    setDonorPhone("");
    setWakifName("");
    setDonorNiat("");
    setPaymentMethod("Transfer Manual");
    setIsSubmitting(false);
  };

  const handleCustomDonate = () => {
    const amt = parseInt(customAmountText);
    if (isNaN(amt) || amt < 75000) {
      showAlert("Minimal nominal wakaf kustom adalah Rp 75.000", "warning");
      return;
    }
    handleOpenModal("Wakaf Kustom", amt);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/donations/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donor_name: donorName,
          phone: donorPhone,
          wakif_name: wakifName || null,
          amount: modalAmount,
          niat: donorNiat || null,
          payment_method: paymentMethod,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        handleCloseModal();
        
        // Setup WhatsApp redirect variables
        const waNumber = whatsappCS || "6281385042303";
        const cleanNumber = waNumber.replace(/[^0-9]/g, "");
        const formattedAmount = formatCurrency(modalAmount);
        
        const friendlyMethod =
          paymentMethod === "DQ" ? "QRIS" :
          paymentMethod === "BC" ? "BCA Virtual Account" :
          paymentMethod === "M2" ? "Mandiri Virtual Account" :
          paymentMethod === "I1" ? "BNI Virtual Account" :
          paymentMethod === "BR" ? "BRI Virtual Account" :
          paymentMethod === "DA" ? "DANA E-Wallet" :
          paymentMethod === "OV" ? "OVO E-Wallet" :
          paymentMethod === "SP" ? "ShopeePay" : paymentMethod;

        const textMessage = `Assalamu'alaikum Wr. Wb. Kak Admin BIMAI,\n\nSaya telah mengisi formulir donasi wakaf di website dengan rincian berikut:\n\n👉 *Nama Donatur:* ${donorName}\n👉 *No. WhatsApp:* ${donorPhone}\n👉 *Atas Nama Wakif:* ${wakifName || "-"}\n👉 *Nominal Wakaf:* *${formattedAmount}*\n👉 *Niat/Doa:* ${donorNiat ? `"${donorNiat}"` : "-"}\n👉 *Metode Pilihan:* ${friendlyMethod}\n👉 *Order ID:* ${data.orderId}\n\nMohon dibantu instruksi rekening transfer untuk penyelesaian wakafnya. Terima kasih.`;

        const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(textMessage)}`;
        
        // Trigger TikTok Pixel identify & CompletePayment/Purchase events
        if (typeof window !== "undefined" && window.ttq) {
          try {
            // Hashing phone number with SHA-256 for advanced matching (PII data postback)
            let rawPhone = donorPhone.replace(/[^0-9]/g, "");
            if (rawPhone.startsWith("0")) {
              rawPhone = "62" + rawPhone.substring(1);
            }
            const standardPhone = "+" + rawPhone;
            
            const utf8 = new TextEncoder().encode(standardPhone.trim().toLowerCase());
            const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashedPhone = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

            window.ttq.identify({
              phone_number: hashedPhone
            });
          } catch (hashErr) {
            console.error("Gagal meng-hash data donatur:", hashErr);
          }

          // CompletePayment Event
          window.ttq.track("CompletePayment", {
            contents: [
              {
                content_id: "wakaf_braille",
                content_type: "product",
                content_name: modalPackageName
              }
            ],
            value: Number(modalAmount),
            currency: "IDR"
          });

          // Purchase Event
          window.ttq.track("Purchase", {
            contents: [
              {
                content_id: "wakaf_braille",
                content_type: "product",
                content_name: modalPackageName
              }
            ],
            value: Number(modalAmount),
            currency: "IDR"
          });
        }

        // Trigger Meta Pixel Purchase & Lead events with eventID for Server CAPI Deduplication
        if (typeof window !== "undefined" && window.fbq) {
          window.fbq("track", "Purchase", {
            content_name: modalPackageName,
            value: Number(modalAmount),
            currency: "IDR"
          }, { eventID: data.orderId });
          window.fbq("track", "Lead", {
            content_name: modalPackageName,
            value: Number(modalAmount),
            currency: "IDR"
          }, { eventID: data.orderId });
        }

        // Redirect to WhatsApp with a 300ms delay to allow browser beacons to flush reliably
        setTimeout(() => {
          window.location.href = waUrl;
        }, 300);
      } else {
        showAlert(
          data.message ||
            "Gagal memproses inkuiri pembayaran. Silakan coba lagi.",
          "error",
        );
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      showAlert("Koneksi gagal. Silakan periksa jaringan Anda.", "error");
      setIsSubmitting(false);
    }
  };

  const handleCopyToClipboard = (text, elementId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus((prev) => ({ ...prev, [elementId]: true }));
      setTimeout(() => {
        setCopyStatus((prev) => ({ ...prev, [elementId]: false }));
      }, 2000);
    });
  };

  const handleShareCampaign = () => {
    const campaignUrl = window.location.href;
    const campaignTitle = "Wakaf Al-Qur'an Braille";

    if (navigator.share) {
      navigator
        .share({
          title: campaignTitle,
          text: "Bantu tunanetra Muslim beribadah secara mandiri dengan Wakaf Al-Qur'an Braille.",
          url: campaignUrl,
        })
        .catch((err) => console.log("Error sharing:", err));
    } else {
      navigator.clipboard.writeText(campaignUrl).then(() => {
        showAlert("Tautan kampanye berhasil disalin ke clipboard!", "success");
      });
    }
  };

  // --- STATS NUMBERS COUNTER EFFECT ---
  const [mushafCount, setMushafCount] = useState(0);
  const [penerimaCount, setPenerimaCount] = useState(0);
  const [binaanCount, setBinaanCount] = useState(0);

  useEffect(() => {
    const animateCount = (target, setter) => {
      let start = 0;
      const duration = 1500;
      const finalStepTime = 20;
      const increment = Math.ceil(target / (duration / finalStepTime));
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(start);
        }
      }, finalStepTime);
    };

    animateCount(850, setMushafCount);
    animateCount(2500, setPenerimaCount);
    animateCount(34, setBinaanCount);
  }, []);

  // --- RENDER HELPERS ---
  const translateToBraille = (text) => {
    const cleanText = text
      .toLowerCase()
      .replace(/[^a-z ]/g, "")
      .substring(0, 20);
    return cleanText.split("").map((char) => ({
      char,
      dots: brailleMap[char] || [0, 0, 0, 0, 0, 0],
    }));
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amt);
  };

  const formatTimeAgo = (isoString) => {
    if (!mounted) return "...";
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    if (diffMs < 0) return "Baru saja";
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60)
      return diffMin <= 0 ? "Baru saja" : `${diffMin} menit yang lalu`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari yang lalu`;
  };

  return (
    <>
      {/* Header Brand */}
      <header className="brand-header">
        <div className="container brand-container">
          <img
            src="/images/bimai-logo.png"
            alt="Logo BIMAI"
            className="brand-logo"
            onError={(e) => {
              e.target.src = "/images/bimai.ico";
            }}
          />
          <span className="brand-title">Yayasan Bina Masyarakat Indonesia</span>
        </div>
      </header>

      {/* Campaign Main Section */}
      <section className="campaign-section">
        <div className="container">
          <div className="campaign-grid">
            {/* Left Column: Image */}
            <div className="campaign-media">
              <div className="campaign-img-container">
                <img
                  src="/images/seorang_tunanetra_sedang_membaca_alquran_braille_dipandu_oleh_ustadz_yang_juga_tunanetra_potrait_2.webp"
                  alt="Membaca Al-Qur'an Braille"
                  loading="eager"
                />
                <div className="campaign-img-overlay"></div>
              </div>
              <p className="campaign-img-caption">
                Sahabat tunanetra mengaji dan menghafal Kalamullah menggunakan
                mushaf Al-Qur'an Braille secara mandiri.
              </p>
            </div>

            {/* Right Column: Details & Actions */}
            <div className="campaign-details">
              <span className="campaign-category">Wakaf Al-Qur'an</span>
              <h1 className="campaign-title">
                Wakaf Al-Qur'an Braille: Terangi Hati & Bantu Kemandirian
                Sahabat Tunanetra
              </h1>

              <div className="campaign-tracker-box">
                <div className="campaign-collected">
                  <span className="collected-label">Terkumpul</span>
                  <h2 className="collected-amount">
                    {formatCurrency(collectedAmount)}
                  </h2>
                  <span className="target-amount">
                    dari target {formatCurrency(targetAmount)}
                  </span>
                </div>

                <div className="donation-progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                <div className="campaign-stats">
                  <div className="stat-item">
                    <span className="stat-value">{progressPercent}%</span>
                    <span className="stat-label">Terkumpul</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{donorsCount}</span>
                    <span className="stat-label">Donatur</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">45</span>
                    <span className="stat-label">Hari Lagi</span>
                  </div>
                </div>
              </div>

              {/* Fundraiser Info */}
              <div className="fundraiser-info">
                <img
                  src="/images/bimai-logo.png"
                  alt="Yayasan BIMAI"
                  className="fundraiser-logo"
                  onError={(e) => {
                    e.target.src = "/images/bimai.ico";
                  }}
                />
                <div className="fundraiser-meta">
                  <span className="fundraiser-name">
                    Yayasan Bina Masyarakat Indonesia
                  </span>
                  <span className="verified-badge">
                    <i className="ri-checkbox-circle-fill"></i> Terverifikasi Resmi
                  </span>
                </div>
              </div>

              {/* Legal & Trust Verification Badges */}
              <div className="trust-badges-card">
                <div className="trust-badge-item">
                  <i className="ri-shield-check-fill text-emerald-600"></i>
                  <span>
                    <strong>Yayasan Resmi Legal</strong> (SK Kemenkumham: AHU-0010921.AH.01.04.Tahun 2017)
                  </span>
                </div>
                <div className="trust-badge-item">
                  <i className="ri-file-list-3-fill text-amber-600"></i>
                  <span>
                    <strong>Laporan Transparan</strong> bukti penyaluran dikirim berkala via WA/Email
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="campaign-actions">
                <a href="#packages" className="btn-donate-now">
                  Donasi Sekarang
                </a>
                <button className="btn-share" onClick={handleShareCampaign}>
                  <i className="ri-share-forward-line"></i> Bagikan
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1. DETAIL PROGRAM SECTION */}
      <section
        id="detail-program"
        className="detail-program-section"
        ref={detailRef}
      >
        <div className="container">
          <div
            className={`detail-collapsible ${isDetailExpanded ? "expanded" : ""}`}
          >
            <h3 className="detail-title">Detail Program</h3>
            <h2 className="detail-heading">
              WAKAF AL-QUR'AN BRAILLE: WUJUDKAN KEMANDIRIAN IBADAH SAHABAT TUNANETRA
            </h2>
            <h3 className="detail-subheading">
              Menghadirkan Mushaf Titik Timbul Layak untuk Menemani Setiap Ayat yang Dilafalkan
            </h3>

            <div className="detail-text-content">
              <p>
                Bagi sahabat disabilitas netra, meraba titik-titik timbul pada
                mushaf Braille adalah satu-satunya cara berinteraksi langsung
                dengan Kalamullah secara mandiri. Meskipun tidak dapat melihat
                indahnya tulisan ayat, semangat mereka untuk mengaji,
                tadarus, dan menghafal Al-Qur'an sungguh luar biasa.
              </p>
              <p>
                Berbeda dari Al-Qur'an biasa, pencetakan 1 set Al-Qur'an Braille
                memerlukan kertas khusus yang tebal dan tahan rabaan berulang
                kali, serta terdiri dari 30 jilid buku fisik yang tebal. Karena
                proses cetak yang terbatas, masih banyak santri tunanetra di
                pesantren inklusi dan SLB yang harus bergantian menggunakan
                mushaf.
              </p>

              <div className="inline-image-box">
                <img
                  src="/images/murid_dewasa_sedang_membaca_alquran_braille_dibantu_ustadz_potrait.webp"
                  alt="Bimbingan membaca Al-Qur'an Braille"
                  loading="lazy"
                />
                <p className="inline-image-caption">
                  Bimbingan belajar mengaji Al-Qur'an Braille dipandu secara
                  telaten oleh ustadz pembimbing tunanetra.
                </p>
              </div>

              <p>
                Yayasan Bina Masyarakat Indonesia (BIMAI) berikhtiar
                memfasilitasi pencetakan dan penyaluran mushaf Al-Qur'an Braille
                ke berbagai pesantren disabilitas, Sekolah Luar Biasa (SLB-A),
                dan rumah tahfidz tunanetra. Setiap huruf yang diraba dan
                dilafalkan para santri akan menjadi pahala jariyah yang terus
                mengalir abadi bagi para wakif.
              </p>

              <div className="inline-image-box">
                <img
                  src="/images/tunanetra_perempuan_dewasa_dan_anak-anak_sedang_berbincang_potrait_5.webp"
                  alt="Kebersamaan santri tunanetra"
                  loading="lazy"
                />
                <p className="inline-image-caption">
                  Kebersamaan para santriwati tunanetra binaan Yayasan BIMAI
                  saat sesi pembinaan rohani dan kelancaran hafalan.
                </p>
              </div>

              <p>
                Mari jadikan sebagian harta kita sebagai penolong di akhirat
                kelak. Melalui wakaf mushaf Al-Qur'an Braille, kita mendampingi
                perjuangan mereka meraih keberkahan hidup dan mendekatkan diri
                kepada Allah SWT.
              </p>

              <div className="inline-image-box">
                <img
                  src="/images/foto_bersama_pengurus_bimai_bersama_anak-anak_tunanetra_dalam_acara_santunan-dan-buka-puasa-bersama.webp"
                  alt="Penyaluran wakaf dan kebahagiaan santri"
                  loading="lazy"
                />
                <p className="inline-image-caption">
                  Senyum kebahagiaan para santri tunanetra dhuafa saat menerima
                  dukungan sarana belajar dan santunan dari para donatur.
                </p>
              </div>

              <div className="jariyah-banner">
                <span className="jariyah-text">
                  <i className="ri-heart-line"></i> Setiap huruf yang diraba dan dibaca mengalirkan pahala jariyah abadi
                </span>
              </div>

              <div className="cara-berwakaf-container">
                <h3 className="cara-berwakaf-title">Cara Berwakaf:</h3>
                <ul className="cara-berwakaf-list">
                  <li>
                    <span className="checkmark-icon">
                      <i className="ri-checkbox-circle-fill"></i>
                    </span>
                    <div className="step-desc">
                      <strong>Klik Tombol "WAKAF SEKARANG"</strong>
                      <span>
                        Klik tombol donasi di atas atau pilih paket wakaf yang
                        tersedia.
                      </span>
                    </div>
                  </li>
                  <li>
                    <span className="checkmark-icon">
                      <i className="ri-checkbox-circle-fill"></i>
                    </span>
                    <div className="step-desc">
                      <strong>Masukkan Nominal Donasi</strong>
                      <span>
                        Tentukan nominal wakaf yang ingin Anda salurkan.
                      </span>
                    </div>
                  </li>
                  <li>
                    <span className="checkmark-icon">
                      <i className="ri-checkbox-circle-fill"></i>
                    </span>
                    <div className="step-desc">
                      <strong>Pilih Metode Donasi & Bayar</strong>
                      <span>
                        Pilih metode pembayaran aman (QRIS, VA Bank Transfer,
                        atau E-Wallet).
                      </span>
                    </div>
                  </li>
                  <li>
                    <span className="checkmark-icon">
                      <i className="ri-checkbox-circle-fill"></i>
                    </span>
                    <div className="step-desc">
                      <strong>Lakukan Pembayaran & Konfirmasi</strong>
                      <span>
                        Lakukan pembayaran instan dan sistem akan
                        memverifikasinya. Anda juga bisa mengonfirmasi ke admin
                        via WA.
                      </span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="legalitas-box">
                <h3 className="legalitas-title">
                  LEGALITAS YAYASAN RESMI KAMI:
                </h3>
                <p>
                  PENGESAHAN KEPUTUSAN MENTERI HUKUM DAN HAK ASASI MANUSIA
                  REPUBLIK INDONESIA NO:
                </p>
                <p className="legal-doc-num">AHU-0010921.AH.01.04.Tahun 2017</p>
                <p>SK KESBANGPOL: 220/845 - Kesbangpol / 2019</p>
                <p>NPWP YAYASAN: 75.821.205.8-434.000</p>
              </div>
            </div>

            <div className="detail-fade-overlay"></div>
          </div>

          <button
            className="btn-read-more"
            id="btn-detail-more"
            onClick={() => {
              const next = !isDetailExpanded;
              setIsDetailExpanded(next);
              if (!next && detailRef.current) {
                detailRef.current.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            {isDetailExpanded ? "Tutup Detail" : "Selengkapnya"}{" "}
            <i
              className={`ri-arrow-${isDetailExpanded ? "up" : "down"}-s-line`}
            ></i>
          </button>
        </div>
      </section>

      {/* 2. DOKUMENTASI REALITAS & GALERI FOTO INTERAKTIF */}
      <section id="galeri-dokumentasi" className="gallery-section">
        <div className="container">
          <div className="section-header-centered">
            <span className="section-badge-tag">
              <i className="ri-camera-lens-fill"></i> Galeri Dokumentasi Realitas
            </span>
            <h2 className="gallery-section-title">
              Momen Perjuangan & Kebersamaan Santri Tunanetra
            </h2>
            <p className="gallery-section-subtitle">
              Setiap foto menyimpan kisah nyata semangat mereka mengaji.
              <span className="desktop-hint"> Arahkan kursor ke foto (desktop) </span>
              <span className="mobile-hint"> Ketuk foto (mobile) </span>
              untuk membaca penjelasan kisah di balik momen ini.
            </p>
          </div>

          <div className="gallery-grid">
            {galleryItems.map((item) => {
              const isCaptionActive = activeGalleryId === item.id;
              return (
                <div
                  key={item.id}
                  className={`gallery-card-item ${isCaptionActive ? "active-touch" : ""}`}
                  onClick={() =>
                    setActiveGalleryId(activeGalleryId === item.id ? null : item.id)
                  }
                >
                  <div className="gallery-image-box">
                    <img
                      src={item.src}
                      alt={item.alt}
                      loading="lazy"
                      className="gallery-img"
                    />
                    
                    {/* Desktop Hover Overlay */}
                    <div className="gallery-overlay-desktop">
                      <span className="gallery-tag">
                        <i className="ri-heart-pulse-fill"></i> BIMAI Dokumentasi
                      </span>
                      <h4 className="gallery-title">{item.title}</h4>
                      <p className="gallery-caption">{item.caption}</p>
                    </div>

                    {/* Mobile Tap Trigger Indicator */}
                    <div className="mobile-tap-badge">
                      <i className={isCaptionActive ? "ri-close-line" : "ri-information-line"}></i>
                      <span>{isCaptionActive ? "Tutup" : "Keterangan"}</span>
                    </div>
                  </div>

                  {/* Mobile Expandable Caption Drawer */}
                  {isCaptionActive && (
                    <div className="mobile-caption-drawer">
                      <h4 className="mobile-caption-title">{item.title}</h4>
                      <p className="mobile-caption-desc">{item.caption}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. DONATUR SECTION */}
      <section
        id="donatur-list-section"
        className="donatur-section bg-alt"
        ref={donaturRef}
      >
        <div className="container">
          <h3 className="panel-title">
            Daftar Donatur ({donorsCount} Donatur)
          </h3>
          <p className="donatur-subtitle">
            Terima kasih atas kepedulian Anda. Semoga menjadi amal jariyah yang
            terus mengalir:
          </p>

          <div
            className={`donatur-collapsible ${isDonaturExpanded ? "expanded" : ""}`}
          >
            <div className="donatur-list" id="realtime-donatur-list">
              {donorsList.length === 0 ? (
                <p
                  className="no-donors-text"
                  style={{
                    textAlign: "center",
                    color: "var(--text-muted)",
                    width: "100%",
                    padding: "20px 0",
                    gridColumn: "1/-1",
                  }}
                >
                  Belum ada donatur yang terverifikasi.
                </p>
              ) : (
                donorsList.map((donor, idx) => (
                  <div className="donatur-item" key={idx}>
                    <div className="donatur-avatar">
                      <i
                        className={
                          donor.niat ? "ri-user-heart-line" : "ri-user-line"
                        }
                      ></i>
                    </div>
                    <div className="donatur-info">
                      <div className="donatur-meta">
                        <span className="donatur-name">{donor.donor_name}</span>
                        <span className="donatur-time">
                          {formatTimeAgo(donor.created_at)}
                        </span>
                      </div>
                      <span className="donatur-amount">
                        {formatCurrency(donor.amount)}
                      </span>
                      {donor.wakif_name && (
                        <p
                          className="donatur-wakif-label"
                          style={{
                            fontSize: "12px",
                            color: "var(--primary)",
                            fontWeight: "600",
                            marginTop: "2px",
                          }}
                        >
                          Atas Nama Wakif: {donor.wakif_name}
                        </p>
                      )}
                      {donor.niat && (
                        <p className="donatur-prayer">"{donor.niat}"</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {donorsList.length > 2 && (
            <button
              className="btn-read-more"
              id="btn-donatur-more"
              onClick={() => {
                const next = !isDonaturExpanded;
                setIsDonaturExpanded(next);
                if (!next && donaturRef.current) {
                  donaturRef.current.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              {isDonaturExpanded ? "Tutup" : "Selengkapnya"}{" "}
              <i
                className={`ri-arrow-${isDonaturExpanded ? "up" : "down"}-s-line`}
              ></i>
            </button>
          )}
        </div>
      </section>

      {/* Interactive Braille Translator Section */}
      <section className="translator-section">
        <div className="container">
          <h2 className="translator-title">Kenali Aksara Braille</h2>
          <p className="translator-subtitle">
            Sahabat tunanetra mengaji menggunakan kepekaan ujung jari mereka.
            Coba ketik kata di bawah untuk mensimulasikan teks Anda ke dalam
            titik Braille secara instan!
          </p>

          <div className="translator-box">
            <div className="translator-input-group">
              <label htmlFor="braille-input">
                Ketik Nama atau Teks Anda (max 20 kar):
              </label>
              <input
                type="text"
                id="braille-input"
                value={translatorInput}
                onChange={(e) => setTranslatorInput(e.target.value)}
                placeholder="Contoh: bismillah..."
                maxLength="20"
                autoComplete="off"
              />
            </div>

            <div className="braille-output-grid" id="braille-output">
              {translateToBraille(translatorInput).length === 0 ? (
                <p className="translator-placeholder">
                  Ketik kata di atas untuk melihat terjemahan Braille...
                </p>
              ) : (
                translateToBraille(translatorInput).map((item, idx) => (
                  <div className="braille-cell-wrapper" key={idx}>
                    <div className="braille-cell">
                      {item.dots.map((isActive, dotIdx) => (
                        <div
                          className={`braille-dot ${isActive ? "active" : ""}`}
                          key={dotIdx}
                        />
                      ))}
                    </div>
                    <span className="braille-label">
                      {item.char === " " ? "spasi" : item.char}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Donation Packages Section */}
      <section id="packages" className="donation-package-section bg-alt">
        <div className="container">
          <h2 className="package-title">
            Pilihan Paket Wakaf Al-Qur'an Braille
          </h2>
          <p className="package-subtitle">
            Setiap huruf yang mereka raba dan lafalkan akan mengalirkan pahala
            jariyah abadi untuk Anda & keluarga.
          </p>

          {/* Package Cards */}
          <div className="package-grid">
            <div
              className="package-card"
              data-package-name="Paket Wakaf 1 Juz"
              data-package-amount="75000"
            >
              <h3>Paket Wakaf 1 Juz</h3>
              <p className="package-desc">
                Wakaf patungan pencetakan & penyaluran 1 Juz mushaf Braille
                untuk tunanetra.
              </p>
              <span className="package-price">Rp 75.000</span>
              <button
                className="btn-select-package"
                onClick={() => handleOpenModal("Paket Wakaf 1 Juz", 75000)}
              >
                Pilih Paket
              </button>
            </div>

            <div
              className="package-card"
              data-package-name="Paket Wakaf 5 Juz"
              data-package-amount="375000"
            >
              <h3>Paket Wakaf 5 Juz</h3>
              <p className="package-desc">
                Membantu pencetakan 5 Juz mushaf Al-Qur'an Braille tebal
                berkualitas tinggi.
              </p>
              <span className="package-price">Rp 375.000</span>
              <button
                className="btn-select-package"
                onClick={() => handleOpenModal("Paket Wakaf 5 Juz", 375000)}
              >
                Pilih Paket
              </button>
            </div>

            <div
              className="package-card"
              data-package-name="Wakaf Setengah Set (15 Juz)"
              data-package-amount="1125000"
            >
              <h3>Wakaf Setengah Set (15 Juz)</h3>
              <p className="package-desc">
                Wakaf setengah set Al-Qur'an Braille tebal untuk perpustakaan
                SLB/masjid inklusi.
              </p>
              <span className="package-price">Rp 1.125.000</span>
              <button
                className="btn-select-package"
                onClick={() =>
                  handleOpenModal("Wakaf Setengah Set (15 Juz)", 1125000)
                }
              >
                Pilih Paket
              </button>
            </div>

            <div
              className="package-card popular"
              data-package-name="Wakaf Lengkap 1 Set (30 Juz)"
              data-package-amount="2250000"
            >
              <span className="package-badge">Paling Utama</span>
              <h3>Wakaf Lengkap (30 Juz)</h3>
              <p className="package-desc">
                Menghadirkan 1 set lengkap (30 jilid besar) Al-Qur'an Braille
                untuk 1 tunanetra.
              </p>
              <span className="package-price">Rp 2.250.000</span>
              <button
                className="btn-select-package"
                onClick={() =>
                  handleOpenModal("Wakaf Lengkap 1 Set (30 Juz)", 2250000)
                }
              >
                Pilih Paket
              </button>
            </div>
          </div>

          {/* Custom Donation Box */}
          <div className="custom-donate-box">
            <h4>Ingin berwakaf dengan nominal khusus?</h4>
            <div className="custom-input-group">
              <div className="custom-input-wrapper">
                <span>Rp</span>
                <input
                  type="number"
                  id="custom-amount"
                  value={customAmountText}
                  onChange={(e) => setCustomAmountText(e.target.value)}
                  placeholder="Masukkan nominal bebas (min 75k)..."
                  min="75000"
                />
              </div>
              <button
                className="btn-custom-action"
                id="btn-custom-donate"
                onClick={handleCustomDonate}
              >
                Wakaf Kustom
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Wasilah / Tawasul Hajat Section */}
      <section>
        <div className="container">
          <h2 className="wasilah-title">Meniatkan Wakaf untuk Hajat Anda</h2>
          <p className="wasilah-subtitle">
            Tawasul melalui amal shalih adalah sunnah. Anda dapat meniatkan
            pahala Wakaf Al-Qur'an Braille ini secara khusus sebagai ikhtiar
            hajat:
          </p>

          <div className="wasilah-grid">
            <div className="wasilah-card">
              <div className="wasilah-icon">
                <i className="ri-user-heart-line"></i>
              </div>
              <h4>Hadiah Orang Tua</h4>
              <p>
                Mengalirkan pahala jariyah tiada putus untuk ayah dan ibu
                tercinta, baik yang masih ada maupun sudah wafat.
              </p>
            </div>

            <div className="wasilah-card">
              <div className="wasilah-icon">
                <i className="ri-heart-pulse-line"></i>
              </div>
              <h4>Ikhtiar Kesembuhan</h4>
              <p>
                Wasilah sedekah tulus memohon jalan kesembuhan atas penyakit
                yang diderita diri atau keluarga.
              </p>
            </div>

            <div className="wasilah-card">
              <div className="wasilah-icon">
                <i className="ri-wallet-3-line"></i>
              </div>
              <h4>Pemberkahan Rezeki</h4>
              <p>
                Memohon kelancaran usaha, keberkahan pekerjaan, serta dibukanya
                pintu rezeki yang halal.
              </p>
            </div>

            <div className="wasilah-card">
              <div className="wasilah-icon">
                <i className="ri-compass-3-line"></i>
              </div>
              <h4>Hajat / Impian Khusus</h4>
              <p>
                Wasilah memohon kemudahan hajat penting (lulus studi, jodoh,
                keturunan, keselamatan).
              </p>
            </div>
          </div>

          <div className="prayer-box">
            <p className="prayer-title">Doa Penerimaan Amal Wakaf</p>
            <p className="prayer-arabic">
              رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ
            </p>
            <p className="prayer-latin">
              "Rabbana taqabbal minna innaka antas-sami'ul-'alim"
            </p>
            <p className="prayer-translation">
              Artinya: "Ya Tuhan kami, terimalah dari kami (amal kami),
              sesungguhnya Engkaulah Yang Maha Mendengar lagi Maha Mengetahui."
              (QS. Al-Baqarah: 127)
            </p>
          </div>
        </div>
      </section>

      {/* Keutamaan Section */}
      <section className="bg-alt">
        <div className="container">
          <h2 className="keutamaan-title">Keutamaan Wakaf Al-Qur'an Braille</h2>
          <div className="benefit-list">
            <div className="benefit-item">
              <div className="benefit-number">1</div>
              <div className="benefit-text">
                <h3>Pahala Terus Mengalir Abadi</h3>
                <p>
                  Setiap kali mushaf Braille diraba, dibaca, dan dihafalkan oleh
                  sahabat disabilitas netra, pahalanya terus mengalir ke
                  rekening akhirat Anda tanpa putus.
                </p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">2</div>
              <div className="benefit-text">
                <h3>Mengatasi Keterbatasan Akses</h3>
                <p>
                  Karena biayanya sangat mahal dan ukurannya tebal, banyak
                  disabilitas netra pra-sejahtera kesulitan memiliki mushaf
                  Braille sendiri. Wakaf Anda adalah solusi.
                </p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">3</div>
              <div className="benefit-text">
                <h3>Kemandirian Ibadah Tunanetra</h3>
                <p>
                  Membantu disabilitas netra berinteraksi langsung dengan firman
                  Allah secara mandiri, tanpa perlu tergantung dibacakan oleh
                  orang lain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistik Realisasi Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stats-item">
              <span className="stats-number">{mushafCount}</span>
              <span className="stats-label">Mushaf Set Terdistribusi</span>
            </div>
            <div className="stats-item">
              <span className="stats-number">{penerimaCount}+</span>
              <span className="stats-label">Penerima Manfaat Terbantu</span>
            </div>
            <div className="stats-item">
              <span className="stats-number">{binaanCount}</span>
              <span className="stats-label">Yayasan & Komunitas Binaan</span>
            </div>
          </div>
        </div>
      </section>

      {/* Galeri Penyaluran Amanah (Carousel Section) */}
      <section className="bg-alt">
        <div className="container">
          <h2 className="gallery-title">Dokumentasi Penyaluran Wakaf</h2>
          <p className="gallery-subtitle">
            Geser/swipe kartu di bawah untuk melihat jejak kebermanfaatan donasi
            Anda:
          </p>

          <div className="gallery-carousel-wrapper">
            <div
              className="gallery-carousel"
              id="gallery-carousel"
              ref={carouselRef}
              onScroll={handleCarouselScroll}
            >
              <div className="gallery-item">
                <div className="gallery-img-container">
                  <img
                    src="/images/tim_bimai_berfoto_bersama_dengan_pengurus_yayasan_braille.webp"
                    alt="Serah Terima Mushaf Braille"
                    loading="lazy"
                  />
                </div>
                <div className="gallery-info">
                  <span className="gallery-tag">Penyaluran</span>
                  <h4>Silaturahmi Tim Bimai bersama Yayasan Tunanetra</h4>
                  <p>
                    Kunjungan dan Silaturahmi ke Yayasan yang mengurus
                    tunanetra, yang nantinya akan bermitra dengan BIMAI.
                  </p>
                </div>
              </div>

              <div className="gallery-item">
                <div className="gallery-img-container">
                  <img
                    src="/images/seorang_santri_tunanetra_sedang_membaca_alquran_braille_secara_mandiri_potrait.webp"
                    alt="Kelas Mengaji Braille"
                    loading="lazy"
                  />
                </div>
                <div className="gallery-info">
                  <span className="gallery-tag">Edukasi</span>
                  <h4>Kelas Mengaji Braille</h4>
                  <p>
                    Pembinaan cara meraba dan melafalkan ayat suci Al-Qur'an
                    Braille bagi anak-anak tunanetra sejak dini.
                  </p>
                </div>
              </div>

              <div className="gallery-item">
                <div className="gallery-img-container">
                  <img
                    src="/images/para_murid_sedang_membaca_masing_masing_potrait.webp"
                    alt="Wakaf Al-Qur'an Braille"
                    loading="lazy"
                  />
                </div>
                <div className="gallery-info">
                  <span className="gallery-tag">Distribusi</span>
                  <h4>Wakaf Al-Qur'an Braille</h4>
                  <p>
                    Penyediaan Al-Qur'an Braille di perpustakaan, pesantren,
                    masjid dan yayasan sosial pelosok daerah.
                  </p>
                </div>
              </div>

              <div className="gallery-item">
                <div className="gallery-img-container">
                  <img
                    src="/images/acara_bukber_anak-anak_tunanetra_landscape.webp"
                    alt="Santunan & Binaan Tunanetra"
                    loading="lazy"
                  />
                </div>
                <div className="gallery-info">
                  <span className="gallery-tag">Santunan</span>
                  <h4>Santunan Dhuafa Tunanetra</h4>
                  <p>
                    Pemberian santunan sembako dan biaya operasional mengaji
                    bagi keluarga tunanetra pra-sejahtera.
                  </p>
                </div>
              </div>
            </div>

            <div className="carousel-dots">
              {[0, 1, 2, 3].map((idx) => (
                <span
                  key={idx}
                  className={`dot ${activeSlide === idx ? "active" : ""}`}
                  onClick={() => scrollToSlide(idx)}
                ></span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testi-section bg-alt">
        <div className="container">
          <h2 className="testi-title">Cerita Kebaikan & Dampak Nyata</h2>
          <p className="testi-subtitle">
            Kisah kebahagiaan para tunanetra penerima manfaat dan donatur
            program:
          </p>

          <div className="testi-list">
            <div className="testi-item">
              <div className="testi-user">
                <div className="testi-avatar">
                  <i className="ri-user-heart-line"></i>
                </div>
                <div className="testi-meta">
                  <h4>M. Rizky</h4>
                  <span>Penerima Manfaat (Santri SLB)</span>
                </div>
              </div>
              <div className="testi-stars">
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
              </div>
              <p className="testi-content">
                "Dulu saya hanya bisa mendengar orang lain mengaji. Sejak ada
                Al-Qur'an Braille wakaf dari BIMAI ini, saya akhirnya bisa
                meraba dan membaca sendiri Kalamullah setiap selesai shalat."
              </p>
            </div>

            <div className="testi-item">
              <div className="testi-user">
                <div className="testi-avatar">
                  <i className="ri-user-star-line"></i>
                </div>
                <div className="testi-meta">
                  <h4>Ibu Hajah Fatimah</h4>
                  <span>Donatur Wakaf</span>
                </div>
              </div>
              <div className="testi-stars">
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
              </div>
              <p className="testi-content">
                "Saya niatkan wakaf 1 set lengkap atas nama almarhum suami saya.
                Laporannya lengkap sekali, dikirim foto saat diserahkan ke adik
                tunanetra di pesantren. Tenang rasanya."
              </p>
            </div>

            <div className="testi-item">
              <div className="testi-user">
                <div className="testi-avatar">
                  <i className="ri-home-heart-line"></i>
                </div>
                <div className="testi-meta">
                  <h4>Bpk. Hermawan</h4>
                  <span>Wiraswasta</span>
                </div>
              </div>
              <div className="testi-stars">
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
              </div>
              <p className="testi-content">
                "Melihat adik-adik disabilitas netra bersemangat meraba huruf
                Al-Qur'an membuat saya terharu. Program ini sangat transparan
                dan amanah dalam menyalurkan mushaf Braille."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="faq-section">
        <div className="container">
          <h2 className="faq-title">Pertanyaan yang Sering Diajukan</h2>
          <p className="faq-subtitle">
            Informasi lengkap mengenai program Wakaf Al-Qur'an Braille BIMAI:
          </p>

          <div className="faq-list">
            <div className={`faq-item ${activeFaqIndex === 0 ? "active" : ""}`}>
              <div
                className="faq-question"
                onClick={() =>
                  setActiveFaqIndex(activeFaqIndex === 0 ? null : 0)
                }
              >
                <h4>
                  Mengapa biaya pencetakan Al-Qur'an Braille sangat tinggi?
                </h4>
                <i className="ri-arrow-down-s-line"></i>
              </div>
              <div className="faq-answer">
                <div className="faq-answer-content">
                  Al-Qur'an Braille membutuhkan kertas khusus tebal (emboss)
                  agar titik-titiknya tidak mudah mengempis saat diraba berulang
                  kali. Ukurannya juga sangat besar; satu set lengkap 30 Juz
                  terdiri atas 30 jilid buku besar setebal kamus. Hal ini
                  membuat biaya bahan baku, cetak, dan distribusi menjadi jauh
                  lebih tinggi dibandingkan Al-Qur'an cetak biasa.
                </div>
              </div>
            </div>

            <div className={`faq-item ${activeFaqIndex === 1 ? "active" : ""}`}>
              <div
                className="faq-question"
                onClick={() =>
                  setActiveFaqIndex(activeFaqIndex === 1 ? null : 1)
                }
              >
                <h4>Bagaimana cara penyaluran amanah wakaf ini?</h4>
                <i className="ri-arrow-down-s-line"></i>
              </div>
              <div className="faq-answer">
                <div className="faq-answer-content">
                  Wakaf disalurkan secara berkala ke lembaga disabilitas netra,
                  Sekolah Luar Biasa (SLB-A), pesantren inklusi, masjid yang
                  menyediakan ruang ibadah inklusif, serta tunanetra Muslim
                  perorangan yang terverifikasi membutuhkan di berbagai pelosok
                  Indonesia.
                </div>
              </div>
            </div>

            <div className={`faq-item ${activeFaqIndex === 2 ? "active" : ""}`}>
              <div
                className="faq-question"
                onClick={() =>
                  setActiveFaqIndex(activeFaqIndex === 2 ? null : 2)
                }
              >
                <h4>
                  Apakah saya bisa berwakaf atas nama orang tua yang sudah
                  wafat?
                </h4>
                <i className="ri-arrow-down-s-line"></i>
              </div>
              <div className="faq-answer">
                <div className="faq-answer-content">
                  Bisa sekali. Anda dapat menuliskan nama orang tua atau
                  keluarga yang diniatkan di kolom "Atas Nama Wakif" pada
                  formulir. Kami akan mencatatnya dan menyalurkannya sebagai
                  pahala jariyah atas nama yang bersangkutan.
                </div>
              </div>
            </div>

            <div className={`faq-item ${activeFaqIndex === 3 ? "active" : ""}`}>
              <div
                className="faq-question"
                onClick={() =>
                  setActiveFaqIndex(activeFaqIndex === 3 ? null : 3)
                }
              >
                <h4>Apakah ada laporan transparansi untuk donatur?</h4>
                <i className="ri-arrow-down-s-line"></i>
              </div>
              <div className="faq-answer">
                <div className="faq-answer-content">
                  Ya. Setiap donatur yang melakukan pembayaran sukses akan
                  tercatat secara aman. Kami akan mengirimkan laporan
                  dokumentasi foto/video penyaluran mushaf Al-Qur'an Braille
                  secara berkala langsung melalui WhatsApp Anda.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Area: Combined CTA & Footer (Unified Premium Dark Section) */}
      <footer className="bottom-area">
        <div className="container">
          <div className="final-cta-block text-center">
            <h3>Alirkan Cahaya Qur'an Bersama Mereka</h3>
            <p>
              Bergabunglah bersama ratusan wakif lainnya dalam membantu
              disabilitas netra mengaji mandiri. Klik tombol di bawah untuk
              memilih paket wakaf Anda.
            </p>
            <a href="#packages" className="btn-whatsapp" id="cta-bottom">
              <i className="ri-heart-fill"></i>
              Saya Ingin Ikut Wakaf
            </a>
          </div>

          <hr className="bottom-divider" />

          <div className="footer-grid">
            <div className="footer-col">
              <h4 className="footer-col-title">Tentang Kami</h4>
              <div className="footer-brand">
                <img
                  src="/images/bimai-logo.png"
                  alt="Logo BIMAI"
                  className="footer-logo"
                  onError={(e) => {
                    e.target.src = "/images/bimai.ico";
                  }}
                />
                <h4>BIMAI</h4>
              </div>
              <p className="footer-desc">
                Yayasan Bina Masyarakat Indonesia (BIMAI) berkomitmen mengelola
                dan menyalurkan amanah wakaf serta donasi secara transparan,
                akuntabel, dan tepat sasaran demi kemaslahatan umat.
              </p>
              <div className="footer-legal-docs">
                <p>SK MENKUMHAM: AHU-0010921.AH.01.04.Tahun 2017</p>
                <p>SK KESBANGPOL: 220/845 - Kesbangpol / 2019</p>
                <p>NPWP: 75.821.205.8-434.000</p>
              </div>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Hubungi Kami</h4>
              <div className="footer-contact-list">
                <p>
                  <i className="ri-map-pin-line"></i>
                  <span>
                    Jalan Villa Pamulang Blok CF 1 No. 5, RT 011/RW 017, Pondok
                    Benda, Pamulang, Tangerang Selatan, 15416
                  </span>
                </p>
                <p>
                  <i className="ri-mail-line"></i>
                  <span>info@bimaipeduli.id</span>
                </p>
                <p>
                  <i className="ri-phone-line"></i>
                  <span>(021) 720-1234 / 0812-3456-789</span>
                </p>
              </div>
            </div>
          </div>

          <div className="footer-disclaimer-card">
            <div className="disclaimer-icon">
              <i className="ri-error-warning-line"></i>
            </div>
            <div className="disclaimer-content">
              <h5>PERHATIAN PENTING</h5>
              <p>
                Mohon pastikan transfer donasi/wakaf Anda hanya dikirimkan ke
                nomor rekening resmi atas nama{" "}
                <strong>Yayasan Bina Masyarakat Indonesia</strong> yang tertera
                di atas. Yayasan tidak pernah menggunakan rekening pribadi untuk
                program donasi umum.
              </p>
            </div>
          </div>

          <div className="footer-copyright text-center">
            <p>
              &copy; 2026 Yayasan Bina Masyarakat Indonesia (BIMAI). All Rights
              Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Sleek Premium Floating Sticky CTA Card for Mobile */}
      <div className="floating-cta-wrapper">
        <div className="floating-cta-card">
          <div className="floating-cta-meta">
            <span className="floating-cta-badge">
              <span className="floating-badge-dot"></span> Wakaf Al-Qur'an Braille
            </span>
            <span className="floating-cta-price">
              Patungan Mulai <strong>Rp 75rb</strong>
            </span>
          </div>
          <button
            type="button"
            className="btn-floating-cta-gold"
            id="cta-floating"
            onClick={() => handleOpenModal("Wakaf Patungan (1 Juz)", 75000)}
          >
            <span>Wakaf Sekarang</span>
            <i className="ri-arrow-right-line"></i>
          </button>
        </div>
      </div>

      {/* INTERACTIVE IMPRESSIVE DONATION MODAL */}
      <div
        className={`donation-modal ${isModalOpen ? "active" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) handleCloseModal();
        }}
      >
        <div className="modal-content modal-content-modern">
          {/* Header */}
          <div className="modal-header-modern">
            <div className="modal-header-brand">
              <div className="header-icon-box">
                <i className="ri-heart-pulse-fill"></i>
              </div>
              <div>
                <h3>Formulir Wakaf Al-Qur'an Braille</h3>
                <span className="modal-sub-badge">
                  <i className="ri-shield-check-fill"></i> Yayasan Resmi & Terverifikasi
                </span>
              </div>
            </div>
            <button className="modal-close" onClick={handleCloseModal}>
              &times;
            </button>
          </div>

          <form id="donation-confirm-form" onSubmit={handleFormSubmit}>
            <div className="modal-body modal-body-modern">
              {/* Compact Summary Header with Integrated Preset Chips */}
              <div className="modal-compact-summary">
                <div className="compact-summary-top">
                  <span className="compact-package-title">
                    {modalPackageName || "Wakaf Al-Qur'an Braille"}
                  </span>
                  <span className="compact-amount-badge">
                    {formatCurrency(modalAmount)}
                  </span>
                </div>

                {/* Integrated Preset Chips */}
                <div className="compact-preset-chips">
                  <button
                    type="button"
                    className={`compact-chip ${modalAmount === 75000 ? "active" : ""}`}
                    onClick={() => {
                      setModalPackageName("Paket Wakaf 1 Juz");
                      setModalAmount(75000);
                    }}
                  >
                    1 Juz (75rb)
                  </button>
                  <button
                    type="button"
                    className={`compact-chip ${modalAmount === 375000 ? "active" : ""}`}
                    onClick={() => {
                      setModalPackageName("Paket Wakaf 5 Juz");
                      setModalAmount(375000);
                    }}
                  >
                    5 Juz (375rb)
                  </button>
                  <button
                    type="button"
                    className={`compact-chip ${modalAmount === 750000 ? "active" : ""}`}
                    onClick={() => {
                      setModalPackageName("Paket Wakaf 10 Juz");
                      setModalAmount(750000);
                    }}
                  >
                    10 Juz (750rb)
                  </button>
                  <button
                    type="button"
                    className={`compact-chip ${modalAmount === 2250000 ? "active" : ""}`}
                    onClick={() => {
                      setModalPackageName("Paket Wakaf 1 Set (30 Juz)");
                      setModalAmount(2250000);
                    }}
                  >
                    30 Juz (2,25Jt)
                  </button>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="modal-form-group-compact">
                <label htmlFor="donor-name" className="input-label-compact">
                  <i className="ri-user-line"></i> Nama Lengkap Donatur <span className="req-star">*</span>
                </label>
                <input
                  type="text"
                  id="donor-name"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Nama lengkap Anda..."
                  required
                  className="input-compact"
                />
              </div>

              <div className="modal-form-group-compact">
                <label htmlFor="donor-phone" className="input-label-compact">
                  <i className="ri-whatsapp-line"></i> Nomor WhatsApp <span className="req-star">*</span>
                </label>
                <input
                  type="tel"
                  id="donor-phone"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  placeholder="Contoh: 08123456789..."
                  required
                  className="input-compact"
                />
              </div>

              <div className="modal-form-group-compact">
                <label htmlFor="wakif-name" className="input-label-compact">
                  <i className="ri-heart-line"></i> Atas Nama Wakif <span className="opt-tag">(Opsional)</span>
                </label>
                <input
                  type="text"
                  id="wakif-name"
                  value={wakifName}
                  onChange={(e) => setWakifName(e.target.value)}
                  placeholder="Niat atas nama siapa..."
                  className="input-compact"
                />
                <div className="suggestion-tags-scroll">
                  <button
                    type="button"
                    className="tag-pill-compact"
                    onClick={() =>
                      setWakifName(donorName ? `Hamba Allah (${donorName})` : "Hamba Allah")
                    }
                  >
                    + Hamba Allah
                  </button>
                  <button
                    type="button"
                    className="tag-pill-compact"
                    onClick={() => setWakifName("Kedua Orang Tua")}
                  >
                    + Kedua Orang Tua
                  </button>
                  <button
                    type="button"
                    className="tag-pill-compact"
                    onClick={() => setWakifName("Almarhum/ah Orang Tua")}
                  >
                    + Almarhum/ah
                  </button>
                </div>
              </div>

              <div className="modal-form-group-compact">
                <label htmlFor="donor-niat" className="input-label-compact">
                  <i className="ri-chat-quote-line"></i> Niat Wakaf & Doa Khusus <span className="opt-tag">(Opsional)</span>
                </label>
                <textarea
                  id="donor-niat"
                  rows="2"
                  value={donorNiat}
                  onChange={(e) => setDonorNiat(e.target.value)}
                  placeholder="Doa atau hajat khusus Anda..."
                  className="textarea-compact"
                ></textarea>
                <div className="suggestion-tags-scroll">
                  <button
                    type="button"
                    className="tag-pill-compact"
                    onClick={() =>
                      setDonorNiat((prev) =>
                        prev
                          ? `${prev}, Pahala mengalir abadi`
                          : "Semoga pahala jariyah ini mengalir abadi untuk keluarga."
                      )
                    }
                  >
                    + Pahala Jariyah
                  </button>
                  <button
                    type="button"
                    className="tag-pill-compact"
                    onClick={() =>
                      setDonorNiat((prev) =>
                        prev
                          ? `${prev}, Keberkahan rezeki`
                          : "Semoga diberi keberkahan rezeki dan kelancaran usaha."
                      )
                    }
                  >
                    + Berkah Rezeki
                  </button>
                  <button
                    type="button"
                    className="tag-pill-compact"
                    onClick={() =>
                      setDonorNiat((prev) =>
                        prev
                          ? `${prev}, Wasilah kesembuhan`
                          : "Semoga menjadi wasilah kesembuhan dan kesehatan."
                      )
                    }
                  >
                    + Kesembuhan
                  </button>
                </div>
              </div>

              <input
                type="hidden"
                name="payment-method"
                value={paymentMethod}
              />

              <div className="modal-submit-box-compact">
                <button
                  type="submit"
                  className="btn-submit-modal-impressive"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i> Memproses Pembayaran...
                    </>
                  ) : (
                    <>
                      <span>Lanjutkan Wakaf & Pembayaran</span>
                      <i className="ri-arrow-right-line"></i>
                    </>
                  )}
                </button>
                <div className="modal-security-footer">
                  <i className="ri-shield-flash-line"></i>
                  <span>Pembayaran Amanah & Terkonfirmasi Langsung</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Custom Alert Overlay */}
      <div
        className={`custom-alert-overlay ${customAlert.isOpen ? "active" : ""}`}
      >
        <div className="custom-alert-box">
          <div className={`custom-alert-icon ${customAlert.type}`}>
            {customAlert.type === "success" && (
              <i className="ri-checkbox-circle-fill"></i>
            )}
            {customAlert.type === "warning" && (
              <i className="ri-alert-fill"></i>
            )}
            {customAlert.type === "error" && (
              <i className="ri-close-circle-fill"></i>
            )}
            {customAlert.type === "info" && (
              <i className="ri-information-fill"></i>
            )}
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
      {/* IMMERSIVE HIGH-CONVERTING LOADING OVERLAY */}
      {isSubmitting && (
        <div className="immersive-loading-overlay active">
          <div className="immersive-loading-card">
            {/* Pulsing Glowing Icon */}
            <div className="loading-icon-wrapper">
              <div className="loading-pulse-ring"></div>
              <div className="loading-pulse-ring-outer"></div>
              <div className="loading-icon-center">
                <i className="ri-heart-pulse-fill"></i>
              </div>
            </div>

            {/* Dynamic Spiritual Text */}
            <h4 className="loading-title">Memproses Niat Wakaf...</h4>
            <div className="loading-phrase-container">
              <p className="loading-phrase-text" key={loadingPhraseIndex}>
                <i className="ri-sparkles-fill"></i> {loadingPhrases[loadingPhraseIndex]}
              </p>
            </div>

            {/* Micro Animated Progress Bar */}
            <div className="loading-progress-track">
              <div className="loading-progress-fill"></div>
            </div>

            <div className="loading-security-badge">
              <i className="ri-shield-check-fill"></i> System Connected & Encrypted SSL
            </div>
          </div>
        </div>
      )}
    </>
  );
}
