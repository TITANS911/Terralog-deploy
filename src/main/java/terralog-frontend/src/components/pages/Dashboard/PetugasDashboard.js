import React, {useEffect, useState, useMemo} from 'react';
import axios from 'axios'; 
import Swal from 'sweetalert2';
import { Search, Bell, User, Users, UserCog, FileText, Trash2, Home, ShoppingBag,ClipboardList, ChevronDown } from 'lucide-react';
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

import PetugasSidebar from './PetugasSidebar';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);
ChartJS.register(ArcElement, Tooltip, Legend);

const PetugasDashboard = () => {
  const now = new Date();
  const [loading, setLoading] = useState(true);
  const [totalWarga, setTotalWarga] = useState(0);
  const [totalSampah, setTotalSampah] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [jadwalList, setJadwalList] = useState([]);
  const [jenisSampah, setJenisSampah] = useState('Semua');
  const [chartData, setChartData] = useState([]);
  const userName = localStorage.getItem('nama') || 'Petugas';
  const currentPetugasId = parseInt(localStorage.getItem('userId'), 10);
  const today = new Date().toISOString().split('T')[0];
  
  // Alert sambutan saat berhasil masuk/render halaman
  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('petugas-dashboard-toast');
    if (!alreadyShown) {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
      Toast.fire({
        icon: 'success',
        title: `Halo Petugas, ${userName}!`,
        text: 'Semangat mengelola data transaksi hari ini.'
      });
      sessionStorage.setItem('petugas-dashboard-toast', 'true');
    }
  }, [userName]);

  // Fetch semua data yang diperlukan
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch users
        const usersResponse = await axios.get('http://127.0.0.1:8080/api/users');
        const allUsers = usersResponse.data;
        
        // Fetch transactions
        const transaksiResponse = await axios.get('http://127.0.0.1:8080/api/transaksi');
        const allTransaksi = transaksiResponse.data;
        
        // Fetch kategori
        const kategoriResponse = await axios.get('http://127.0.0.1:8080/api/kategori');
        setKategoriList(kategoriResponse.data || []);
        
        // Fetch jadwal
        const jadwalResponse = await axios.get('http://127.0.0.1:8080/api/jadwal');
        setJadwalList(jadwalResponse.data || []);
        
        // Filter transaksi hanya yang milik petugas ini
        const transaksiPetugas = allTransaksi.filter(item => item.petugas?.userId === currentPetugasId);
        
        setTransactions(allTransaksi);
        setFilteredTransactions(transaksiPetugas);
        
        // Hitung total warga
        const warga = allUsers.filter(user => user.role === "WARGA");
        setTotalWarga(warga.length);
        
        // Hitung total sampah dari transaksi petugas
        const totalBerat = transaksiPetugas.reduce((sum, item) => sum + (parseFloat(item.totalBerat) || 0), 0);
        setTotalSampah(totalBerat);
        
      } catch (error) {
        console.error("Gagal ambil data:", error);
        Swal.fire('Error', 'Gagal memuat data', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (currentPetugasId) {
      fetchAllData();
    }
  }, [currentPetugasId]);

  // Memproses data chart
  useEffect(() => {
    if (filteredTransactions.length === 0) return;

    // Filter berdasarkan kategori
    const filtered = jenisSampah === 'Semua' 
      ? filteredTransactions 
      : filteredTransactions.filter(t => t.kategoriSampah === jenisSampah);

    // Agregasi per bulan
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

    setChartData(Object.keys(monthlyMap).map(m => ({ month: m, value: monthlyMap[m] })));
  }, [filteredTransactions, jenisSampah]);

  // Data untuk chart donut
  const wasteStats = useMemo(() => {
    if (filteredTransactions.length === 0) return [];
    
    const totalKeseluruhan = filteredTransactions.reduce((sum, item) => sum + (parseFloat(item.totalBerat) || 0), 0);
    
    const map = filteredTransactions.reduce((acc, curr) => {
      const name = curr.kategoriSampah || 'Lainnya';
      acc[name] = (acc[name] || 0) + (parseFloat(curr.totalBerat) || 0);
      return acc;
    }, {});

    return Object.keys(map).map(label => ({
      label: label,
      value: map[label],
      percentage: totalKeseluruhan > 0 ? ((map[label] / totalKeseluruhan) * 100).toFixed(1) : 0
    }));
  }, [filteredTransactions]);

  // Data untuk line chart
  const lineChartData = {
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

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#EEF2F1' } },
      x: { grid: { display: false } }
    }
  };

  // Data untuk donut chart
  const donutChartData = {
    labels: wasteStats.map(item => item.label),
    datasets: [
      {
        data: wasteStats.map(item => item.value),
        backgroundColor: ['#064D36', '#FFC5C5', '#FFF0B8', '#BDEFD0', '#FFD21A'],
        borderWidth: 0,
        cutout: '75%',
      },
    ],
  };

  // Jadwal hari ini
  const jadwalHariIni = useMemo(() => {
    return jadwalList.filter((item) => {
      if (!item.tanggalTugas) return false;
      const tanggalAPI = item.tanggalTugas.substring(0, 10);
      return tanggalAPI === today;
    });
  }, [jadwalList, today]);

  // Transaksi hari ini
  const todayTransactions = useMemo(() => {
    return filteredTransactions.filter(t => t.tanggal && t.tanggal.startsWith(today));
  }, [filteredTransactions, today]);

  const statsData = [
    {
      title: 'Total Warga',
      value: totalWarga.toString(),
      unit: 'orang',
      icon: <Users size={26} />,
      iconBg: '#38B46A',
      valueColor: '#38B46A'
    },
    {
      title: 'Total Sampah',
      value: totalSampah.toLocaleString(),
      unit: 'kg',
      icon: <Trash2 size={26} />,
      iconBg: '#9B7FE8',
      valueColor: '#9B7FE8'
    },
    {
      title: 'Transaksi Hari Ini',
      value: todayTransactions.length.toString(),
      unit: 'transaksi',
      icon: <ClipboardList size={26} />,
      iconBg: '#5B9CF6',
      valueColor: '#5B9CF6'
    }
  ];

  const todayDisplay = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div style={styles.container}>
      <PetugasSidebar activeMenu="dashboard" />

      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          <section style={styles.topSection}>
            <div>
              <h1 style={styles.pageTitle}>
                Halo, <span style={styles.greenText}>{userName}!</span>
              </h1>

              <p style={styles.subtitle}>
                Pantau aktivitas pengelolaan sampah dengan lebih efisien
              </p>
            </div>

            <div style={styles.headerRight}>
              <div style={styles.datePill}>{todayDisplay}</div>
            </div>
          </section>

          <section style={styles.statsGrid}>
            {statsData.map((item) => (
              <StatCard key={item.title} item={item} />
            ))}
          </section>

          <section style={styles.mainGrid}>
            {/* Baris Pertama: Line Chart & Jadwal Penjemputan */}
            <div style={styles.firstRow}>
              {/* Line Chart */}
              <div style={styles.chartCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>
                    Tren Sampah Terkumpul <span style={styles.grayText}>(kg)</span>
                  </h3>
                </div>
                <div style={{ height: '280px', width: '100%' }}>
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
              </div>

              {/* Jadwal Hari Ini */}
              <div style={styles.scheduleCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>Rute Penjemputan Hari Ini</h3>
                </div>
                <div style={styles.timelineContainer}>
                  {jadwalHariIni.length > 0 ? (
                    jadwalHariIni.map((item, index) => (
                      <div key={item.idJadwal} style={styles.timelineItem}>
                        <div style={styles.timelineLeft}>
                          <div style={{ ...styles.timelineDot, backgroundColor: '#2d6a4f', border: '3px solid #b7e4c7' }} />
                          {index !== jadwalHariIni.length - 1 && <div style={{ ...styles.timelineLine, borderLeft: '2px dashed #ccc' }} />}
                        </div>
                        <div style={styles.timelineRight}>
                          <p style={{ ...styles.lokasiText, fontWeight: 'bold', color: '#2d6a4f' }}>{item.lokasiTugas}</p>
                          <p style={styles.detailText}>Shift: {item.shift} | {item.keterangan}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#888', padding: '20px' }}>Tidak ada jadwal penjemputan hari ini.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Baris Kedua: Donut Chart */}
            <div style={styles.secondRow}>
              <div style={styles.donutCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>Statistik Sampah</h3>
                </div>
                <div style={styles.donutContent}>
                  <div style={styles.donutChart}>
                    <Doughnut 
                      data={donutChartData}
                      options={{ 
                        responsive: true, 
                        plugins: { legend: { display: false } } 
                      }} 
                    />
                    <div style={styles.donutCenter}>
                      <strong style={{ fontSize: '12px', color: '#666' }}>Total</strong>
                      <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{totalSampah.toLocaleString()} kg</span>
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
                          <span style={{ 
                            width: '12px', 
                            height: '12px', 
                            backgroundColor: donutChartData.datasets[0].backgroundColor[index] || '#ccc', 
                            borderRadius: '50%', 
                            marginRight: '10px' 
                          }}></span>
                          <span style={{ fontWeight: '600', color: '#333', fontSize: '14px' }}>
                            {item.label}
                          </span>
                        </div>
                        <span style={{ fontWeight: '700', color: '#064D36', fontSize: '14px' }}>
                          {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ item }) => (
  <div style={styles.statCard}>
    <div style={{ ...styles.statIcon, backgroundColor: item.iconBg }}>
      {React.cloneElement(item.icon, { color: '#fff' })}
    </div>

    <div>
      <h3 style={styles.statTitle}>{item.title}</h3>

      <div style={styles.statValueWrap}>
        <span style={{ ...styles.statValue, color: item.valueColor }}>
          {item.value}
        </span>
        <span style={styles.statUnit}>{item.unit}</span>
      </div>
    </div>
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
    padding: '40px 48px',
    boxSizing: 'border-box'
  },

  pageTitle: {
    margin: '0 0 12px 0',
    fontSize: '42px',
    lineHeight: '1',
    fontWeight: '900',
    color: '#111'
  },

  greenText: {
    color: '#064D36'
  },

  subtitle: {
    margin: 0,
    fontSize: '17px',
    color: '#8A8A8A'
  },

  topSection: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '25px',
    marginBottom: '28px'
  },

  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },

  datePill: {
    width: '400px',
    height: '44px',
    backgroundColor: '#064D36',
    color: '#fff',
    borderRadius: '25px',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '28px',
    boxSizing: 'border-box',
    fontSize: '15px',
    fontWeight: '600'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '26px',
    marginBottom: '26px'
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

  mainGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '26px'
  },

  firstRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '26px'
  },

  secondRow: {
    display: 'flex',
    width: '100%'
  },

  chartCard: {
    border: '1px solid #E5E5E5',
    borderRadius: '22px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: '0 2px 0 rgba(0,0,0,0.2)',
    padding: '20px'
  },

  scheduleCard: {
    border: '1px solid #E5E5E5',
    borderRadius: '22px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: '0 2px 0 rgba(0,0,0,0.2)',
    padding: '20px'
  },

  donutCard: {
    border: '1px solid #E5E5E5',
    borderRadius: '22px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: '0 2px 0 rgba(0,0,0,0.2)',
    padding: '20px',
    width: '100%'
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px'
  },

  cardTitle: {
    margin: 0,
    fontSize: '16px',
    color: '#111',
    fontWeight: '800'
  },

  grayText: {
    color: '#777',
    fontWeight: '500'
  },

  timelineContainer: {
    display: 'flex',
    flexDirection: 'column'
  },

  timelineItem: {
    display: 'flex',
    gap: '15px'
  },

  timelineLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },

  timelineDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    zIndex: 2
  },

  timelineLine: {
    width: '0px',
    height: '45px'
  },

  timelineRight: {
    paddingBottom: '20px'
  },

  lokasiText: {
    fontSize: '13px',
    margin: 0
  },

  detailText: {
    fontSize: '11px',
    color: '#888',
    margin: '2px 0 0 0'
  },

  donutContent: {
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    alignItems: 'center',
    gap: '12px'
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
  }
};

export default PetugasDashboard;
