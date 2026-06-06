import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  ArcElement,
  Legend
} from 'chart.js';
import { 
  Phone, Mail, Clock, Facebook, Twitter, Instagram, Youtube,
  Trash2, Users, Calendar, BarChart3, Map, MessageSquare, 
  MapPin, Send, TrendingUp, ChevronRight, FileText, Layers
} from 'lucide-react';
import Navbar from '../Navbar';
import bgKuning from '../../assets/Rectangle 35.png'; 
import img1 from '../../assets/Rectangle 64.png';
import img2 from '../../assets/Rectangle 65.png';
import img3 from '../../assets/Rectangle 66.png';
import backgroundImage from '../../assets/bg.jpeg';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, ArcElement, Legend);

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('#home');
  const [hoverNav, setHoverNav] = useState(null);
  
  // State untuk form kontak
  const [formData, setFormData] = useState({
    nama: '',
    noTelp: '',
    email: '',
    pesan: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Fungsi handle perubahan input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fungsi kirim email menggunakan Formspree
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xwvzzrje';

    const formDataObj = new FormData();
    formDataObj.append('name', formData.nama);
    formDataObj.append('phone', formData.noTelp);
    formDataObj.append('email', formData.email);
    formDataObj.append('message', formData.pesan);

    try {
      const response = await axios.post(FORMSPREE_ENDPOINT, formDataObj, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.status === 200) {
        setSubmitMessage('✅ Pesan berhasil dikirim!');
        setFormData({ nama: '', noTelp: '', email: '', pesan: '' });
        setTimeout(() => setSubmitMessage(''), 3000);
      }
    } catch (error) {
      console.error('Formspree error:', error);
      const errorMsg = error.response?.data?.error || 'Gagal mengirim pesan, coba lagi nanti.';
      setSubmitMessage(`❌ ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // State untuk data dari API
  const [wasteData, setWasteData] = useState([]);
  const [transaksiData, setTransaksiData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [kategoriData, setKategoriData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch semua data saat komponen mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [wasteRes, transaksiRes, usersRes, kategoriRes] = await Promise.all([
          axios.get('http://127.0.0.1:8080/api/waste'),
          axios.get('http://127.0.0.1:8080/api/transaksi'),
          axios.get('http://127.0.0.1:8080/api/users'),
          axios.get('http://127.0.0.1:8080/api/kategori')
        ]);
        
        setWasteData(wasteRes.data || []);
        setTransaksiData(transaksiRes.data || []);
        setUsersData(usersRes.data || []);
        setKategoriData(kategoriRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);
  
  // --- Hitung Statistik ---
  // 1. Total Sampah Terkumpul
  const totalSampah = useMemo(() => {
    return wasteData.reduce((sum, item) => sum + (parseFloat(item.berat) || 0), 0);
  }, [wasteData]);
  
  // 2. Total Transaksi
  const totalTransaksi = transaksiData.length;
  
  // 3. Total Warga Terdaftar
  const totalWarga = useMemo(() => {
    return usersData.filter(user => 
      user.role?.toString().toUpperCase() === 'WARGA'
    ).length;
  }, [usersData]);
  
  // 4. Total Kategori
  const totalKategori = kategoriData.length;
  
  // 5. Total Sampah Minggu Ini
  const getStartOfWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const start = new Date(now);
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  };
  
  const totalSampahMingguIni = useMemo(() => {
    const startOfWeek = getStartOfWeek();
    return wasteData.filter(item => {
      const itemDate = new Date(item.tanggalInput || item.tanggal);
      return itemDate >= startOfWeek;
    }).reduce((sum, item) => sum + (parseFloat(item.berat) || 0), 0);
  }, [wasteData]);

  // --- Fungsi Helper untuk Perhitungan Trend ---
  const getStartOfLastWeek = () => {
    const startOfWeek = getStartOfWeek();
    const startLastWeek = new Date(startOfWeek);
    startLastWeek.setDate(startLastWeek.getDate() - 7);
    return startLastWeek;
  };

  const getEndOfLastWeek = () => {
    const startOfWeek = getStartOfWeek();
    const endLastWeek = new Date(startOfWeek);
    endLastWeek.setDate(endLastWeek.getDate() - 1);
    return endLastWeek;
  };

  const getStartOfThisMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  };

  const getStartOfLastMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - 1, 1);
  };

  const getEndOfLastMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 0);
  };

  // --- Hitung Trend ---
  // 1. Trend Total Sampah (Minggu Ini vs Minggu Lalu)
  const totalSampahMingguLalu = useMemo(() => {
    const startLastWeek = getStartOfLastWeek();
    const endLastWeek = getEndOfLastWeek();
    return wasteData.filter(item => {
      const itemDate = new Date(item.tanggalInput || item.tanggal);
      return itemDate >= startLastWeek && itemDate <= endLastWeek;
    }).reduce((sum, item) => sum + (parseFloat(item.berat) || 0), 0);
  }, [wasteData]);

  const sampahTrend = useMemo(() => {
    if (totalSampahMingguLalu === 0) return totalSampahMingguIni > 0 ? 100 : 0;
    return ((totalSampahMingguIni - totalSampahMingguLalu) / totalSampahMingguLalu) * 100;
  }, [totalSampahMingguIni, totalSampahMingguLalu]);

  // 2. Trend Transaksi (Minggu Ini vs Minggu Lalu)
  const totalTransaksiMingguIni = useMemo(() => {
    const startOfWeek = getStartOfWeek();
    return transaksiData.filter(item => {
      const itemDate = new Date(item.tanggal || item.tanggalTransaksi);
      return itemDate >= startOfWeek;
    }).length;
  }, [transaksiData]);

  const totalTransaksiMingguLalu = useMemo(() => {
    const startLastWeek = getStartOfLastWeek();
    const endLastWeek = getEndOfLastWeek();
    return transaksiData.filter(item => {
      const itemDate = new Date(item.tanggal || item.tanggalTransaksi);
      return itemDate >= startLastWeek && itemDate <= endLastWeek;
    }).length;
  }, [transaksiData]);

  const transaksiTrend = useMemo(() => {
    if (totalTransaksiMingguLalu === 0) return totalTransaksiMingguIni > 0 ? 100 : 0;
    return ((totalTransaksiMingguIni - totalTransaksiMingguLalu) / totalTransaksiMingguLalu) * 100;
  }, [totalTransaksiMingguIni, totalTransaksiMingguLalu]);

  // 3. Trend Warga Aktif (Bulan Ini vs Bulan Lalu)
  const totalWargaBulanLalu = useMemo(() => {
    const startLastMonth = getStartOfLastMonth();
    const endLastMonth = getEndOfLastMonth();
    return usersData.filter(user => {
      if (user.role?.toString().toUpperCase() !== 'WARGA') return false;
      const createdAt = new Date(user.createdAt || user.tanggalDaftar || Date.now());
      return createdAt <= endLastMonth;
    }).length;
  }, [usersData]);

  const wargaTrend = useMemo(() => {
    if (totalWargaBulanLalu === 0) return totalWarga > 0 ? 100 : 0;
    return ((totalWarga - totalWargaBulanLalu) / totalWargaBulanLalu) * 100;
  }, [totalWarga, totalWargaBulanLalu]);
  
  // --- Data untuk Grafik ---
  // 1. Grafik Sampah Mingguan (7 hari terakhir)
  const weeklyChartData = useMemo(() => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const now = new Date();
    const startOfWeek = getStartOfWeek();
    
    // Inisialisasi data dengan 0
    const data = Array(7).fill(0);
    
    wasteData.forEach(item => {
      const itemDate = new Date(item.tanggalInput || item.tanggal);
      if (itemDate >= startOfWeek && itemDate <= now) {
        const dayIndex = itemDate.getDay();
        data[dayIndex] += parseFloat(item.berat) || 0;
      }
    });
    
    return {
      labels: days,
      datasets: [{
        label: 'Sampah (kg)',
        data: data,
        borderColor: '#064D36',
        backgroundColor: 'rgba(6, 77, 54, 0.12)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        borderWidth: 3
      }]
    };
  }, [wasteData]);
  
  // 2. Grafik Sampah Bulanan (12 bulan)
  const monthlyChartData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const currentYear = new Date().getFullYear();
    
    const data = Array(12).fill(0);
    
    wasteData.forEach(item => {
      const itemDate = new Date(item.tanggalInput || item.tanggal);
      if (itemDate.getFullYear() === currentYear) {
        const monthIndex = itemDate.getMonth();
        data[monthIndex] += parseFloat(item.berat) || 0;
      }
    });
    
    return {
      labels: monthNames,
      datasets: [{
        label: 'Sampah (kg)',
        data: data,
        borderColor: '#064D36',
        backgroundColor: 'rgba(6, 77, 54, 0.12)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        borderWidth: 3
      }]
    };
  }, [wasteData]);
  
  // State untuk pilihan grafik
  const [chartPeriod, setChartPeriod] = useState('minggu');
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#EEF2F1' } },
      x: { grid: { display: false } }
    }
  };

  // Fungsi helper untuk menentukan warna
  const getLinkStyle = (hash) => ({
    ...styles.link,
    color: (activeNav === hash || hoverNav === hash) ? '#FFD700' : '#fff',
  });

  return (
    <div style={styles.wrapper}>
      <Navbar activePage="home" />

      {/* --- 3. HERO SECTION --- */}
      <header id="home" style={{
        ...styles.hero,
        backgroundImage: `url(${backgroundImage})`
      }}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Wujudkan Pengelolaan <br /> Sampah <span style={{color: '#FFD700'}}>Modern</span>
          </h1>
          <p style={styles.heroSubtitle}>
            TerraLog membantu pencatatan dan pelaporan sampah secara digital dan terstruktur.
          </p>
          <div style={styles.heroBtns}>
            <button 
              style={styles.btnGoldHero} 
              onClick={() => navigate('/register')}
            >
              Get Started
            </button>
            <button 
              style={styles.btnOutlineHero} 
              onClick={() => {
                const tentangSection = document.getElementById('tentang');
                if (tentangSection) {
                  tentangSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              See Details
            </button>
          </div>
        </div>
      </header>

      {/* --- 4. TENTANG SECTION --- */}
      <section id="tentang" style={styles.sectionAbout}>
        <div style={styles.aboutHeader}>
          <h2 style={styles.aboutTitle}>
            <span style={{ color: '#FACC15' }}>Tentang</span>{' '}
            <span style={{ color: '#0B5D3F' }}>TerraLog</span>
          </h2>
          <div style={styles.greenLine}></div>
        </div>

        <div style={styles.aboutContent}>
          <div style={styles.aboutText}>
            <p style={styles.aboutParagraph}>
              Pengelolaan sampah yang masih dilakukan secara manual seringkali
              menyebabkan data sulit terorganisir dan kurang efektif untuk dipantau.
            </p>
            <p style={styles.aboutParagraph}>
              TerraLog hadir sebagai solusi digital yang membantu proses pengelolaan
              lingkungan menjadi lebih modern, praktis, dan terstruktur melalui
              sistem yang mudah digunakan.
            </p>
          </div>

          <div style={styles.imageGroup}>
            <div style={styles.smallImage}>
              <img src={img1} alt="" style={styles.fullImg} />
            </div>
            <div style={styles.bigImage}>
              <img src={img2} alt="" style={styles.fullImg} />
            </div>
            <div style={styles.smallImage}>
              <img src={img3} alt="" style={styles.fullImg} />
            </div>
          </div>
        </div>
      </section>

      {/* --- 5. SOLUSI SECTION --- */}
      <section id="fitur" style={styles.sectionGrey}>
        <div style={{textAlign: 'center', marginBottom: '60px'}}>
          <h2 style={styles.sectionTitle}>Solusi yang Kami Hadirkan</h2>
          <p style={styles.sectionSubtitle}>Fitur TerraLog yang memudahkan proses pengelolaan sampah masyarakat.</p>
        </div>
        <div style={styles.featureGrid}>
          <FeatureCard icon={<Users />} title="Manajemen Data Warga" desc="Mengelola data warga dengan lebih rapi dan terstruktur." />
          <FeatureCard icon={<Calendar />} title="Penjadwalan Pengangkutan" desc="Membantu pengaturan jadwal penjemputan sampah secara real-time." />
          <FeatureCard icon={<BarChart3 />} title="Statistik & Laporan" desc="Menampilkan data dan grafik sampah berdasarkan periode tertentu." />
          <FeatureCard icon={<Map />} title="Monitoring Wilayah" desc="Memantau area pengelolaan sampah secara detail." />
          <FeatureCard icon={<MessageSquare />} title="Pengaduan Masyarakat" desc="Memfasilitasi pelaporan masalah lingkungan secara cepat." />
        </div>
      </section>

      {/* --- 6. LAPORAN & STATISTIK SECTION --- */}
      <section id="laporan" style={styles.statsSection}>
        <div style={styles.statsHeader}>
            <h2 style={styles.statsTitle}>Laporan & <span style={{color: '#FFD700'}}>Statistik</span></h2>
            <p style={styles.statsSubtitle}>Pantau perkembangan pengelolaan sampah melalui data dan statistik yang terorganisir.</p>
        </div>

        <div style={styles.statsGrid}>
          <StatCardDetail icon={<Trash2 size={24} color="#2D6A4F" />} label="Total Sampah Terkumpul" value={totalSampah.toLocaleString()} unit="kg" trend={sampahTrend} period="minggu lalu" />
          <StatCardDetail icon={<FileText size={24} color="#2D6A4F" />} label="Transaksi Tercatat" value={totalTransaksi.toLocaleString()} unit="transaksi" trend={transaksiTrend} period="minggu lalu" />
          <StatCardDetail icon={<Users size={24} color="#2D6A4F" />} label="Warga Aktif" value={totalWarga.toLocaleString()} unit="orang" trend={wargaTrend} period="bulan lalu" />
          <StatCardDetail icon={<Layers size={24} color="#E9C46A" />} label="Kategori Sampah" value={totalKategori.toLocaleString()} unit="kategori" isCategory={true} onClick={() => navigate('/kategori')} />
        </div>

        <div style={styles.graphRow}>
          <div style={styles.graphBox}>
            <div style={styles.graphHeader}>
              <span style={{fontWeight: 'bold'}}>Grafik Sampah {chartPeriod === 'minggu' ? 'Mingguan' : 'Bulanan'}</span>
              <select 
                style={styles.dropdown}
                value={chartPeriod}
 onChange={(e) => setChartPeriod(e.target.value)}
>
<option value="minggu">Minggu Ini</option>
<option value="bulan">Bulan Ini</option>
</select>
</div>
<div style={{ height: '250px', width: '100%' }}>
<Line 
 data={chartPeriod === 'minggu' ? weeklyChartData : monthlyChartData}
 options={chartOptions}
 />
</div>
</div>
          <div style={styles.summaryBox}>
            <img src="https://cdn-icons-png.flaticon.com/512/3299/3299935.png" alt="bin" style={{width: '70px', marginBottom: '15px'}} />
            <p style={{color: '#2D6A4F', fontWeight: 'bold', fontSize: '14px', margin: 0}}>Total Minggu Ini</p>
            <h2 style={{color: '#2D6A4F', fontSize: '32px', fontWeight: '800', margin: '5px 0'}}>
              {totalSampahMingguIni.toLocaleString()} <span style={{fontSize: '16px'}}>kg</span>
            </h2>
            <div style={{display: 'flex', alignItems: 'center', gap: '5px', color: sampahTrend >= 0 ? '#2D6A4F' : '#EF4444', fontSize: '12px', fontWeight: 'bold'}}>
              <TrendingUp size={14} style={{ transform: sampahTrend < 0 ? 'rotate(180deg)' : 'none' }} /> {sampahTrend.toFixed(1).replace('.', ',')}% <span style={{color: '#666', fontWeight: 'normal'}}>dari minggu lalu</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- 7. KONTAK SECTION --- */}
      <section id="kontak" style={styles.sectionWhite}>
        <div style={styles.contactContainer}>
          <div style={styles.contactInfo}>
            <h2 style={styles.sectionTitle}><span style={{ color: '#164D0C' }}>Kontak</span> <span style={{color: '#FFD700'}}>Kami</span></h2>
            <p style={styles.p}>Hubungi kami untuk informasi lebih lanjut mengenai layanan TerraLog.</p>
            <div style={styles.contactItem}><Mail size={18} color="#2d6a4f" /> tirtana@mhs.itenas.ac.id</div>
            <div style={styles.contactItem}><MapPin size={18} color="#2d6a4f" /> Jl. PH.H. Mustopa No. 23, Bandung</div>
            <div style={styles.contactItem}><Phone size={18} color="#2d6a4f" /> (+62) 81220480538</div>
            <div style={styles.mapBox}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.936905122385!2d107.63580999999999!3d-6.898149999999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e7bb26b63b69%3A0x9ed5cea73b538ee0!2sBandung%20National%20Institute%20of%20Technology%20(ITENAS)!5e0!3m2!1sen!2sid!4v1780098255737!5m2!1sen!2sid" 
                width="100%" 
                height="100%" 
                style={{border: 0, borderRadius: '15px'}}
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
          <div style={styles.contactForm}>
  {/* Kontainer Background untuk Field Input */}
            <form style={styles.formBackground} onSubmit={handleSubmit}>
              <input 
                placeholder="Nama" 
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                style={styles.input} 
                required
              />
              <input 
                placeholder="No. Telp" 
                name="noTelp"
                value={formData.noTelp}
                onChange={handleInputChange}
                style={styles.input} 
                required
              />
              <input 
                placeholder="Email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                style={styles.input} 
                required
              />
              <textarea 
                placeholder="Pesan" 
                name="pesan"
                value={formData.pesan}
                onChange={handleInputChange}
                style={{...styles.input, height: '150px', resize: 'none'}}
                required
              ></textarea>
                
            <button 
              type="submit" 
              style={styles.btnSend}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Mengirim...' : (
                <>Kirim <Send size={16} /></>
              )}
            </button>
            {submitMessage && (
              <p style={{
                marginTop: '15px',
                color: submitMessage.includes('berhasil') ? '#064D36' : '#EF4444',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {submitMessage}
              </p>
            )}
            </form>
          </div>
        </div>
      </section>

      {/* --- 8. FOOTER --- */}
      <footer style={styles.footer}>
        <div>Copyright © TerraLog. All Rights Reserved.</div>
        <div style={{display: 'flex', gap: '15px'}}>
          <span>User Terms & Conditions</span>
          <span>|</span>
          <span>Privacy Policy</span>
        </div>
      </footer>
    </div>
  );
};

// --- Reusable Components ---
const FeatureCard = ({ icon, title, desc }) => (
  <div style={styles.fCard}>
    <div style={styles.fIconContainer}>
      {React.cloneElement(icon, { size: 50 })} 
    </div>
    <h3 style={styles.fTitle}>{title}</h3>
    <p style={styles.fDesc}>{desc}</p>
  </div>
);

const StatCardDetail = ({ icon, label, value, unit, trend, period, isCategory, onClick }) => {
  // Format trend dengan koma dan 1 desimal
  const formatTrend = (num) => {
    if (isNaN(num)) return '0,0';
    return num.toFixed(1).replace('.', ',');
  };

  // Tentukan warna trend (hijau untuk positif, merah untuk negatif)
  const getTrendColor = () => trend >= 0 ? '#2D6A4F' : '#EF4444';

  return (
    <div style={styles.sCardDetail}>
      <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px'}}>
        <div style={styles.sIconCircle}>{icon}</div>
        <div>
          <p style={{fontSize: '12px', color: '#666', margin: 0, fontWeight: '600'}}>{label}</p>
          <h3 style={{fontSize: '22px', color: '#1B4332', margin: 0, fontWeight: 'bold'}}>{value} <span style={{fontSize: '14px', fontWeight: 'normal'}}>{unit}</span></h3>
        </div>
      </div>
      {isCategory ? (
        <div 
          style={{fontSize: '11px', color: '#888', display: 'flex', alignItems: 'center', gap: '3px', borderTop: '1px solid #eee', paddingTop: '10px', cursor: 'pointer'}}
          onClick={onClick}
        >
          Lihat detail kategori <ChevronRight size={14} />
        </div>
      ) : (
        <div style={{fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px', borderTop: '1px solid #eee', paddingTop: '10px'}}>
          <span style={{color: getTrendColor(), fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px'}}>
            <TrendingUp size={12} style={{ transform: trend < 0 ? 'rotate(180deg)' : 'none' }} /> {formatTrend(trend)}%
          </span>
          <span style={{color: '#888'}}>dari {period}</span>
        </div>
      )}
    </div>
  );
};

// --- STYLING ---
const styles = {
  wrapper: { fontFamily: "'Poppins', sans-serif", color: '#333', scrollBehavior: 'smooth' },
  topBar: { backgroundColor: '#fff', padding: '10px 10%', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', fontSize: '11px', color: '#666' },
  topBarLeft: { display: 'flex', gap: '20px' },
  topItem: { display: 'flex', alignItems: 'center', gap: '5px' },
  topIcons: { display: 'flex', gap: '15px', color: '#2d6a4f' },
  navbar: { backgroundColor: '#1b4332', padding: '15px 10%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000 },

  topNavContact: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    fontSize: '12px',
    color: '#555'
  },

  navInfoGroup: {
    display: 'flex',
    gap: '20px',
    marginLeft: '140px',
    marginRight: '40px',
    fontSize: '12px',
    color: '#666',
    alignItems: 'center'
  },

  navInfoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginLeft: '10px'
  },

  topNavbar: {
    height: '40px',
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },

  yellowBranding: {
    backgroundImage: `url(${bgKuning})`, 
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right center',
    backgroundSize: '100% 100%',
    height: '100%',
    width: '450px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '60px',
    gap: '15px',
    color: '#1b4332',
    marginLeft: 'auto',
  },

  socialGroup: {
    display: 'flex',
    gap: '35px',
    alignItems: 'center',
    paddingRight: '130px',
  },

  logo: { color: '#fff', fontWeight: '800', fontSize: '24px', letterSpacing: '1px' },
  navLinks: { display: 'flex', gap: '20px' },
  link: { 
    color: '#fff', 
    textDecoration: 'none', 
    fontSize: '13px', 
    fontWeight: 'bold', 
    transition: '0.3s' 
  },

  navAuth: { display: 'flex', gap: '15px' },
  btnMasuk: { 
    background: 'none', 
    border: 'none', 
    color: '#fff', 
    cursor: 'pointer', 
    fontSize: '13px',
    fontWeight: 'bold' 
  },
  btnDaftar: { backgroundColor: '#FFD700', border: 'none', padding: '8px 20px', borderRadius: '15px', fontWeight: 'bold', color: '#1b4332', cursor: 'pointer', fontSize: '13px' },
  hero: { height: '80vh', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', padding: '0 10%' },

 heroContent: { 
    maxWidth: '900px', 
    color: '#fff',
    textAlign: 'left'
  },

 heroTitle: { 
    fontSize: '55px',
    fontWeight: '800', 
    lineHeight: '1.1', 
    marginBottom: '20px',
    textShadow: '2px 2px 10px rgba(0,0,0,0.5)',
    width: '100%' 
  },

 heroSubtitle: { 
    fontSize: '19px', 
    marginBottom: '35px',
    width: '100%',
    lineHeight: '1.5',
    textShadow: '1px 1px 5px rgba(0,0,0,0.5)'
  }, 

  heroBtns: { display: 'flex', gap: '15px' },

  btnGoldHero: { 
    backgroundColor: '#FFD700',
    color: '#1b4332', 
    padding: '12px 35px', 
    borderRadius: '15px',
    fontWeight: 'bold', 
    border: 'none',
    cursor: 'pointer',
    fontSize: '15px',
    transition: '0.3s'
  },

  btnOutlineHero: { 
    backgroundColor: 'rgba(27, 67, 50, 0.7)',
    color: '#FFD700',
    padding: '12px 35px', 
    borderRadius: '15px',
    fontWeight: 'bold', 
    border: 'none',
    cursor: 'pointer',
    fontSize: '15px',
    transition: '0.3s'
  },
  
  sectionAbout: {
    backgroundColor: '#f9f9f9',
    padding: '80px 0 80px 8%', 
    overflow: 'hidden',
  },
  sectionGrey: { 
    padding: '80px 10%', 
    backgroundColor: '#f9f9f9' 
  },

  aboutHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '5px',
    width: '100%',
  },
  aboutTitle: {
    fontFamily: 'Poppins',
    fontSize: '48px',
    fontWeight: '700',
    margin: 0,
    lineHeight: '1',
  },
  greenLine: {
    flex: 1,
    height: '10px',
    backgroundColor: '#0B5D3F',
    marginLeft: '25px',
    borderRadius: '50px 0 0 50px',
  },
  aboutContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '40px',
    paddingRight: '5%',
  },
  aboutText: {
    flex: 1,
    marginTop: -80,
  },
  aboutParagraph: {
    fontSize: '16px',
    lineHeight: '1.8',
    color: '#333',
    margin: '0 0 20px 0',
    maxWidth: '550px',
  },
  imageGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    flexShrink: 0,
  },
  smallImage: { width: '150px', height: '260px', borderRadius: '24px', overflow: 'hidden' },
  bigImage: { width: '150px', height: '380px', borderRadius: '28px', overflow: 'hidden' },
  fullImg: { width: '100%', height: '100%', objectFit: 'cover' },

  sectionWhite: { padding: '80px 10%', backgroundColor: '#fff' },
  sectionTitle: { fontSize: '32px', fontWeight: '600', marginBottom: '10px', color: '#164D0C' },
  sectionSubtitle: { color: '#666', marginBottom: '40px' },
  p: { color: '#666', lineHeight: '1.7', marginBottom: '15px', fontSize: '15px' },
  
  featureGrid: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '25px' },
  fCard: { 
    backgroundColor: '#E8F3E8', 
    padding: '40px 25px', 
    borderRadius: '20px', 
    width: '240px', 
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  fIconContainer: { color: '#164D0C', marginBottom: '20px' },
  fTitle: { fontSize: '19px', fontWeight: '700', color: '#000', marginBottom: '12px' },
  fDesc: { fontSize: '13px', color: '#333', lineHeight: '1.6', margin: 0 },

  statsSection: { backgroundColor: '#1b4332', padding: '40px 10%' },
  statsHeader: { textAlign: 'center', marginBottom: '35px' },
  statsTitle: { color: '#fff', fontSize: '32px', fontWeight: 'bold' },
  statsSubtitle: { color: '#fff', opacity: 0.8, fontSize: '14px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
  sCardDetail: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px' },
  sIconCircle: { backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '50%', display: 'flex' },
  graphRow: { display: 'flex', gap: '20px' },
  graphBox: { flex: 3, backgroundColor: '#fff', borderRadius: '12px', padding: '20px' },
  graphHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  dropdown: { padding: '5px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '12px' },
  summaryBox: { flex: 1, backgroundColor: '#E9F5F0', borderRadius: '12px', padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },

  contactContainer: { 
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '60px',
    alignItems: 'start'
  },

  contactInfo: { 
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between' 
  },

  contactItem: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    marginBottom: '15px', 
    fontSize: '14px' 
  },

  formBackground: {
    backgroundColor: '#DFEDDD',
    padding: '25px',
    borderRadius: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
  },

  mapBox: { 
    flexGrow: 1, 
    minHeight: '300px',
    backgroundColor: '#f5f5f5', 
    borderRadius: '15px', 
    marginTop: '10px', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    border: '1px solid #eee' 
  },

 contactForm: { 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px',
    paddingTop: '85px'
  },

  input: { 
    padding: '15px', 
    borderRadius: '8px', 
    border: '1px solid #ddd', 
    backgroundColor: '#ffffff',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none'
  },

 btnSend: { 
    backgroundColor: '#1b4332', 
    color: '#fff', 
    padding: '15px 0',
    border: 'none', 
    borderRadius: '8px', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '5px'
  },

  footer: { backgroundColor: '#FFD700', padding: '20px 10%', display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', color: '#1b4332' }
};  

export default LandingPage;
