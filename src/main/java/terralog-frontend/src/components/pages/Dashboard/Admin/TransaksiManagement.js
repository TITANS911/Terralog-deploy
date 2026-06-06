import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaEye } from 'react-icons/fa';
import {
  Search,
  Bell,
  Edit,
  Trash2,
  User,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  ClipboardList,
  TrendingUp,
} from 'lucide-react';

import AdminSidebar from '../AdminSidebar';

const API_URL = 'http://127.0.0.1:8080/api/waste';

const TransaksiManagement = () => {

  const navigate = useNavigate();
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sampah, setSampah] = useState([]); // Tambahkan ini
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageTransaksi, setCurrentPageTransaksi] = useState(1);  
  const [currentPageWaste, setCurrentPageWaste] = useState(1)
  // Ganti searchTerm menjadi dua state terpisah
  const [searchTransaksi, setSearchTransaksi] = useState('');
  const [searchWaste, setSearchWaste] = useState('');
  const now = new Date();

  const itemsPerPage = 5;

  const fetchTransaksi = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.get('http://127.0.0.1:8080/api/transaksi');
      setTransaksi(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Gagal mengambil data transaksi:', error);
      console.error('Response:', error.response);
      console.error('Message:', error.message);

      let message = 'Gagal mengambil data transaksi dari server.';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          message = error.response.data;
        } else if (error.response.data.message) {
          message = error.response.data.message;
        } else if (error.response.data.error) {
          message = error.response.data.error; 
        }
      } else if (error.message) {
        message = error.message;
      }

      setErrorMessage(message);
      Swal.fire('Error', message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchWaste = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8080/api/waste');
    setSampah(Array.isArray(response.data) ? response.data : []);
  } catch (error) {
    console.error('Gagal mengambil data sampah:', error);
  }
};
  useEffect(() => {
    fetchWaste();
    fetchTransaksi();
  }, []);

  

  // MENYESUAIKAN DENGAN STRUKTUR JSON BARU
  const getDeskripsi = (item) => {
    // Mengambil properti deskripsi dari objek item (waste)
    if (item.deskripsi && item.deskripsi.trim() !== '') {
      return item.deskripsi;
    }
    return '-'; // Return minus jika deskripsinya kosong atau null
  };

  const getNamaWarga = (item) => {
    if (item.namaWarga || item.warga?.nama || item.user?.nama || item.nama) {
      return item.namaWarga || item.warga?.nama || item.user?.nama || item.nama;
    }
    // Jika backend hanya mengirim userId mentah
    return item.userId ? `User ID: ${item.userId}` : '-';
  };

const getTanggal = (item) => {
    const rawDate = item.tanggalInput || item.tanggal || item.tanggalTransaksi || item.createdAt;
    if (!rawDate || rawDate === '-') return '-';
    try {
      const dateObj = new Date(rawDate);
      
      if (isNaN(dateObj.getTime())) return rawDate;

      return dateObj.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Gagal memformat tanggal:", error);
      return rawDate; 
    }
  };

  const getAlamat = (item) => {
    return (
      item.alamat ||
      item.warga?.alamat ||
      item.user?.alamat ||
      '-'
    );
  };
  const getPetugas = (item) => {
  // Sesuaikan dengan struktur JSON dari API waste kamu
  return item.petugas?.nama || item.namaPetugas || 'Petugas';
};

const getWarga = (item) => {
  // Pastikan konsisten dengan apa yang ada di tabel dan filter
  const nama = item.namaWarga || item.warga?.nama || item.user?.nama || item.nama || "";
  return nama;
};

  // Otomatis mendeteksi kategori mana yang tidak bernilai null/0
const getKategori = (item) => {
  // Jika item punya relasi objek kategori, ambil namanya
  if (item.kategori && item.kategori.nama_kategori) {
    return item.kategori.nama_kategori;
  }
  // Fallback jika belum ter-join
  return '-';
};

  // Otomatis mencari nilai angka berat dari kolom kategori yang terisi
