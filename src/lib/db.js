import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Gunakan Service Role Key di server agar bisa mengakses data untuk agregat secara aman,
// namun kita tidak akan mengekspos kolom pribadi (nomor WA) ke publik.
let supabase = null;
if (supabaseUrl && supabaseServiceKey && 
    supabaseUrl !== 'https://your-project.supabase.co' && 
    supabaseServiceKey !== 'your-private-service-role-key-here') {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

export async function getCampaignData() {
  const targetAmount = 150000000;
  
  // Data fallback default jika Supabase belum terkonfigurasi/error
  let collectedAmount = 64200000;
  let donorsCount = 324;
  let donorsList = [
    { donor_name: 'Ibu Hajah Fatimah', wakif_name: 'Almarhum Suami', amount: 2250000, niat: 'Niat wakaf atas nama almarhum suami saya. Semoga dilapangkan kuburnya.', created_at: new Date(Date.now() - 3600000).toISOString() },
    { donor_name: 'Hamba Allah', wakif_name: '', amount: 75000, niat: 'Bismillah untuk patungan wakaf juz. Berkah selalu.', created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
    { donor_name: 'Bpk. Hermawan', wakif_name: 'Keluarga', amount: 375000, niat: 'Ikhtiar memohon kelancaran dan pemberkahan rezeki usaha keluarga.', created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
    { donor_name: 'M. Rizky', wakif_name: 'Ibunda Tercinta', amount: 1125000, niat: 'Untuk kesembuhan ibunda saya tercinta dari sakit. Aamiin.', created_at: new Date(Date.now() - 12 * 3600000).toISOString() }
  ];

  if (supabase) {
    try {
      // Ambil donasi yang status_payment sudah success/lunas
      // Kita HANYA memilih kolom non-sensitif publik. Kolom 'phone' (No WhatsApp) tidak dimuat!
      const { data, error } = await supabase
        .from('donations')
        .select('donor_name, wakif_name, amount, niat, created_at')
        .eq('status_payment', 'success');

      if (error) throw error;

      if (data && data.length > 0) {
        collectedAmount = data.reduce((sum, item) => sum + Number(item.amount), 0);
        donorsCount = data.length;
        
        // Urutkan donatur terbaru (created_at desc)
        donorsList = data
          .map(d => ({
            donor_name: d.donor_name,
            wakif_name: d.wakif_name || '',
            amount: Number(d.amount),
            niat: d.niat || '',
            created_at: d.created_at
          }))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else {
        // Jika tabel kosong (belum ada donasi lunas), kita set nilai real ke 0
        collectedAmount = 0;
        donorsCount = 0;
        donorsList = [];
      }
    } catch (err) {
      console.warn("Gagal mengambil data dari Supabase, menggunakan data fallback lokal:", err.message);
    }
  } else {
    console.log("Supabase belum dikonfigurasi. Menggunakan data simulasi lokal.");
  }

  return {
    collectedAmount,
    donorsCount,
    donorsList,
    targetAmount
  };
}
