// --- SUPABASE CONFIGURATION ---
// Silakan isi sesuai dengan kredensial Supabase Anda
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

let supabaseClient = null;
if (typeof supabase !== 'undefined') {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Map Alfabet ke Titik Braille (representasi 6 titik: [titik1, titik2, titik3, titik4, titik5, titik6])
// 1 = terisi (hitam/hijau), 0 = kosong (abu-abu)
const brailleMap = {
  'a': [1, 0, 0, 0, 0, 0],
  'b': [1, 1, 0, 0, 0, 0],
  'c': [1, 0, 0, 1, 0, 0],
  'd': [1, 0, 0, 1, 1, 0],
  'e': [1, 0, 0, 0, 1, 0],
  'f': [1, 1, 0, 1, 0, 0],
  'g': [1, 1, 0, 1, 1, 0],
  'h': [1, 1, 0, 0, 1, 0],
  'i': [0, 1, 0, 1, 0, 0],
  'j': [0, 1, 0, 1, 1, 0],
  'k': [1, 0, 1, 0, 0, 0],
  'l': [1, 1, 1, 0, 0, 0],
  'm': [1, 0, 1, 1, 0, 0],
  'n': [1, 0, 1, 1, 1, 0],
  'o': [1, 0, 1, 0, 1, 0],
  'p': [1, 1, 1, 1, 0, 0],
  'q': [1, 1, 1, 1, 1, 0],
  'r': [1, 1, 1, 0, 1, 0],
  's': [0, 1, 1, 1, 0, 0],
  't': [0, 1, 1, 1, 1, 0],
  'u': [1, 0, 1, 0, 0, 1],
  'v': [1, 1, 1, 0, 0, 1],
  'w': [0, 1, 0, 1, 1, 1],
  'x': [1, 0, 1, 1, 0, 1],
  'y': [1, 0, 1, 1, 1, 1],
  'z': [1, 0, 1, 0, 1, 1],
  ' ': [0, 0, 0, 0, 0, 0]
};

document.addEventListener('DOMContentLoaded', () => {
  initBrailleTranslator();
  initDonationModal();
  initFAQAccordion();
  loadDonationData(); // Fetch real-time data from Supabase or Fallback
});

// --- INTERACTIVE BRAILLE TRANSLATOR ---
function initBrailleTranslator() {
  const inputEl = document.getElementById('braille-input');
  const outputContainer = document.getElementById('braille-output');

  if (!inputEl || !outputContainer) return;

  const translate = (text) => {
    outputContainer.innerHTML = '';
    
    // Batasi input agar visual tidak meluap (max 20 karakter)
    const cleanText = text.toLowerCase().replace(/[^a-z ]/g, '').substring(0, 20);
    
    if (cleanText.length === 0) {
      outputContainer.innerHTML = '<p class="translator-placeholder">Ketik kata di atas untuk melihat terjemahan Braille...</p>';
      return;
    }

    for (let char of cleanText) {
      const dots = brailleMap[char] || [0, 0, 0, 0, 0, 0];
      
      // Buat cell pembungkus huruf
      const cell = document.createElement('div');
      cell.className = 'braille-cell';
      
      // Buat 6 titik dalam grid 2x3
      dots.forEach((isActive, idx) => {
        const dot = document.createElement('div');
        dot.className = `braille-dot ${isActive ? 'active' : ''}`;
        cell.appendChild(dot);
      });

      // Tambahkan label huruf kecil di bawah cell
      const label = document.createElement('span');
      label.className = 'braille-label';
      label.innerText = char === ' ' ? 'spasi' : char;

      const cellWrapper = document.createElement('div');
      cellWrapper.className = 'braille-cell-wrapper';
      cellWrapper.appendChild(cell);
      cellWrapper.appendChild(label);

      outputContainer.appendChild(cellWrapper);
    }
  };

  inputEl.addEventListener('input', (e) => {
    translate(e.target.value);
  });

  // Jalankan translasi awal "bismillah" sebagai contoh
  translate('bismillah');
}

// --- INTERACTIVE DONATION MODAL ---
function initDonationModal() {
  const modal = document.getElementById('donation-modal');
  const closeBtn = document.querySelector('.modal-close');
  const packageCards = document.querySelectorAll('.package-card');
  const donationForm = document.getElementById('donation-confirm-form');
  
  // Input fields di modal
  const modalPkgInput = document.getElementById('modal-package-name');
  const modalAmountInput = document.getElementById('modal-amount');
  const customAmountInput = document.getElementById('custom-amount');

  if (!modal) return;

  const openModal = (packageName, amount) => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock scroll

    if (modalPkgInput) modalPkgInput.value = packageName;
    if (modalAmountInput) {
      modalAmountInput.value = amount;
      formatAmountDisplay(amount);
    }
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Unlock scroll
  };

  // Event listener untuk tombol close modal
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Event listener untuk kartu paket donasi
  packageCards.forEach(card => {
    const btn = card.querySelector('.btn-select-package');
    if (btn) {
      btn.addEventListener('click', () => {
        const name = card.getAttribute('data-package-name');
        const amount = parseInt(card.getAttribute('data-package-amount'));
        openModal(name, amount);
      });
    }
  });

  // Event listener untuk custom donation input
  const customBtn = document.getElementById('btn-custom-donate');
  if (customBtn && customAmountInput) {
    customBtn.addEventListener('click', () => {
      let amount = parseInt(customAmountInput.value);
      if (isNaN(amount) || amount < 10000) {
        alert('Minimal nominal wakaf kustom adalah Rp 10.000');
        return;
      }
      openModal('Wakaf Kustom', amount);
    });
  }

  // Format nominal di tampilan modal
  const formatAmountDisplay = (amount) => {
    const displayEl = document.getElementById('formatted-amount-display');
    if (displayEl) {
      displayEl.innerText = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount);
    }
  };

  // Aksi Copy Nomor Rekening
  window.copyToClipboard = (elementId, btnEl) => {
    const text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text).then(() => {
      const originalText = btnEl.innerHTML;
      btnEl.innerHTML = '<i class="ri-check-line"></i> Terkopi!';
      btnEl.style.background = '#059669';
      setTimeout(() => {
        btnEl.innerHTML = originalText;
        btnEl.style.background = '';
      }, 2000);
    });
  };

  // Form submit (Simpan ke Supabase + Pengiriman Niat via WhatsApp)
  if (donationForm) {
    donationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const donorName = document.getElementById('donor-name').value;
      const donorPhone = document.getElementById('donor-phone').value;
      const donorNiat = document.getElementById('donor-niat').value;
      const pkgName = modalPkgInput.value;
      const amount = parseInt(modalAmountInput.value);

      const hasConfiguredSupabase = supabaseClient && 
        SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co' && 
        SUPABASE_ANON_KEY !== 'YOUR_ANON_KEY';

      // Simpan data donatur ke Supabase secara asinkron dengan status 'pending'
      if (hasConfiguredSupabase) {
        try {
          const { error } = await supabaseClient
            .from('donations')
            .insert([
              {
                donor_name: donorName,
                amount: amount,
                niat: donorNiat || null,
                phone: donorPhone,
                status: 'pending'
              }
            ]);

          if (error) throw error;
          console.log("Data donasi berhasil disimpan ke Supabase.");
        } catch (err) {
          console.error("Gagal menyimpan data donasi ke Supabase:", err);
        }
      }

      // Buat pesan WhatsApp
      const formattedAmt = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount);

      const waText = `Assalamualaikum Warahmatullahi Wabarakatuh,\n\nSaya ingin berwakaf Al-Qur'an Braille melalui BIMAI dengan rincian:\n\n*Nama*: ${donorName}\n*No. HP/WA*: ${donorPhone}\n*Paket*: ${pkgName}\n*Nominal*: ${formattedAmt}\n*Niat/Doa*: "${donorNiat || '-'}"\n\nSaya akan segera melakukan transfer. Mohon dipandu proses konfirmasinya. Terima kasih.`;
      
      const waUrl = `https://api.whatsapp.com/send?phone=628123456789&text=${encodeURIComponent(waText)}`;
      
      // Buka WA
      window.open(waUrl, '_blank');
      closeModal();
      donationForm.reset();
    });
  }
}

