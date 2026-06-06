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
  ChevronDown
} from 'lucide-react';

import WargaSidebar from '../WargaSidebar';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);
ChartJS.register(ArcElement, Tooltip, Legend);


const LaporanWarga = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('nama') || 'Warga';
  const now = new Date();

  const [allWaste, setAllWaste] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [jenisSampah, setJenisSampah] = useState('Semua');

  // Ambil ID Warga dari localStorage
  const currentUserId = localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId'), 10) : null;

  const handleLogout = () => {
    Swal.fire({
      title: 'Keluar aplikasi?',
      text: "Anda akan keluar dari akun Anda!",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#064D36',
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

  // Filter hanya data yang statusnya bukan pending
  const filteredWasteData = useMemo(() => {
    return allWaste.filter(w => w.status?.toLowerCase() !== 'pending');
  }, [allWaste]);

  // useEffect untuk memproses data waste dan chart
  useEffect(() => {
    const processChartData = () => {
      if (filteredWasteData.length === 0) return;

      // 1. FILTER KATEGORI: (Jika user memilih kategori tertentu)
      const filtered = jenisSampah === 'Semua' 
        ? filteredWasteData 
        : filteredWasteData.filter(t => t.kategori?.namaKategori === jenisSampah);

      // 2. AGGREGASI: Jumlahkan berat berdasarkan bulan
      const monthlyMap = { 
        'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'Mei': 0, 'Jun': 0, 
        'Jul': 0, 'Agu': 0, 'Sep': 0, 'Okt': 0, 'Nov': 0, 'Des': 0 
      };

      filtered.forEach(t => {
        const date = new Date(t.tanggalInput || t.tanggal);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const m = monthNames[date.getMonth()];
        
        if (monthlyMap.hasOwnProperty(m)) {
          monthlyMap[m] += (parseFloat(t.berat) || 0);
        }
      });

      // 3. Update Chart Data
      setChartData(Object.keys(monthlyMap).map(m => ({ month: m, value: monthlyMap[m] })));
    };

    processChartData();
  }, [filteredWasteData, jenisSampah]);

  // useEffect untuk fetch data waste
  useEffect(() => {
    const fetchWaste = async () => {
      if (!currentUserId) return;
      
      try {
        setLoading(true);
        const res = await axios.get(`http://127.0.0.1:8080/api/waste/user/${currentUserId}`);
        const data = Array.isArray(res.data) ? res.data : [];
        
        setAllWaste(data);
      } catch (error) {
        console.error("Gagal ambil data waste:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWaste();
  }, [currentUserId]);

  // useEffect untuk fetch kategori
  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8080/api/kategori');
        setKategoriList(res.data || []);
      } catch (error) {
        console.error("Gagal ambil kategori:", error);
      }
    };

    fetchKategori();
  }, []);

  // Hitung statistik untuk Chart Donut
  const wasteStats = useMemo(() => {
    if (filteredWasteData.length === 0) return [];
    
    const totalKeseluruhan = filteredWasteData.reduce((sum, item) => sum + (parseFloat(item.berat) || 0), 0);
    
    const map = filteredWasteData.reduce((acc, curr) => {
      const name = curr.kategori?.namaKategori || 'Lainnya';
      acc[name] = (acc[name] || 0) + (parseFloat(curr.berat) || 0);
      return acc;
    }, {});

    return Object.keys(map).map(label => ({
      label: label,
      value: map[label],
      percentage: totalKeseluruhan > 0 ? ((map[label] / totalKeseluruhan) * 100).toFixed(1) : 0
    }));
  }, [filteredWasteData]);

  const totalSampahFull = useMemo(() => {
    return filteredWasteData.reduce((sum, item) => sum + (parseFloat(item.berat) || 0), 0);
  }, [filteredWasteData]);

  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 1200; // Default jika data kosong
    return Math.max(...chartData.map((item) => item.value));
  }, [chartData]);

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

  // 2. Format data khusus untuk komponen Doughnut Chart
  const donutChartData = useMemo(() => ({
    labels: wasteStats.map(item => item.label),
    datasets: [
      {
        data: wasteStats.map(item => item.value),
        backgroundColor: ['#064D36', '#FF9F43', '#3B82F6', '#EF4444', '#10B981'],
        borderWidth: 0,
        cutout: '75%',
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
      <WargaSidebar activeMenu="laporan" /> 
        
      {/* --- MAIN CONTENT --- */}
      <main style={styles.mainContent}>
        <div style={styles.whiteCanvas}>

          <section style={styles.header}>
            <div>
              <h1 style={styles.pageTitle}>Laporan Sampah</h1>
              <p style={styles.subtitle}>Pantau laporan sampah Anda sendiri, {userName}.</p>
            </div>

            <div style={styles.headerRight}>
              <div style={styles.datePill}>{todayDisplay}</div>
            </div>        
          </section>

          <section style={styles.filterSection}>
            <FilterSelect
              label="Jenis Sampah"
              value={jenisSampah}
              onChange={(e) => setJenisSampah(e.target.value)}
              options={['Semua', ...(Array.isArray(kategoriList) ? kategoriList.map(item => item.namaKategori) : [])]}
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
                          borderBottom: '1px solid #f0f0f0'
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

const styles = {
  container: { display: 'flex', backgroundColor: '#064D36', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" },
  mainContent: { marginLeft: '270px', flex: 1, padding: '25px', display: 'flex' },
  whiteCanvas: { backgroundColor: '#FFFFFF', flex: 1, borderRadius: '38px', padding: '40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },

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

  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },

  chartCard: {
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

  statistikCard: {
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
    position: 'relative',
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
    pointerEvents: 'none',
  },

  legendList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
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
};

export default LaporanWarga;