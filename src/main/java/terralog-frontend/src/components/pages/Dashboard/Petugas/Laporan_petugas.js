import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
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
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  User,
  Users,
  ClipboardList,
  TrendingUp,
  ChevronDown
} from 'lucide-react';

import PetugasSidebar from '../PetugasSidebar';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);
ChartJS.register(ArcElement, Tooltip, Legend);


const LaporanPetugas = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('nama') || 'Petugas';
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const now = new Date();

    const [allWaste, setAllWaste] = useState([]); // Data full untuk Donut
    const [filteredWaste, setFilteredWaste] = useState([]);
    const [stats, setStats] = useState({
      totalSampah: 0,
      totalTransaksi: 0,
      wargaAktif: 0
    });
    const [kategoriList, setKategoriList] = useState([]);
    const [loading, setLoading] = useState(true);
      const [chartData, setChartData] = useState([]); // Ganti monthlyTrend statis
      const [periode, setPeriode] = useState('Mei 2026');
      const [periodeBanding, setPeriodeBanding] = useState('April 2026');
      const [jenisSampah, setJenisSampah] = useState('Anorganik');


  const handleLogout = () => {
    Swal.fire({
      title: 'Selesai bertugas?',
      text: "Pastikan semua laporan sudah terinput!",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1b4332',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Logout',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate('/login');
      }
    });
  };





const daftarBulan = [
  'Januari', 'Februari', 'Maret', 'April', 
  'Mei', 'Juni', 'Juli', 'Agustus', 
  'September', 'Oktober', 'November', 'Desember'
];

// Ambil ID Petugas dari localStorage sekali saja
const currentPetugasId = parseInt(localStorage.getItem('userId'), 10);

// useEffect untuk memproses data transaksi dan chart
useEffect(() => {
  const processChartData = () => {
    if (allWaste.length === 0) return;

    // 1. FILTER KATEGORI: (Jika user memilih kategori tertentu)
    const filtered = jenisSampah === 'Semua' 
      ? allWaste 
      : allWaste.filter(t => t.kategoriSampah === jenisSampah);

    // 2. AGGREGASI: Jumlahkan berat berdasarkan bulan
    const monthlyMap = { 
      'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'Mei': 0, 'Jun': 0, 
      'Jul': 0, 'Agu': 0, 'Sep': 0, 'Okt': 0, 'Nov': 0, 'Des': 0 
    };

    filtered.forEach(t => {
      const date = new Date(t.tanggalTransaksi || t.tanggal);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const m = monthNames[date.getMonth()];
      
      if (monthlyMap.hasOwnProperty(m)) {
        monthlyMap[m] += (parseFloat(t.totalBerat) || 0);
      }
    });

    // 3. Update Chart Data
    setChartData(Object.keys(monthlyMap).map(m => ({ month: m, value: monthlyMap[m] })));
    
    // 4. Update Statistik
    setStats(prev => ({
      ...prev,
      totalSampah: filtered.reduce((sum, item) => sum + (parseFloat(item.totalBerat) || 0), 0),
      totalTransaksi: filtered.length
    }));
  };

  processChartData();
}, [allWaste, jenisSampah]);

// useEffect untuk fetch data transaksi
useEffect(() => {
  const fetchTransaksi = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://127.0.0.1:8080/api/transaksi');
      const allTransaksi = res.data || [];

      // Filter berdasarkan ID Petugas
      const dataTerfilter = allTransaksi.filter(item => 
        item.petugas?.userId === currentPetugasId
      );

      // Simpan ke state
      setAllWaste(dataTerfilter);
    } catch (error) {
      console.error("Gagal ambil transaksi:", error);
    } finally {
      setLoading(false);
    }
  };

  if (currentPetugasId) fetchTransaksi();
}, [currentPetugasId]);