// --- FAQ ACCORDION ---
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        // Tutup item lain yang sedang terbuka
        faqItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
          }
        });

        // Toggle active status
        item.classList.toggle('active');
      });
    }
  });
}

// --- PROGRESS BAR & NUMBER COUNTER ANIMATION ---
function initProgressAnimation() {
  const progressFill = document.querySelector('.progress-fill');
  const countElements = document.querySelectorAll('.counter-number');

  if (progressFill) {
    const targetWidth = progressFill.getAttribute('data-target-width') || '42%';
    
    // Set timer kecil agar animasi smooth saat load
    setTimeout(() => {
      progressFill.style.width = targetWidth;
    }, 300);
  }

  // Animasi angka counter jika ada
  countElements.forEach(el => {
    const target = parseInt(el.getAttribute('data-target'));
    if (isNaN(target)) return;

    let start = 0;
    const duration = 1500; // ms
    const stepTime = Math.abs(Math.floor(duration / target));
    
    // Cegah interval terlalu cepat
    const finalStepTime = Math.max(stepTime, 15);
    const increment = Math.ceil(target / (duration / finalStepTime));

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        el.innerText = target.toLocaleString('id-ID') + (el.innerText.includes('+') ? '+' : '');
        clearInterval(timer);
      } else {
        el.innerText = start.toLocaleString('id-ID') + (el.innerText.includes('+') ? '+' : '');
      }
    }, finalStepTime);
  });
}

