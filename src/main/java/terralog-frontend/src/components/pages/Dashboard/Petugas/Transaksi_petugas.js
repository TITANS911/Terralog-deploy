import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Search, ChevronLeft, ChevronRight, Download, ArrowUpRight, Plus, Edit, FileText, ClipboardList, } from 'lucide-react';
import PetugasSidebar from '../PetugasSidebar'; // Menggunakan sidebar seragam kamu

const TransaksiPetugas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]); // State data transaksi dari backend
  const [searchTerm, setSearchTerm] = useState('');
  const userName = localStorage.getItem('nama') || 'Petugas';
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const now = new Date();
  const today = new Date().toISOString().split('T')[0];
  const currentPetugasId = parseInt(localStorage.getItem('userId'), 10);

  useEffect(() => {
    console.log("=== DEBUG ===");
    console.log("currentPetugasId dari localStorage:", currentPetugasId);
    console.log("typeof currentPetugasId:", typeof currentPetugasId);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8080/api/transaksi');
        console.log("Data dari API:", response.data); // CEK INI DI CONSOLE F12
        console.log("Contoh 1 transaksi:", response.data[0]);
        if(response.data[0]) {
          console.log("Petugas pada transaksi:", response.data[0].petugas);
          console.log("userId petugas pada transaksi:", response.data[0].petugas?.userId);
        }
        setTransactions(response.data);
      } catch (error) {
        console.error("Gagal ambil data:", error);
        Swal.fire('Error', 'Gagal memuat data transaksi', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

const filteredData = useMemo(() => {
  console.log("=== Filtering ===");
  console.log("Semua transaksi:", transactions);
  console.log("currentPetugasId:", currentPetugasId);
  
  // 1. Filter transaksi yang petugasnya cocok dengan ID petugas yang login - gunakan Number() untuk memastikan tipe sama
  const dataMilikPetugas = transactions.filter(t => {
    const petugasIdTransaksi = Number(t.petugas?.userId);
    const currentId = Number(currentPetugasId);
    console.log(`Comparing: ${petugasIdTransaksi} === ${currentId}?`, petugasIdTransaksi === currentId);
    return petugasIdTransaksi === currentId;
  });
  
  console.log("Data milik petugas:", dataMilikPetugas);

  // 2. Jika ada search term, filter lagi berdasarkan nama/alamat warga
  const keyword = searchTerm.toLowerCase();
  return dataMilikPetugas.filter(t => 
    (t.user?.nama?.toLowerCase().includes(keyword) ||
     t.user?.alamat?.toLowerCase().includes(keyword))
  );
}, [transactions, searchTerm, currentPetugasId]);

const todayTransactions = useMemo(() => {
  return filteredData.filter(t => t.tanggal && t.tanggal.startsWith(today));
}, [filteredData, today]);

  // Reset ke halaman 1 jika ada pencarian
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // Fungsi helper untuk tombol pagination (seperti yang kita buat sebelumnya)
  const getPaginationGroup = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage, '...', totalPages];
  };

  const todayDisplay = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <PetugasSidebar activeMenu="transaksi" />

      {/* MAIN CONTENT AREA */}
      <div style={styles.mainContent}>
        <div style={styles.whiteCanvas}>
          
          {/* TOP HEADER */}
          <section style={styles.header}>
            <div>
              <h1 style={styles.pageTitle}>Data Transaksi</h1>
              <p style={styles.subtitle}>Pantau transaksi setoran sampah warga.</p>
            </div>
            
            {/* Top Search Bar & Icons Right */}
            <div style={styles.headerRight}>
              <div style={styles.datePill}>{todayDisplay}</div>
            </div>
          </section>

          {/* INDICATOR TOP CARDS GRID */}
          <section style={styles.statsGrid}>
            {/* Card 1: Total Transaksi */}
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, backgroundColor: '#39A96B' }}>
                <FileText size={26} color="#fff" />
              </div>
              <div>
                <h3 style={styles.statTitle}>Total Transaksi</h3>
                <div style={styles.statValueWrap}>
                  <span style={{ ...styles.statValue, color: '#39A96B' }}>{filteredData.length}</span>
                  <span style={styles.statUnit}>transaksi</span>
                </div>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, backgroundColor: '#5B9CF6' }}>
                <ClipboardList size={26} color="#fff" />
              </div>
              <div>
                <h3 style={styles.statTitle}>Transaksi Hari Ini</h3>
                <div style={styles.statValueWrap}>
                  <span style={{ ...styles.statValue, color: '#5B9CF6' }}>{todayTransactions.length}</span>
                  <span style={styles.statUnit}>transaksi</span>
                </div>
              </div>
            </div>
          </section>

          {/* AREA FILTER & EXPORT */}
          <div style={styles.filterBar}>
            <div style={styles.filterInputWrapper}>
              <Search size={16} color="#999" style={{ marginRight: '10px' }} />
              <input 
                type="text" 
                placeholder="Cari berdasarkan nama atau alamat..." 
                style={styles.filterInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={styles.totalIndicatorText}>
              Total: <span style={{ fontWeight: 'bold', color: '#064D36' }}>{filteredData.length}</span> Transaksi
            </div>
          </div>

          <div style={styles.actionRow}>
             <button
               style={styles.addButton}
               onClick={() => navigate('/petugas/tambah-transaksi')}
             >
               <Plus size={24} />
               Tambah Data Transaksi
             </button>
          </div>

          {/* MAIN DATA TABLE */}
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={{ ...styles.th, width: '70px', borderRadius: '12px 0 0 12px' }}>No</th>
                  <th style={styles.th}>Warga</th>
                  <th style={styles.th}>Tanggal</th>
                  <th style={styles.th}>Alamat</th>
                  <th style={styles.th}>Kategori Sampah</th>
                  <th style={styles.th}>Total Berat (kg)</th>
                  <th style={{ ...styles.th, borderRadius: '0 12px 12px 0' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={styles.tdPlaceholder}>Memuat data transaksi...</td></tr>
                ) : currentData.length > 0 ? (
                  currentData.map((t, index) => (
                    <tr key={t.transaksiId || index} style={styles.tableRow}>
                      <td style={styles.td}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      {/* Pastikan nama property 'user' sesuai dengan di Backend Model */}
                      <td style={{ ...styles.td, fontWeight: '600' }}>{t.user?.nama || 'N/A'}</td>
                      <td style={styles.td}>{t.tanggal || '-'}</td>
                      <td style={styles.td}>{t.lokasi || '-'}</td>
                      <td style={styles.td}>{t.kategoriSampah || '-'}</td>
                      <td style={styles.td}>{t.totalBerat || '0'}</td>
                      <td style={styles.td}>
                        <div style={styles.actionGroup}>
                            <button
                              style={styles.editButton}
                              onClick={() => navigate(`/petugas/edit-transaksi/${t.transaksiId}`)}
                            >
                              <Edit size={22} />
                            </button>
                        </div>
                      </td>
                      
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" style={styles.tdPlaceholder}>Tidak ada data tersedia</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER & PAGINATION */}
          <footer style={styles.tableFooter}>
  <div style={styles.paginationInfo}>
    Menampilkan {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - 
    {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} transaksi
  </div>
  
  <div style={styles.paginationControls}>
    <button 
      style={styles.pageArrowButton} 
      disabled={currentPage === 1}
      onClick={() => setCurrentPage(p => p - 1)}
    >
      <ChevronLeft size={16} />
    </button>

    {getPaginationGroup().map((item, index) => (
      item === '...' ? (
        <span key={index} style={{ padding: '0 8px', color: '#999' }}>...</span>
      ) : (
        <button 
          key={index}
          style={{ 
            ...styles.pageNumberButton, 
            ...(currentPage === item ? styles.activePage : {}) 
          }}
          onClick={() => setCurrentPage(item)}
        >
          {item}
        </button>
      )
    ))}

    <button 
      style={styles.pageArrowButton} 
      disabled={currentPage === totalPages || totalPages === 0}
      onClick={() => setCurrentPage(p => p + 1)}
    >
      <ChevronRight size={16} />
    </button>
  </div>
</footer>

        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    backgroundColor: '#064D36', // Warna hijau dasar luar area
    minHeight: '100vh',
    fontFamily: "'Inter', 'Poppins', sans-serif",
  },
  mainContent: {
    marginLeft: '260px', // Toleransi fixed sidebar agar tidak berbenturan
    flex: 1,
    padding: '25px',
    display: 'flex',
  },
  whiteCanvas: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    borderRadius: '32px', // Melengkungkan canvas putih utama
    padding: '40px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
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
    gap: '12px',
  },
  topSearchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#064D36',
    borderRadius: '25px',
    padding: '6px 15px',
    width: '240px',
  },
  topSearchInput: {
    border: 'none',
    backgroundColor: 'transparent',
    color: '#fff',
    outline: 'none',
    fontSize: '13px',
    width: '100%',
  },
  iconCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '260px 300px',
    gap: '28px',
    marginBottom: '28px'
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
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px',
  },
  cardIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#444',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
  },
  cardValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#064D36',
    margin: '0 0 5px 0',
  },
  cardUnit: {
    fontSize: '14px',
    fontWeight: '400',
    color: '#777',
  },
  cardTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
  },
  trendGreen: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  trendPeriod: {
    color: '#888',
  },
  filterBar: {
    backgroundColor: '#F4F6F5',
    borderRadius: '16px',
    padding: '12px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  filterInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '8px 16px',
    width: '400px',
  },
  filterInput: {
    border: 'none',
    outline: 'none',
    fontSize: '13px',
    color: '#333',
    width: '100%',
  },
  totalIndicatorText: {
    fontSize: '13px',
    color: '#666',
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '20px',
  },
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FFC107', // Tombol warna kuning amber khas tombol export mockup
    color: '#000',
    fontWeight: '600',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'opacity 0.2s',
  },
  tableWrapper: {
    flex: 1,
    overflowX: 'auto',
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
  },
  tableHeadRow: {
    backgroundColor: '#064D36',
  },
  th: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: '14px',
    padding: '16px 20px',
    textAlign: 'left',
  },
  tableRow: {
    borderBottom: '1px solid #EFF2F5',
    backgroundColor: '#FFF',
  },
  tableRowEmpty: {
    height: '54px',
    borderBottom: '1px solid #EFF2F5',
  },
  td: {
    padding: '16px 20px',
    fontSize: '14px',
    justifyContent: 'center',
    color: '#333',
    borderBottom: '1px solid #EFF2F5',
    borderRight: '1px solid #EFF2F5', // Grid garis kolom tipis pembatas vertikal
  },
  tdPlaceholder: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
    fontSize: '14px',
  },
  tableFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: '15px',
  },
  paginationInfo: {
    fontSize: '13px',
    color: '#777',
  },
  paginationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  pageArrowButton: {
    border: '1px solid #E2E8F0',
    backgroundColor: '#FFF',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  pageNumberButton: {
    border: '1px solid #E2E8F0',
    backgroundColor: '#FFF',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#444',
    cursor: 'pointer',
  },
  activePage: {
    backgroundColor: '#064D36',
    color: '#FFF',
    border: '1px solid #064D36',
  },
  pageDots: {
    fontSize: '13px',
    color: '#999',
    padding: '0 4px',
  },
  addButton: {
    width: '270px',
    height: '46px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#FFD21A',
    color: '#064D36',
    fontSize: '17px',
    fontWeight: '800',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    fontFamily: "'Poppins', sans-serif"
  },

     actionGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  },
    editButton: {
    width: '40px',
    height: '34px',
    borderRadius: '9px',
    border: 'none',
    backgroundColor: '#064D36',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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

export default TransaksiPetugas;