// 2. useEffect KHUSUS untuk Data Pendukung (Kategori & Users)
useEffect(() => {
  const fetchPendukung = async () => {
    try {
      const [kategoriRes, usersRes] = await Promise.all([
        axios.get('http://127.0.0.1:8080/api/kategori'),
        axios.get('http://127.0.0.1:8080/api/users')
      ]);

      setKategoriList(kategoriRes.data || []);
      
      const warga = (usersRes.data || []).filter(u => 
        u.role?.toString().toUpperCase() === "WARGA"
      );
      
      // Update wargaAktif saja
      setStats(prev => ({ ...prev, wargaAktif: warga.length }));
    } catch (error) {
      console.error("Gagal ambil data pendukung:", error);
    }
  };
  
  fetchPendukung();
}, []);
// 2. useEffect KHUSUS untuk Data Lain (Users & Kategori)

// Hitung statistik untuk Chart Donut
const wasteStats = useMemo(() => {
  if (allWaste.length === 0) return [];
  
  const totalKeseluruhan = allWaste.reduce((sum, item) => sum + (parseFloat(item.totalBerat) || 0), 0);
  
  const map = allWaste.reduce((acc, curr) => {
    const name = curr.kategoriSampah || 'Lainnya';
    // PERBAIKAN: Gunakan 'curr.totalBerat', BUKAN 'item.totalBerat'
    acc[name] = (acc[name] || 0) + (parseFloat(curr.totalBerat) || 0);
    return acc;
  }, {});

  return Object.keys(map).map(label => ({
    label: label,
    value: map[label],
    percentage: totalKeseluruhan > 0 ? ((map[label] / totalKeseluruhan) * 100).toFixed(1) : 0
  }));
}, [allWaste]);

const totalSampahFull = useMemo(() => {
  return allWaste.reduce((sum, item) => sum + (parseFloat(item.totalBerat) || 0), 0);
}, [allWaste]);

  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 1200; // Default jika data kosong
    return Math.max(...chartData.map((item) => item.value));
  }, [chartData]);

  const points = useMemo(() => {
  const width = 520;
  const height = 240;
  
  // Menggunakan skala yang dinamis
  const scaleMax = Math.ceil(maxValue / 5) * 5; 

  return chartData.map((item, index) => {
    const x = (index / (chartData.length - 1 || 1)) * width;
    // Gunakan scaleMax agar titik tertinggi tidak mentok ke atap grafik
    const y = height - ((item.value || 0) / (scaleMax || 1)) * height;
    return { ...item, x, y };
  });
}, [chartData, maxValue]);

const data = {
    labels: chartData.map(d => d.month),
    datasets: [
      {
        data: chartData.map(d => d.value),
        borderColor: '#064D36',
        backgroundColor: 'rgba(6, 77, 54, 0.12)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        borderWidth: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#EEF2F1' } },
      x: { grid: { display: false } }
    }
  };

  const yLabels = useMemo(() => {
  // Ambil maxValue, jika 0 gunakan 10 sebagai default
  const max = maxValue > 0 ? maxValue : 10;
  
  const upperLimit = Math.ceil(max / 5) * 5; 
  const step = upperLimit / 5;
  
  return [step * 5, step * 4, step * 3, step * 2, step * 1, 0];
}, [maxValue]);
  