// --- COLLAPSIBLE DETAIL FOR MOBILE ---
window.toggleDetailContent = function() {
  const collapsible = document.getElementById('detail-collapsible');
  const btn = document.getElementById('btn-detail-more');

  if (!collapsible || !btn) return;

  const isExpanded = collapsible.classList.toggle('expanded');
  
  if (isExpanded) {
    btn.innerHTML = 'Tutup Detail <i class="ri-arrow-up-s-line"></i>';
  } else {
    btn.innerHTML = 'Selengkapnya <i class="ri-arrow-down-s-line"></i>';
    const detailSection = document.getElementById('detail-program');
    if (detailSection) {
      detailSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

// --- COLLAPSIBLE DONATUR FOR MOBILE ---
window.toggleDonaturContent = function() {
  const collapsible = document.getElementById('donatur-collapsible');
  const btn = document.getElementById('btn-donatur-more');

  if (!collapsible || !btn) return;

  const isExpanded = collapsible.classList.toggle('expanded');
  
  if (isExpanded) {
    btn.innerHTML = 'Tutup <i class="ri-arrow-up-s-line"></i>';
  } else {
    btn.innerHTML = 'Selengkapnya <i class="ri-arrow-down-s-line"></i>';
    const section = document.getElementById('donatur-list-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

// --- COLLAPSIBLE KABAR FOR MOBILE ---
window.toggleKabarContent = function() {
  const collapsible = document.getElementById('kabar-collapsible');
  const btn = document.getElementById('btn-kabar-more');

  if (!collapsible || !btn) return;

  const isExpanded = collapsible.classList.toggle('expanded');
  
  if (isExpanded) {
    btn.innerHTML = 'Tutup <i class="ri-arrow-up-s-line"></i>';
  } else {
    btn.innerHTML = 'Selengkapnya <i class="ri-arrow-down-s-line"></i>';
    const section = document.getElementById('kabar-terbaru-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

// --- SHARE CAMPAIGN ---
window.shareCampaign = function() {
  const campaignUrl = window.location.href;
  const campaignTitle = document.querySelector('.campaign-title')?.innerText || "Wakaf Al-Qur'an Braille";

  if (navigator.share) {
    navigator.share({
      title: campaignTitle,
      text: "Bantu tunanetra Muslim beribadah secara mandiri dengan Wakaf Al-Qur'an Braille.",
      url: campaignUrl
    }).catch(err => console.log('Error sharing:', err));
  } else {
    // Fallback: Copy to clipboard
    navigator.clipboard.writeText(campaignUrl).then(() => {
      alert('Tautan kampanye berhasil disalin ke clipboard!');
    }).catch(err => {
      console.error('Gagal menyalin tautan:', err);
    });
  }
};

// --- LOAD REALTIME DATA FROM SUPABASE ---
async function loadDonationData() {
  const targetAmount = 150000000;
  
  // Data fallback default (jika Supabase belum dikonfigurasi)
  let collectedAmount = 64200000;
  let donorsCount = 324;
  let donorsList = [
    { donor_name: 'Ibu Hajah Fatimah', amount: 2250000, niat: 'Niat wakaf atas nama almarhum suami saya. Semoga dilapangkan kuburnya.', created_at: new Date(Date.now() - 3600000).toISOString() },
    { donor_name: 'Hamba Allah', amount: 75000, niat: 'Bismillah untuk patungan wakaf juz. Berkah selalu.', created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
    { donor_name: 'Bpk. Hermawan', amount: 375000, niat: 'Ikhtiar memohon kelancaran dan pemberkahan rezeki usaha keluarga.', created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
    { donor_name: 'M. Rizky', amount: 1125000, niat: 'Untuk kesembuhan ibunda saya tercinta dari sakit. Aamiin.', created_at: new Date(Date.now() - 12 * 3600000).toISOString() }
  ];

  const hasConfiguredSupabase = supabaseClient && 
    SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co' && 
    SUPABASE_ANON_KEY !== 'YOUR_ANON_KEY';

  if (hasConfiguredSupabase) {
    try {
      // Fetch verified donations
      const { data: donationsData, error: donationsError } = await supabaseClient
        .from('donations')
        .select('amount, donor_name, niat, created_at')
        .eq('status', 'verified');
      
      if (donationsError) throw donationsError;

      if (donationsData) {
        // Calculate dynamic sums & counts
        collectedAmount = donationsData.reduce((sum, item) => sum + Number(item.amount), 0);
        donorsCount = donationsData.length;
        
        // Sort newest donors
        donorsList = [...donationsData].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
    } catch (err) {
      console.warn("Gagal memuat data dari Supabase, menggunakan data fallback:", err);
    }
  } else {
    console.log("Supabase belum dikonfigurasi. Menampilkan data simulasi lokal.");
  }

  // --- UPDATE DOM ELEMENTS ---
  
  // 1. Collected Amount display
  const collectedAmountDisplay = document.getElementById('collected-amount-display');
  if (collectedAmountDisplay) {
    collectedAmountDisplay.innerText = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(collectedAmount);
  }

  // 2. Progress percentage & Progress fill bar
  const progressPercent = Math.min(Math.round((collectedAmount / targetAmount) * 100), 100);
  
  const progressPercentDisplay = document.getElementById('progress-percent-display');
  if (progressPercentDisplay) {
    progressPercentDisplay.innerText = `${progressPercent}%`;
  }

  const progressFillBar = document.getElementById('progress-fill-bar');
  if (progressFillBar) {
    progressFillBar.setAttribute('data-target-width', `${progressPercent}%`);
    // Animate progress bar fill width
    setTimeout(() => {
      progressFillBar.style.width = `${progressPercent}%`;
    }, 100);
  }

  // 3. Donors count display
  const donorsCountDisplay = document.getElementById('donors-count-display');
  if (donorsCountDisplay) {
    donorsCountDisplay.innerText = donorsCount.toLocaleString('id-ID');
  }

  // 4. Render Donors List
  const realtimeDonaturList = document.getElementById('realtime-donatur-list');
  if (realtimeDonaturList) {
    realtimeDonaturList.innerHTML = '';
    
    if (donorsList.length === 0) {
      realtimeDonaturList.innerHTML = '<p class="no-donors-text" style="text-align: center; color: var(--text-muted); width: 100%; padding: 20px 0;">Belum ada donatur yang terverifikasi.</p>';
      return;
    }

    donorsList.forEach(donor => {
      const donaturItem = document.createElement('div');
      donaturItem.className = 'donatur-item';

      // Set avatar icon (use heart if prayer exists)
      const avatarIconClass = donor.niat ? 'ri-user-heart-line' : 'ri-user-line';
      const timeDisplay = formatTimeAgo(donor.created_at);
      const formattedDonorAmt = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(donor.amount);

      donaturItem.innerHTML = `
        <div class="donatur-avatar"><i class="${avatarIconClass}"></i></div>
        <div class="donatur-info">
          <div class="donatur-meta">
            <span class="donatur-name">${escapeHTML(donor.donor_name)}</span>
            <span class="donatur-time">${timeDisplay}</span>
          </div>
          <span class="donatur-amount">${formattedDonorAmt}</span>
          ${donor.niat ? `<p class="donatur-prayer">"${escapeHTML(donor.niat)}"</p>` : ''}
        </div>
      `;
      realtimeDonaturList.appendChild(donaturItem);
    });
  }
}

// Helper: Format selisih waktu (time ago)
function formatTimeAgo(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  
  if (diffMs < 0) return 'Baru saja';
  
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) {
    return diffMin <= 0 ? 'Baru saja' : `${diffMin} menit yang lalu`;
  }
  
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return `${diffHours} jam yang lalu`;
  }
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} hari yang lalu`;
}

// Helper: Escape HTML strings to prevent XSS
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}