const getBerat = (item) => {
  // Pastikan berat ada dan valid
  return item.berat ? item.berat : 0;
};
  const filteredTransaksi = useMemo(() => {
  const keyword = searchTransaksi.toLowerCase();
  
  return transaksi.filter((item) => {
    const namaWarga = (item.namaWarga || item.warga?.nama || "").toLowerCase();
    const namaPetugas = (item.petugas?.nama || item.namaPetugas || "").toLowerCase();
    const alamat = (item.alamat || item.warga?.alamat || "").toLowerCase();

    // 1. Definisikan logika pencariannya di sini
    const isMatch = namaWarga.includes(keyword) || 
                    namaPetugas.includes(keyword) || 
                    alamat.includes(keyword);

    // 2. Sekarang variabel 'isMatch' sudah ada, Anda bisa memakainya
    if (keyword && isMatch) {
      console.log("Data ditemukan:", item);
    }

    return isMatch;
  });
}, [transaksi, searchTransaksi]); // Gunakan searchTransaksi (bukan searchTerm) // Dependency array juga harus diganti

  const transaksiHariIni = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    return transaksi.filter((item) => {
      const tanggal = getTanggal(item).toString();
      return tanggal.includes(today);
    }).length;
  }, [transaksi]);

  const totalPages = Math.ceil(filteredTransaksi.length / itemsPerPage) || 1;

  const paginatedTransaksi = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransaksi.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransaksi, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTransaksi, searchWaste]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:8080/api/waste/${id}/status`, newStatus, {
        headers: { 'Content-Type': 'text/plain' }
      });

      // Update state sampah agar UI berubah instan
      setSampah(prev => prev.map(item => item.wasteId === id ? { ...item, status: newStatus } : item));

      alert(`Status berhasil diperbarui!`);
    } catch (error) {
      console.error("Gagal update:", error);
      alert("Gagal update status.");
    }
  };
  const handleDeleteTransaksi = async (id) => {
  const result = await Swal.fire({
    title: 'Apakah Anda yakin?',
    text: "Data akan dihapus permanen!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, hapus!'
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`http://127.0.0.1:8080/api/transaksi/${id}`);
      Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
      fetchTransaksi(); // Refresh data setelah hapus
    } catch (error) {
      console.error("Gagal menghapus:", error);
      Swal.fire('Error', 'Gagal menghapus data.', 'error');
    }
  }
};

  const handleExport = () => {
    if (filteredTransaksi.length === 0) {
      Swal.fire('Info', 'Tidak ada data transaksi untuk diexport.', 'info');
      return;
    }

    const header = ['No', 'Warga', 'Tanggal', 'Alamat', 'Kategori Sampah', 'Total Berat (kg)'];

    const rows = filteredTransaksi.map((item, index) => [
      index + 1,
      getNamaWarga(item),
      getTanggal(item),
      getAlamat(item),
      getKategori(item),
      getBerat(item)
    ]);


    const csvContent = [header, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', 'data-transaksi-terralog.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

const filteredWaste = useMemo(() => {
  const keyword = searchWaste.toLowerCase().trim();
  
  if (!sampah || sampah.length === 0) return [];

  return sampah.filter((item) => {
    // Gunakan fungsi getWarga yang sudah diperbaiki
    const namaWarga = String(getWarga(item)).toLowerCase();
    const namaPetugas = String(getPetugas(item)).toLowerCase();
    
    // Pastikan pencarian mencari ke field yang benar
    return namaWarga.includes(keyword) || namaPetugas.includes(keyword);
  });
}, [sampah, searchWaste]);

  // 2. Baru kemudian deklarasikan variabel yang bergantung padanya
  const totalPagesWaste = Math.ceil(filteredWaste.length / itemsPerPage) || 1;

  const paginatedWaste = useMemo(() => {
    const startIndex = (currentPageWaste - 1) * itemsPerPage;
    return filteredWaste.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredWaste, currentPageWaste, itemsPerPage]);

  const startNumberWaste = filteredWaste.length === 0 ? 0 : (currentPageWaste - 1) * itemsPerPage + 1;
  const endNumberWaste = Math.min(currentPageWaste * itemsPerPage, filteredWaste.length);

  const startNumber = filteredTransaksi.length === 0 ? 0 : (currentPageTransaksi - 1) * itemsPerPage + 1;
  const endNumber = Math.min(currentPageTransaksi * itemsPerPage, filteredTransaksi.length);

  const todayDisplay = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Tambahkan fungsi ini di dalam TransaksiManagement.js
  const renderPagination = (currentPage, totalPages, setCurrentPage, filteredData, startNum, endNum, label) => {
    if (!filteredData) return null;
  return (
    <section style={styles.footerRow}>
      <p style={styles.showingText}>
        Menampilkan <strong>{startNum} - {endNum}</strong> dari {filteredData.length} {label}
      </p>

      <div style={styles.pagination}>
        <button
          style={styles.pageArrow}
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          <ChevronLeft size={18} />
        </button>

        {/* Tombol Angka Halaman */}
        {Array.from({ length: Math.min(totalPages, 3) }).map((_, index) => {
          const pageNumber = index + 1;
          return (
            <button
              key={pageNumber}
              style={{ ...styles.pageButton, ...(currentPage === pageNumber ? styles.activePageButton : {}) }}
              onClick={() => setCurrentPage(pageNumber)}
            >
              {pageNumber}
            </button>
          );
        })}

        {totalPages > 4 && <span style={styles.pageDots}>...</span>}
      
        {totalPages > 3 && (
          <button
            style={{ ...styles.pageButton, ...(currentPage === totalPages ? styles.activePageButton : {}) }}
            onClick={() => setCurrentPage(totalPages)}
          >
            {totalPages}
          </button>
        )}

        <button
          style={styles.pageArrow}
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
};

  return (
    <div style={styles.container}>
      <AdminSidebar activeMenu="transaksi" />

      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          <section style={styles.header}>
            <div>
              <h1 style={styles.pageTitle}>Data Transaksi</h1>
              <p style={styles.subtitle}>Kelola data transaksi TeraaLog.</p>
            </div>

            <div style={styles.headerRight}>
              <div style={styles.datePill}>{todayDisplay}</div>
            </div>
          </section>

          <section style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, backgroundColor: '#39A96B' }}>
                <FileText size={26} color="#fff" />
              </div>

              <div>
                <h3 style={styles.statTitle}>Total Transaksi</h3>

                <div style={styles.statValueWrap}>
                  <span style={{ ...styles.statValue, color: '#39A96B' }}>
                    {transaksi.length}
                  </span>
                  <span style={styles.statUnit}>transaksi</span>
                </div>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, backgroundColor: '#5B9CF6' }}>
                <ClipboardList size={26} color="#fff" />
              </div>

              <div>
                <h3 style={styles.statTitle}>Total Sampah</h3>

                <div style={styles.statValueWrap}>
                  <span style={{ ...styles.statValue, color: '#5B9CF6' }}>
                    {sampah.length}
                  </span>
                  <span style={styles.statUnit}>sampah</span>
                </div>
              </div>
            </div>
          </section>

          <div style={styles.actionRow}>

            {/* Tombol Export di Sebelah Kanan */}
            <button style={styles.exportButton} onClick={handleExport}>
              <Download size={21} />
              Export
            </button>
          </div>

          <section style={styles.sectionCard}>
            <div style={styles.sectionTitle}>Data Transaksi</div>

            <div style={styles.sectionBody}>
              <div style={styles.searchPanel}>
                <div style={styles.searchBox}>
                  <Search size={18} color="#7D8490" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama petugas..."
                    value={searchTransaksi}
                    onChange={(e) => setSearchTransaksi(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>
              </div>
            

            <div style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, width: '80px' }}>No</th>
                    <th style={styles.th}>Petugas</th>
                    <th style={styles.th}>Warga</th>
                    <th style={styles.th}>Tanggal</th>
                    <th style={styles.th}>Detail</th>
                    <th style={styles.th}>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={styles.emptyCell}>
                        Memuat data transaksi...
                      </td>
                    </tr>
                  ) : errorMessage ? (
                    <tr>
                      <td colSpan="6" style={styles.emptyCell}>
                        {errorMessage}
                      </td>
                    </tr>
                  ) : paginatedTransaksi.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={styles.emptyCell}>
                        Data transaksi belum tersedia.
                      </td>
                    </tr>
                  ) : (
                    paginatedTransaksi.map((item, index) => (
                      <tr key={item.wasteId || item.id || index} style={styles.tr}>
                        <td style={styles.td}>
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>

                        <td style={styles.td}>{getPetugas(item)}</td>
                        <td style={styles.td}>{getNamaWarga(item)}</td>
                        <td style={styles.td}>{getTanggal(item)}</td>
                        <td style={styles.td}>
                            <button 
                              style={styles.detailButton}
                              onClick={() => navigate(`/admin/detail-transaksi/${item.transaksiId}`)} // Pastikan ini sudah pakai navigate yang dideklarasikan
                            >
                              <FaEye size={18} />
                              Detail
                            </button>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actionGroup}>

                            <button style={styles.editButton} onClick={() => {
                              console.log("Data Item:", item); // <--- LIHAT DI KONSOL!
                              console.log("ID yang akan dikirim:", item.transaksiId); // <--- SESUAIKAN DENGAN NAMA PROPERTI ASLI
                              navigate(`/petugas/edit-transaksi/${item.transaksiId}`);
                              }}>
                              <Edit size={22}/>
                            </button>

                              <button
                                style={styles.deleteButton}
                                onClick={() => handleDeleteTransaksi(item.transaksiId, item.namaWarga)}
                              >
                                <Trash2 size={22} />
                              </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <section style={styles.footerRow}>
              <p style={styles.showingText}>
                Menampilkan <strong>{startNumber} - {endNumber}</strong> dari {filteredTransaksi.length} transaksi
              </p>

              <div style={styles.pagination}>
                <button
                  style={styles.pageArrow}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: Math.min(totalPages, 3) }).map((_, index) => {
                  const pageNumber = index + 1;

                  return (
                    <button
                      key={pageNumber}
                      style={{
                        ...styles.pageButton,
                        ...(currentPage === pageNumber ? styles.activePageButton : {})
                      }}
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </button> 
                  );
                })}

                {totalPages > 4 && <span style={styles.pageDots}>...</span>}

                {totalPages > 3 && (
                  <button
                    style={{
                      ...styles.pageButton,
                      ...(currentPage === totalPages ? styles.activePageButton : {})
                    }}
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </button>
                )}

                <button
                  style={styles.pageArrow}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  <ChevronRight size={18} />
                </button>
              </div>        
            </section>
            </div>
          </section>
        
        
          <section style={styles.sectionCard}>
            <div style={styles.sectionTitle}>Data sampah</div>
              <div style={styles.sectionBody}>
                <div style={styles.searchPanel}>
                  <div style={styles.searchBox}>
                    <Search size={18} color="#7D8490" />
                    <input
                      type="text"
                      placeholder="Cari berdasarkan nama warga..." // Update placeholder agar sesuai
                      value={searchWaste}
                      onChange={(e) => setSearchWaste(e.target.value)}
                      style={styles.searchInput}
                    />
                  </div>
                </div>
              
            
              <div style={styles.tableCard}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ ...styles.th, width: '80px' }}>No</th>
                      <th style={styles.th}>Warga</th>
                      <th style={styles.th}>Tanggal</th>
                      <th style={styles.th}>Alamat</th>
                      <th style={styles.th}>Kategori Sampah</th>
                      <th style={styles.th}>Total Berat (kg)</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                
                  
                  <tbody>
                    {loading ? (
                        <tr><td colSpan="7" style={styles.emptyCell}>Memuat...</td></tr>
                      ) : paginatedWaste.length === 0 ? (
                        <tr><td colSpan="7" style={styles.emptyCell}>Data tidak ditemukan.</td></tr>
                      ) : (
                      paginatedWaste.map((item, index) => (
                        <tr key={item.wasteId || index} style={styles.tr}>
                          <td style={styles.td}>{startNumberWaste + index}</td> {/* Nomor urut dinamis */}
                          <td style={styles.td}>{getNamaWarga(item)}</td>
                          <td style={styles.td}>{getTanggal(item)}</td>
                          <td style={styles.td}>{getAlamat(item)}</td>
                          <td style={styles.td}>
  {item.kategori 
    ? (item.kategori.namaKategori || item.kategori.nama_kategori) 
    : `ID Kategori: ${item.idKategori}`
  }
</td>
                          <td style={styles.td}>{getBerat(item)} Kg</td>
                          <td style={styles.td}>
                            <select
                              value={item.status || 'PENDING'}
                              onChange={(e) => handleStatusChange(item.wasteId, e.target.value)}
                              style={{
                                ...styles.statusDropdown,
                                ...(item.status === 'SELESAI' ? styles.statusSelectSuccess : styles.statusSelectPending)
                              }}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="SELESAI">SELESAI</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div style={styles.footerRow}>
                <p style={styles.showingText}>
                  Menampilkan <strong>{startNumberWaste} - {endNumberWaste}</strong> dari {filteredWaste.length} data sampah
                </p>
                {renderPagination(
                  currentPageWaste, 
                  totalPagesWaste, 
                  setCurrentPageWaste, 
                  filteredWaste,      // Data yang sudah difilter
                  startNumberWaste,   // Nomor awal (e.g., 1)
                  endNumberWaste,     // Nomor akhir (e.g., 5)
                  "data sampah"       // Label teks
                )}
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
    padding: '38px 48px 42px 48px',
    boxSizing: 'border-box'
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
    fontSize: '40px',
    lineHeight: '1',
    fontWeight: '900',
    color: '#111'
  },

  subtitle: {
    margin: 0,
    fontSize: '18px',
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

  circleButton: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  
  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  },

  editButton: {
    width: '50px',
    height: '44px',
    borderRadius: '9px',
    border: 'none',
    backgroundColor: '#064D36',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  deleteButton: {
    width: '50px',
    height: '44px',
    borderRadius: '9px',
    border: 'none',
    backgroundColor: '#FF1111',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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

  searchSection: {
    minHeight: '76px',
    borderRadius: '28px',
    backgroundColor: '#F3F8F6',
    border: '1px solid #DCE8E3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 42px 0 22px',
    boxSizing: 'border-box',
    marginBottom: '16px'
  },

  searchBox: {
    width: '300px',
    height: '34px',
    backgroundColor: '#fff',
    borderRadius: '9px',
    border: '1px solid #D8DFDE',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0 12px',
    boxSizing: 'border-box'
  },

  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '14px',
    color: '#6E7480',
    fontFamily: "'Poppins', sans-serif"
  },

  totalText: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    color: '#7B8494',
    fontSize: '14px'
  },

  actionRow: {
    display: 'flex',
    justifyContent: 'space-between', // Mengatur agar judul di kiri dan tombol di kanan
    alignItems: 'center',            // Membuat judul dan tombol sejajar secara vertikal
    marginBottom: '16px'
  },

  tableTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '800',
    color: '#064D36',                 // Menggunakan warna hijau tema TerraLog kamu
    fontFamily: "'Poppins', sans-serif"
  },
  
  exportButton: {
    width: '125px',
    height: '42px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#FFD21A',
    color: '#064D36',
    fontSize: '15px',
    fontWeight: '800',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '9px',
    fontFamily: "'Poppins', sans-serif",
    marginLeft: 'auto' // Ini memastikan tombol tetap di sebelah kanan
  },

  tableCard: {
    borderRadius: '8px 8px 22px 22px',
    overflow: 'auto',
    border: '1px solid #CDD8D5',
    backgroundColor: '#F7FBFA'
  },


  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed'
  },

  th: {
    height: '62px',
    backgroundColor: '#064D36',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '800',
    textAlign: 'center',
    borderRight: '1px solid rgba(255,255,255,0.15)'
  },

  tr: {
    height: '66px',
    borderBottom: '1px solid #C7D1CF'
  },

  td: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#333',
    padding: '0 12px',
    borderRight: '1px solid #C7D1CF',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  emptyCell: {
    height: '330px',
    textAlign: 'center',
    color: '#8A8A8A',
    fontSize: '15px',
    backgroundColor: '#F7FBFA'
  },

  footerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px'
  },

  showingText: {
    margin: 0,
    color: '#7B8494',
    fontSize: '14px'
  },

  pagination: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px'
  },

  pageButton: {
    minWidth: '34px',
    height: '34px',
    borderRadius: '9px',
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
    width: '34px',
    height: '34px',
    borderRadius: '9px',
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
  },
  // ===== STYLING DROPDOWN STATUS =====
  statusDropdown: {
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
    border: '1px solid #D1DDD9',
    cursor: 'pointer',
    outline: 'none',
    textAlign: 'center',
    fontFamily: "'Poppins', sans-serif",
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    transition: 'all 0.2s ease'
  },
  
  // Warna latar ketika status PENDING
  statusSelectPending: {
    backgroundColor: '#FFF9E6',
    color: '#F3A000',
    border: '1px solid #FFEAA7'
  },

  // Warna latar ketika status SELESAI
  statusSelectSuccess: {
    backgroundColor: '#E6F4EA',
    color: '#137333',
    border: '1px solid #CEEAD6'
  },

  detailButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', // Ini membuat Ikon & Teks tetap di tengah tombol
    gap: '8px',
    backgroundColor: '#064D36',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    margin: '0 auto', // Ini membantu menempatkan tombol di tengah td
  },

    searchPanel: {
    minHeight: '60px',
    borderRadius: '20px',
    backgroundColor: '#F3F8F6',
    border: '1px solid #DCE8E3',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    boxSizing: 'border-box',
    marginBottom: '18px'
  },

    sectionBody: {
    padding: '16px 20px 22px 20px'
  },

    sectionCard: {
    border: '1px solid #D5D5D5',
    borderRadius: '24px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: '48px',
    boxShadow: '0 2px 0 rgba(0,0,0,0.2)'
  },

    sectionTitle: {
    height: '48px',
    borderBottom: '1px solid #D5D5D5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '21px',
    fontWeight: '800',
    color: '#111'
  },
};

export default TransaksiManagement;