// 2. Format data khusus untuk komponen Doughnut Chart
const donutChartData = useMemo(() => ({
  labels: wasteStats.map(item => item.label),
  datasets: [
    {
      data: wasteStats.map(item => item.value),
      backgroundColor: ['#064D36', '#FF9F43', '#3B82F6', '#EF4444', '#10B981'], // Tambahkan warna sesuai kebutuhan
      borderWidth: 0,
      cutout: '75%', // Memberikan efek donut
    },
  ],
}), [wasteStats]);

    const todayDisplay = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });


  return (

    
    <div style={styles.container}>
      <PetugasSidebar activeMenu="laporan" /> 
        
      {/* --- MAIN CONTENT --- */}
      <main style={styles.mainContent}>
        <div style={styles.whiteCanvas}>

          <section style={styles.header}>
            <div>
              <h1 style={styles.pageTitle}>Penjemputan Sampah</h1>
              <p style={styles.subtitle}>Pantau jadwal dan lokasi penjemputan sampah.</p>
            </div>

            <div style={styles.headerRight}>
              <div style={styles.datePill}>{todayDisplay}</div>
            </div>        
          </section>

          <section style={styles.filterSection}>
            {/* <FilterSelect
              label="Pilih Periode"
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              options={daftarBulan.map(m => `${m} 2026`)} // Contoh: "Januari 2026", "Februari 2026", dst.
            />

            <FilterSelect
              label="Periode Perbandingan"
              value={periodeBanding}
              onChange={(e) => setPeriodeBanding(e.target.value)}
              options={daftarBulan.filter(bln => bln !== periode .split(' ')[0]).map(m => `${m} 2026`)} // Pilihan bulan selain yang dipilih di periode utama
            /> */}

            <FilterSelect
              label="Jenis Sampah"
              value={jenisSampah}
              onChange={(e) => setJenisSampah(e.target.value)}
              // Ganti item.nama menjadi item.namaKategori
              options={['Pilih Jenis', ...(Array.isArray(kategoriList) ? kategoriList.map(item => item.namaKategori) : [])]}
            />
          </section>
        

        <section style={styles.statsGrid}>
  <StatCard
    icon={<Users size={28} />}
    iconBg="#39A96B"
    title="Sampah Terkumpul"
    value={stats.totalSampah} // Gunakan state stats
    unit="kg"
    valueColor="#39A96B"
  />

  <StatCard
    icon={<ClipboardList size={28} />}
    iconBg="#5B9CF6"
    title="Total Transaksi"
    value={stats.totalTransaksi} // Gunakan state stats
    unit="transaksi"
    valueColor="#5B9CF6"
  />

  <StatCard
    icon={<Users size={28} />}
    iconBg="#FF9F43"
    title="Warga Aktif"
    value={stats.wargaAktif} // Gunakan state stats
    unit="orang"
    valueColor="#FF9F43"
  />
</section>
          <section style={styles.chartCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                Tren Sampah Terkumpul <span style={styles.grayText}>(kg)</span>
              </h3>
            </div>
            <div style={{ height: '280px', width: '100%' }}>
                <Line data={data} options={options} />
            </div>
          </section>

          <section style={styles.statistikCard}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Statistik Sampah</h3>
              </div>

              <div style={styles.donutContent}>
                <div style={styles.donutChart}>
                  {/* ChartJS Doughnut */}
                  <Doughnut 
                    data={donutChartData}
                    options={{ 
                      responsive: true, 
                      plugins: { legend: { display: false } } 
                    }} 
                  />

                  {/* Teks Total di tengah */}
                  <div style={styles.donutCenter}>
                    <strong style={{ fontSize: '12px', color: '#666' }}>Total</strong>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{totalSampahFull.toLocaleString()} kg</span>
                  </div>
                </div>
                  
                <div style={styles.legendList}> 
                  {wasteStats.map((item, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          padding: '8px 0',
                          borderBottom: '1px solid #f0f0f0' // Garis tipis pemisah
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {/* Indikator Warna (Bullet) */}
                          <span style={{ 
                            width: '12px', 
                            height: '12px', 
                            backgroundColor: donutChartData.datasets[0].backgroundColor[index] || '#ccc', 
                            borderRadius: '50%', 
                            marginRight: '10px' 
                          }}></span>
                          
                          {/* Teks Kategori */}
                          <span style={{ fontWeight: '600', color: '#333', fontSize: '14px' }}>
                            {item.label}
                          </span>
                        </div>
                        
                        {/* Persentase */}
                        <span style={{ fontWeight: '700', color: '#064D36', fontSize: '14px' }}>
                          {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
              </div>
            </section>
        </div>
      </main>
    </div>
  );
};

const FilterSelect = ({ label, value, onChange, options }) => (
  <div style={styles.filterItem}>
    <label style={styles.filterLabel}>{label}</label>

    <div style={styles.selectWrapper}>
      <select value={value} onChange={onChange} style={styles.select}>
        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <ChevronDown size={18} color="#7D8490" style={styles.chevronIcon} />
    </div>
  </div>
);

const StatCard = ({ icon, iconBg, title, value, unit, valueColor, trendText }) => (
  <div style={styles.statCard}>
    <div style={{ ...styles.statIcon, backgroundColor: iconBg }}>
      {React.cloneElement(icon, { color: '#fff' })}
    </div>

    <div>
      <h3 style={styles.statTitle}>{title}</h3>

      <div style={styles.statValueWrap}>
        <span style={{ ...styles.statValue, color: valueColor }}>{value}</span>
        <span style={styles.statUnit}>{unit}</span>
      </div>
    </div>
  </div>
);

const LegendItem = ({ item }) => (
  <div style={styles.legendItem}>
    <span style={{ ...styles.legendDot, backgroundColor: item.color }}></span>
    <span style={styles.legendLabel}>{item.label}</span>
    <strong style={styles.legendValue}>{item.value}</strong>
  </div>
);

const styles = {
  container: { display: 'flex', backgroundColor: '#064D36', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" },
  badge: { fontSize: '10px', backgroundColor: '#2d6a4f', padding: '2px 8px', borderRadius: '10px' },
  nav: { flex: 1, marginTop: '20px' },
  navItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 15px', marginBottom: '8px', cursor: 'pointer', borderRadius: '10px', transition: 'all 0.3s ease' },
  activeItem: { backgroundColor: '#2d6a4f' },
  hoverItem: { backgroundColor: 'rgba(255,255,255,0.15)', transform: 'translateX(5px)' },
  logoutItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 15px', marginBottom: '20px', cursor: 'pointer', borderRadius: '10px', color: '#ff6b6b', transition: 'all 0.3s ease', fontWeight: '600' },
  logoutHover: { backgroundColor: 'rgba(255, 107, 107, 0.1)', transform: 'translateX(5px)' },
  profileSection: { display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  avatar: { width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  mainContent: { marginLeft: '270px', flex: 1, padding: '25px', display: 'flex' },
  whiteCanvas: { backgroundColor: '#FFFFFF', flex: 1, borderRadius: '32px', padding: '40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },

  datePill: {
    width: '520px',
    height: '52px',
    backgroundColor: '#064D36',
    color: '#fff',
    borderRadius: '28px',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '28px',
    boxSizing: 'border-box',
    fontSize: '16px',
    fontWeight: '600'
  },

    header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '24px',
    marginBottom: '42px'
  },

    pageTitle: {
    margin: '0 0 8px 0',
    fontSize: '35px',
    lineHeight: '1',
    fontWeight: '900',
    color: '#111'
  },
  subtitle: {
    margin: 0,
    fontSize: '15px',
    color: '#8A8A8A'
  },
  
  searchBar: { backgroundColor: '#2d6a4f', padding: '8px 15px', borderRadius: '8px', display: 'flex', alignItems: 'center', width: '220px' },
  searchInput: { backgroundColor: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '14px' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '260px 290px 290px',
    gap: '28px',
    marginBottom: '34px'
  },
  statCard: { backgroundColor: '#ffffff', border: '1px solid #eee', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  cardLabel: { fontSize: '14px', color: '#666', margin: 0 },
  cardValue: { fontSize: '28px', margin: '5px 0', fontWeight: 'bold', color: '#1b4332' },
  largeGrid: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' },
  largeCard: { backgroundColor: '#ffffff', borderRadius: '20px', padding: '25px', minHeight: '300px', border: '1px solid #eee', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  placeholderList: { marginTop: '15px', fontSize: '14px', color: '#444', lineHeight: '2.5' },

  
  statCard: {
    minHeight: '126px',
    backgroundColor: '#fff',
    borderRadius: '24px',
    border: '1px solid #E5E5E5',
    boxShadow: '0 2px 0 rgba(0,0,0,0.25)',
    padding: '22px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px'
  },

  statIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },

  statTitle: {
    margin: '3px 0 8px 0',
    fontSize: '18px',
    color: '#111',
    fontWeight: '800'
  },

  statValueWrap: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '6px',
    marginBottom: '12px'
  },

  statValue: {
    fontSize: '40px',
    lineHeight: '0.85',
    fontWeight: '900'
  },

  statUnit: {
    fontSize: '15px',
    color: '#777',
    fontWeight: '600'
  },

  chartCard: {
    width: '610px',
    border: '1px solid #D5D5D5',
    borderRadius: '22px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: '0 2px 0 rgba(0,0,0,0.2)',
    marginBottom: '34px'
  },

  cardHeader: {
    height: '44px',
    borderBottom: '1px solid #D5D5D5',
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
    boxSizing: 'border-box'
  },

  cardTitle: {
    margin: 0,
    fontSize: '15px',
    color: '#111',
    fontWeight: '800'
  },

  grayText: {
    color: '#777',
    fontWeight: '500'
  },

  lineChartWrapper: {
    display: 'flex',
    padding: '38px 28px 28px 28px'
  },

  yAxis: {
    width: '48px',
    height: '280px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#6F7680'
  },

  chartArea: {
    flex: 1,
    position: 'relative'
  },

  xAxis: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 15px',
    marginTop: '-8px',
    color: '#6F7680',
    fontSize: '11px'
  },

  statistikCard: {
    width: '610px',
    border: '1px solid #D5D5D5',
    borderRadius: '22px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: '0 2px 0 rgba(0,0,0,0.2)'
  },

  donutContent: {
    minHeight: '240px',
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    alignItems: 'center',
    gap: '12px',
    padding: '24px 32px'
  },

  donutChart: {
    position: 'relative', // Penting agar donutCenter bisa di-absolute
    width: '150px',
    height: '150px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: {
    position: 'absolute',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    pointerEvents: 'none', // Agar klik tidak terhalang teks
  },

  legendList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },

  legendItem: {
    display: 'grid',
    gridTemplateColumns: '16px 1fr auto',
    gap: '16px',
    alignItems: 'center',
    fontSize: '13px'
  },

  legendDot: {
    width: '11px',
    height: '11px',
    borderRadius: '50%'
  },

  legendLabel: {
    fontWeight: '700'
  },

  legendValue: {
    fontWeight: '900'
  },

    datePill: {
    width: '520px',
    height: '52px',
    backgroundColor: '#064D36',
    color: '#fff',
    borderRadius: '28px',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '28px',
    boxSizing: 'border-box',
    fontSize: '16px',
    fontWeight: '600'
  },

  
  filterSection: {
    minHeight: '76px',
    borderRadius: '26px',
    backgroundColor: '#F3F8F6',
    border: '1px solid #DCE8E3',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    boxSizing: 'border-box',
    marginBottom: '32px'
  },

  filterItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },

  filterLabel: {
    color: '#7B8494',
    fontSize: '12px'
  },

  selectWrapper: {
    width: '170px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#fff',
    border: '1px solid #DEE6E4',
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },

  select: {
    width: '100%',
    height: '100%',
    border: 'none',
    outline: 'none',
    appearance: 'none',
    backgroundColor: 'transparent',
    padding: '0 34px 0 14px',
    fontSize: '13px',
    color: '#064D36',
    fontFamily: "'Poppins', sans-serif"
  },
};

export default LaporanPetugas;