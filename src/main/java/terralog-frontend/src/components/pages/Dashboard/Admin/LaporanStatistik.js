import React, { useState, useEffect, useMemo } from 'react'; 
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
// import { mockWasteData } from './mockData';
import {
  Search,
  Bell,
  User,
  Users,
  ClipboardList,
  TrendingUp,
  ChevronDown
} from 'lucide-react';

import AdminSidebar from '../AdminSidebar';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);
ChartJS.register(ArcElement, Tooltip, Legend);

const LaporanStatistik = () => {
  const [chartData, setChartData] = useState([]); // Ganti monthlyTrend statis
  const [periode, setPeriode] = useState('Mei 2026');
  const [periodeBanding, setPeriodeBanding] = useState('April 2026');
  const [jenisSampah, setJenisSampah] = useState('Anorganik');
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

  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      // Panggil endpoint yang benar: /api/waste
      const response = await axios.get('http://127.0.0.1:8080/api/waste');
      const allWaste = response.data || [];
      // const allWaste = mockWasteData;

      const kategoriRes = await axios.get('http://127.0.0.1:8080/api/kategori');
      setKategoriList(kategoriRes.data || []);

      // 1. FILTER: Ambil hanya yang statusnya "SELESAI"
      const dataSelesai = allWaste.filter(item => item.status === "SELESAI");

      // 2. FILTER KATEGORI: (Jika user memilih kategori tertentu)
      const filtered = jenisSampah === 'Semua' 
        ? dataSelesai 
        : dataSelesai.filter(t => t.kategori.namaKategori === jenisSampah);

      // 3. AGGREGASI: Jumlahkan berat berdasarkan bulan
        const monthlyMap = { 
          'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'Mei': 0, 'Jun': 0, 
          'Jul': 0, 'Agu': 0, 'Sep': 0, 'Okt': 0, 'Nov': 0, 'Des': 0 
        };
      
      filtered.forEach(t => {
        const date = new Date(t.tanggalInput); // Gunakan tanggalInput sesuai JSON
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const m = monthNames[date.getMonth()];
        
        if (monthlyMap.hasOwnProperty(m)) {
          monthlyMap[m] += (t.berat || 0); // Gunakan field 'berat' sesuai JSON
        }
      });

      // 4. Update State
      setChartData(Object.keys(monthlyMap).map(m => ({ month: m, value: monthlyMap[m] })));
      
      setStats(prev => ({
        ...prev, // PENTING: Pertahankan nilai wargaAktif yang sudah ada
        totalSampah: filtered.reduce((sum, item) => sum + (item.berat || 0), 0),
        totalTransaksi: filtered.length
      }));

    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [jenisSampah]); // <--- Penting: Efek jalan ulang saat jenisSampah ganti // Tambahkan jenisSampah sebagai dependency

const daftarBulan = [
  'Januari', 'Februari', 'Maret', 'April', 
  'Mei', 'Juni', 'Juli', 'Agustus', 
  'September', 'Oktober', 'November', 'Desember'
];

useEffect(() => {
    const fetchStats = async () => {
      try {
        // Panggil ketiga API secara bersamaan
        const [wasteRes, transaksiRes, usersRes] = await Promise.all([
          axios.get('http://127.0.0.1:8080/api/waste'),
          axios.get('http://127.0.0.1:8080/api/transaksi'),
          axios.get('http://127.0.0.1:8080/api/users')
        ]);
        console.log("Data Users dari API:", usersRes.data);
        // Hitung total berat sampah (asumsi fieldnya adalah 'berat')
        const totalSampah = wasteRes.data.reduce((sum, item) => sum + (item.berat || 0), 0);
        
        // Hitung total transaksi
        const totalTransaksi = transaksiRes.data.length;
        
        // Hitung warga aktif (filter berdasarkan role)
        const allUsers = usersRes.data || [];
        const wargaAktif = allUsers.filter(u => 
          u.role && u.role.toString().toUpperCase() === "WARGA"
        ).length;
        console.log("Jumlah Warga:", wargaAktif);

        setStats(prev => ({
  ...prev, // PENTING: Pertahankan totalSampah & totalTransaksi
  wargaAktif: wargaAktif 
}));
      } catch (error) {
        console.error("Gagal mengambil data statistik:", error);
      }
    };

    fetchStats();
  }, []);


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
  
  // Hitung pembulatan ke angka terdekat (misal 8 -> 10, 12 -> 15)
  // Ini memastikan skala selalu sedikit di atas data tertinggi
  const upperLimit = Math.ceil(max / 5) * 5; 
  const step = upperLimit / 5;
  
  return [step * 5, step * 4, step * 3, step * 2, step * 1, 0];
}, [maxValue]);

  const todayDisplay = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

