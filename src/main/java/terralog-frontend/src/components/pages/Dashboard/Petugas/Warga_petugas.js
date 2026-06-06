import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import PetugasSidebar from '../PetugasSidebar'; // Pastikan path import sesuai struktur foldermu

const WargaPetugas = () => {
  // --- STATE & DATA ---
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const now = new Date();

  // --- FETCH DATA ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8080/api/users');
      // Pastikan data yang diterima adalah array
      const allUsers = Array.isArray(response.data) ? response.data : [];
      const dataWargaHanya = allUsers.filter(
        (user) => user.role?.toUpperCase().trim() === 'WARGA'
      );
      setUsers(dataWargaHanya);
    } catch (error) {
      console.error("Error fetch users:", error);
      Swal.fire('Error', 'Gagal menyambung ke server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- FILTER WARGA ---
  const filteredWarga = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();
    return users.filter(u => 
      (u.nama?.toLowerCase().includes(keyword) || 
       u.username?.toLowerCase().includes(keyword))
    );
  }, [users, searchTerm]);

  // --- PAGINATION LOGIC ---
  const totalItems = filteredWarga.length;
  // Perbaikan: gunakan || 1 agar minimal halaman adalah 1, mencegah totalPages = 0
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredWarga.slice(start, start + itemsPerPage);
  }, [filteredWarga, currentPage]);

  // --- RESET PAGE SAAT SEARCH ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

      const todayDisplay = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <PetugasSidebar activeMenu="warga" />

      {/* MAIN CONTENT AREA */}
      <div style={styles.mainContent}>
        <div style={styles.whiteCanvas}>
          
          {/* TOP HEADER */}
          <section style={styles.header}>
            <div>
              <h1 style={styles.pageTitle}>Data Sampah</h1>
              <p style={styles.subtitle}>Kelola data sampah TerraLog.</p>
            </div>

            <div style={styles.headerRight}>
              <div style={styles.datePill}>{todayDisplay}</div>
            </div>
          </section>

          {/* FILTER & DATA BAR */}
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
            <div style={styles.totalWargaText}>
              Total: <span style={{ fontWeight: 'bold', color: '#064D36' }}>{filteredWarga.length}</span> Warga Terdaftar
            </div>
          </div>

          {/* MAIN TABLE DATA */}
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={{ ...styles.th, width: '80px', borderRadius: '12px 0 0 12px' }}>No</th>
                  <th style={styles.th}>Nama Warga</th>
                  <th style={styles.th}>Username</th>
                  <th style={styles.th}>Alamat</th>
                  <th style={styles.th}>No Telp</th>
                  <th style={{ ...styles.th, borderRadius: '0 12px 12px 0' }}>Aksi</th>
                </tr>
              </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" style={styles.tdPlaceholder}>Memuat data warga...</td></tr>
                  ) : currentData.length > 0 ? (
                    currentData.map((warga, index) => (
                      <tr key={warga.userId || index} style={styles.tableRow}>
                        <td style={styles.td}>{index + 1}</td>
                        <td style={{ ...styles.td, fontWeight: '600' }}>{warga.nama || '-'}</td>
                        <td style={styles.td}>{warga.username || '-'}</td>
                        <td style={styles.td}>{warga.alamat || '-'}</td>
                        <td style={styles.td}>{warga.noHp || '-'}</td>
                        <td style={styles.td}>
                          <div style={styles.actionGroup}>
                            <button
                              style={styles.editButton}
                              onClick={() => navigate(`/admin/edit-warga/${warga.userId}`)}
                            >
                              <Edit size={22} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    /* Baris Kosong Sesuai Gambar Mockup jika data tidak ada */
                    [...Array(5)].map((_, i) => (
                        <tr key={i} style={styles.tableRowEmpty}>
                          <td colSpan="5">&nbsp;</td>
                        </tr>
                      ))
                    )}
                </tbody>
            </table>
          </div>
          <footer style={styles.footerRow}>
            <div style={styles.showingText}>
              Menampilkan {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - 
              {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} warga
            </div>

            <div style={styles.pagination}>
              {/* Tombol Previous */}
              <button 
                style={styles.pageArrow} // Pastikan key ini ada di objek styles
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft size={16} />
              </button>

              {/* Dynamic Page Numbers */}
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i + 1}
                  // Gabungkan base style dengan conditional active style
                  style={{
                    ...styles.pageButton, 
                    ...(currentPage === i + 1 ? styles.activePage : {})
                  }}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              {/* Tombol Next */}
              <button 
                style={styles.pageArrow} 
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
    backgroundColor: '#064D36', // Warna hijau luar yang menyatu dengan sidebar kamu
    minHeight: '100vh',
    fontFamily: "'Poppins', sans-serif",
  },
  mainContent: {
    marginLeft: '270px', // Jarak aman agar tidak tertimpa fixed sidebar
    flex: 1,
    padding: '25px',
    display: 'flex',
  },
  whiteCanvas: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    borderRadius: '32px', // Lengkungan sudut canvas putih utama
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
    gap: '14px'
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
  filterBar: {
    backgroundColor: '#F4F6F5', // Warna keabuan soft pada area pencarian tengah
    borderRadius: '16px',
    padding: '12px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
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
  totalWargaText: {
    fontSize: '13px',
    color: '#666',
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
    borderBottom: '1px solid #E2E8F0',
    backgroundColor: '#FFF',
  },
  tableRowEmpty: {
    height: '52px', // Memberikan tinggi baris kosong agar proporsional
    borderBottom: '1px solid #E2E8F0',
  },
  td: {
    padding: '16px 20px',
    fontSize: '14px',
    color: '#333',
    borderBottom: '1px solid #EFF2F5',
    borderRight: '1px solid #EFF2F5', // Grid vertikal tipis seperti pada gambar mockup
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
  pageArrow: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    border: '1px solid #DCE5E3',
    backgroundColor: '#fff',
    color: '#7B8494',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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
    transition: 'all 0.2s',
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

  
  footerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '18px'
  },

  showingText: {
    margin: 0,
    color: '#7B8494',
    fontSize: '13px'
  },

  pagination: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  pageButton: {
    minWidth: '30px',
    height: '30px',
    borderRadius: '8px',
    border: '1px solid #DCE5E3',
    backgroundColor: '#fff',
    color: '#064D36',
    cursor: 'pointer',
    fontWeight: '700'
  },

  activePageButton: {
    backgroundColor: '#064D36',
    color: '#fff'
  },

  pageArrow: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    border: '1px solid #DCE5E3',
    backgroundColor: '#fff',
    color: '#7B8494',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  pageDots: {
    color: '#7B8494',
    fontWeight: '700'
  }
};

export default WargaPetugas;