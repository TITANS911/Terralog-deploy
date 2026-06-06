import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {
  Trash2,
  Calendar,
  Recycle,
  User
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
} from 'chart.js';

import WargaSidebar from './WargaSidebar';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

const WargaDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('nama') || 'User';
  const userId = parseInt(localStorage.getItem('userId'), 10);
  const userAlamat = localStorage.getItem('alamat') || '';
  const userNoHp = localStorage.getItem('noHp') || '';
  const [wasteData, setWasteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  
  // Alert sambutan
  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('warga-dashboard-toast');
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
        title: `Selamat datang, ${userName}!`,
        text: 'Semoga hari mu menyenangkan!'
      });
      sessionStorage.setItem('warga-dashboard-toast', 'true');
    }
  }, [userName]);

  // Cek apakah profil belum lengkap dan tampilkan popup
  useEffect(() => {
    if (!userAlamat || userAlamat.trim() === '' || !userNoHp || userNoHp.trim() === '') {
      Swal.fire({
        title: 'Lengkapi Profil Anda!',
        text: 'Silakan lengkapi alamat dan nomor HP Anda untuk pengalaman yang lebih baik.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#064D36',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Lengkapi Profil',
        cancelButtonText: 'Nanti'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/profil-warga');
        }
      });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      try {
        const response = await axios.get(`http://127.0.0.1:8080/api/waste/user/${userId}`);
        setWasteData(response.data || []);
      } catch (error) {
        console.error('Gagal mengambil data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  // Filter hanya data yang statusnya bukan pending
  const filteredWasteData = useMemo(() => {
    return wasteData.filter(w => w.status?.toLowerCase() !== 'pending');
  }, [wasteData]);

  const totalSampah = useMemo(() => {
    return filteredWasteData.reduce((sum, w) => sum + (parseFloat(w.berat) || 0), 0);
  }, [filteredWasteData]);

  const todayDisplay = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const setoranBulanIni = useMemo(() => {
    return filteredWasteData
      .filter(w => {
        const date = new Date(w.tanggalInput || w.tanggal);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).length;
  }, [filteredWasteData, currentMonth, currentYear]);

  const chartData = useMemo(() => {
    const monthlyData = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    monthNames.forEach(month => {
      monthlyData[month] = 0;
    });

    filteredWasteData.forEach(w => {
      const date = new Date(w.tanggalInput || w.tanggal);
      const month = monthNames[date.getMonth()];
      if (monthlyData[month] !== undefined) {
        monthlyData[month] += parseFloat(w.berat) || 0;
      }
    });

    return {
      labels: monthNames,
      data: monthNames.map(month => monthlyData[month])
    };
  }, [filteredWasteData]);

  const lineChartData = {
    labels: chartData.labels,
    datasets: [
      {
        data: chartData.data,
        borderColor: '#064D36',
        backgroundColor: 'rgba(6, 77, 54, 0.12)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        borderWidth: 3
      }
    ]
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

  const recentWaste = useMemo(() => {
    return [...filteredWasteData]
      .sort((a, b) => new Date(b.tanggalInput || b.tanggal) - new Date(a.tanggalInput || a.tanggal))
      .slice(0, 5);
  }, [filteredWasteData]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={styles.container}>
      <WargaSidebar activeMenu="dashboard" />

      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          <section style={styles.header}>
            <div>
              <h1 style={styles.pageTitle}>
                Selamat Datang, <span style={styles.greenText}>{userName}!</span>
              </h1>

              <p style={styles.subtitle}>
                Kelola data sampah Anda dengan lebih mudah.
              </p>
            </div>

            <div style={styles.headerRight}>
              <div style={styles.datePill}>{todayDisplay}</div>
            </div>
          </section>

          <section style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, backgroundColor: '#38B46A' }}>
                <Trash2 size={26} color="#fff" />
              </div>
              <div>
                <h3 style={styles.statTitle}>Total Sampah Disetor</h3>
                <div style={styles.statValueWrap}>
                  <span style={{ ...styles.statValue, color: '#38B46A' }}>
                    {totalSampah.toLocaleString()}
                  </span>
                  <span style={styles.statUnit}>kg</span>
                </div>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, backgroundColor: '#3B82F6' }}>
                <Calendar size={26} color="#fff" />
              </div>
              <div>
                <h3 style={styles.statTitle}>Setoran Bulan Ini</h3>
                <div style={styles.statValueWrap}>
                  <span style={{ ...styles.statValue, color: '#3B82F6' }}>
                    {setoranBulanIni.toLocaleString()}
                  </span>
                  <span style={styles.statUnit}>kali</span>
                </div>
              </div>
            </div>
          </section>

          <section style={styles.chartSection}>
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <h3 style={styles.chartTitle}>Grafik Setoran Sampah</h3>
              </div>
              <div style={styles.chartContainer}>
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            </div>
          </section>

          <section style={styles.transactionsSection}>
            <div style={styles.transactionsCard}>
              <div style={styles.transactionsHeader}>
                <h3 style={styles.transactionsTitle}>Transaksi Terbaru</h3>
                <span style={styles.locationBadge}>{recentWaste.length} transaksi</span>
              </div>
              <div style={styles.transactionsList}>
                {recentWaste.map((w, index) => (
                  <div key={w.wasteId || index} style={styles.transactionItem}>
                    <div style={styles.transactionIcon}>
                      <Recycle size={24} color="#38B46A" />
                    </div>
                    <div style={styles.transactionInfo}>
                      <p style={styles.transactionCategory}>
                        Setor sampah {w.kategori?.namaKategori || 'sampah'}
                      </p>
                      <p style={styles.transactionDate}>{formatDate(w.tanggalInput || w.tanggal)}</p>
                    </div>
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

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '25px',
    marginBottom: '28px'
  },

  pageTitle: {
    margin: '0 0 12px 0',
    fontSize: '32px',
    lineHeight: '1',
    fontWeight: '900',
    color: '#111'
  },

  greenText: {
    color: '#064D36'
  },

  subtitle: {
    margin: 0,
    fontSize: '15px',
    color: '#8A8A8A'
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
    gridTemplateColumns: '1fr 1fr',
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
    fontSize: '16px',
    color: '#111',
    fontWeight: '700'
  },

  statValueWrap: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '6px',
    marginBottom: '8px'
  },

  statValue: {
    fontSize: '32px',
    lineHeight: '0.85',
    fontWeight: '900'
  },

  statUnit: {
    fontSize: '14px',
    color: '#777',
    fontWeight: '600'
  },

  statTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },

  trendText: {
    fontSize: '12px',
    color: '#38B46A',
    fontWeight: '600'
  },

  trendSubtext: {
    fontSize: '12px',
    color: '#999'
  },

  transactionsCard: {
    backgroundColor: '#fff',
    borderRadius: '24px',
    border: '1px solid #E5E5E5',
    boxShadow: '0 2px 0 rgba(0,0,0,0.25)',
    padding: '22px',
    boxSizing: 'border-box'
  },

  transactionsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },

  transactionsTitle: {
    margin: 0,
    fontSize: '16px',
    color: '#111',
    fontWeight: '700'
  },

  locationBadge: {
    backgroundColor: '#E0E7FF',
    color: '#4F46E5',
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 12px',
    borderRadius: '12px'
  },

  transactionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  transactionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 0',
    borderBottom: '1px solid #E5E5E5'
  },

  transactionIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#D1FAE5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },

  transactionInfo: {
    flex: 1
  },

  transactionCategory: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: '#111'
  },

  transactionDate: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: '#888'
  },

  chartSection: {
    width: '100%',
    marginBottom: '26px'
  },

  transactionsSection: {
    width: '100%'
  },

  chartCard: {
    border: '1px solid #E5E5E5',
    borderRadius: '22px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: '0 2px 0 rgba(0,0,0,0.25)',
    padding: '20px'
  },

  chartHeader: {
    marginBottom: '16px'
  },

  chartTitle: {
    margin: 0,
    fontSize: '16px',
    color: '#111',
    fontWeight: '700'
  },

  chartContainer: {
    height: '300px',
    width: '100%'
  }
};

export default WargaDashboard;