useEffect(() => {
    const fetchDataFull = async () => {
      try {
        const [wasteRes, transaksiRes, usersRes] = await Promise.all([
          axios.get('http://127.0.0.1:8080/api/waste'),
          axios.get('http://127.0.0.1:8080/api/transaksi'),
          axios.get('http://127.0.0.1:8080/api/users')
        ]);
        
        setAllWaste(wasteRes.data || []);
        // ... setStats logic here ...
      } catch (error) {
        console.error("Gagal ambil data Full:", error);
      }
    };
    fetchDataFull();
  }, []);
// 1. Logika untuk menghitung statistik berdasarkan kategori dari DATA FULL (allWaste)
const wasteStats = useMemo(() => {
  const dataSelesai = allWaste.filter(item => item.status === "SELESAI");
  const totalKeseluruhan = dataSelesai.reduce((sum, item) => sum + (parseFloat(item.berat) || 0), 0);

  const map = dataSelesai.reduce((acc, curr) => {
    const name = curr.kategori?.namaKategori || 'Lainnya';
    acc[name] = (acc[name] || 0) + (parseFloat(curr.berat) || 0);
    return acc;
  }, {});

  return Object.keys(map).map(label => ({
    label: label,
    value: map[label],
    // Hitung persentase di sini
    percentage: totalKeseluruhan > 0 
      ? ((map[label] / totalKeseluruhan) * 100).toFixed(1) 
      : 0
  }));
}, [allWaste]);
// 1. Hitung total sampah dari DATA FULL (allWaste), bukan dari data terfilter
const totalSampahFull = useMemo(() => {
  return allWaste
    .filter(item => item.status === "SELESAI")
    .reduce((sum, item) => sum + (parseFloat(item.berat) || 0), 0);
}, [allWaste]);

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



  return (
    <div style={styles.container}>
      <AdminSidebar activeMenu="laporan" />

      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          <section style={styles.header}>
            <div>
              <h1 style={styles.pageTitle}>Laporan & Statistik</h1>
              <p style={styles.subtitle}>Pantau kinerja TerraLog dalam berbagai periode.</p>
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
              value={stats.totalSampah}
              unit="kg"
              valueColor="#39A96B"
            />

            <StatCard
              icon={<ClipboardList size={28} />}
              iconBg="#5B9CF6"
              title="Total Transaksi"
              value={stats.totalTransaksi}
              unit="transaksi"
              valueColor="#5B9CF6"
            />

            <StatCard
              icon={<Users size={28} />} // Sesuaikan icon untuk warga
              iconBg="#FF9F43"
              title="Warga Aktif"
              value={stats.wargaAktif}
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
  container: {
    minHeight: '100vh',
    backgroundColor: '#064D36',
    fontFamily: "'Poppins', sans-serif"
  },

  main: {
    marginLeft: '270px',
    minHeight: '100vh',
    padding: '24px 24px 24px 0',
    boxSizing: 'border-box'
  },

  contentWrapper: {
    minHeight: 'calc(100vh - 48px)',
    backgroundColor: '#fff',
    borderRadius: '38px',
    padding: '36px 40px 42px 40px',
    boxSizing: 'border-box'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '24px',
    marginBottom: '28px'
  },

  pageTitle: {
    margin: '0 0 10px 0',
    fontSize: '38px',
    lineHeight: '1',
    fontWeight: '900',
    color: '#111'
  },

  subtitle: {
    margin: 0,
    fontSize: '17px',
    color: '#8A8A8A'
  },

  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },

  searchBoxTop: {
    width: '230px',
    height: '42px',
    backgroundColor: '#fff',
    borderRadius: '24px',
    border: '1px solid #E5E5E5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px 0 18px',
    boxSizing: 'border-box'
  },

  searchInputTop: {
    border: 'none',
    outline: 'none',
    width: '160px',
    fontSize: '12px',
    color: '#777',
    fontFamily: "'Poppins', sans-serif"
  },

  circleButton: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
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

  chevronIcon: {
    position: 'absolute',
    right: '10px',
    pointerEvents: 'none'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '260px 290px 290px',
    gap: '28px',
    marginBottom: '34px'
  },

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

  statTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    fontSize: '12px'
  },

  trendText: {
    color: '#2DA86B',
    fontWeight: '700'
  },

  trendSubtext: {
    color: '#7D7D7D'
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
};

export default LaporanStatistik;