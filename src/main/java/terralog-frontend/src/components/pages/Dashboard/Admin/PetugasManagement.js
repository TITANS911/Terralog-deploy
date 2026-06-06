import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Bell,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import AdminSidebar from '../AdminSidebar';

const API_URL = 'http://127.0.0.1:8080/api/users';

const PetugasManagement = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [searchJadwal, setSearchJadwal] = useState('');
  const [searchPetugas, setSearchPetugas] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPageJadwal, setCurrentPageJadwal] = useState(1);
  const [currentPagePetugas, setCurrentPagePetugas] = useState(1);
  const now = new Date();

  const itemsPerPage = 5;

 const [jadwalPetugas, setJadwalPetugas] = useState([]);
 const [listWaste, setListWaste] = useState([]);

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.get(API_URL);
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Gagal mengambil data petugas:', error);
      console.error('Response:', error.response);
      console.error('Message:', error.message);

      const message =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Gagal mengambil data petugas dari server.';

      setErrorMessage(message);
      Swal.fire('Error', message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJadwal();
}, []);

// 3. Fungsi untuk mengambil data dari backend
const fetchJadwal = () => {
    axios.get('http://localhost:8080/api/jadwal')
        .then(res => {
            console.log("Data Jadwal dari Backend:", res.data); // Untuk debug di console f12
            // Pastikan res.data berbentuk Array. Jika tidak, sesuaikan dengan struktur response backend-mu
            setJadwalPetugas(res.data || []); 
        })
        .catch(err => {
            console.error("Gagal mengambil data jadwal petugas:", err);
            Swal.fire('Error', 'Gagal memuat data jadwal petugas', 'error');
        });
};

useEffect(() => {
    // Ambil data dari api/waste untuk referensi nama warga & nama sampah
    axios.get('http://localhost:8080/api/waste')
        .then(res => {
            setListWaste(res.data || []);
        })
        .catch(err => {
            console.error("Gagal memuat data waste:", err);
        });
}, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const petugasList = useMemo(() => {
    return users
      .filter((user) => user.role?.toUpperCase().trim() === 'PETUGAS')
      .filter((user) => {
        const keyword = searchPetugas.toLowerCase();

        return (
          user.nama?.toLowerCase().includes(keyword) ||
          user.username?.toLowerCase().includes(keyword) ||
          user.alamat?.toLowerCase().includes(keyword) ||
          user.noHp?.toLowerCase().includes(keyword)
        );
      });
  }, [users, searchPetugas]);

const filteredJadwal = useMemo(() => {
    return jadwalPetugas.filter((item) => {
      const keyword = searchJadwal.toLowerCase();

      // Ambil data nama petugas dengan aman (pake optional chaining `?.`)
      const namaPetugas = item.user?.nama?.toLowerCase() || '';
      
      // Ambil data lokasi tugas / alamat warga
      const lokasiTugas = item.lokasiTugas?.toLowerCase() || '';
      
      // Ambil data shift (opsional, jika ingin shift bisa dicari juga)
      const shiftTugas = item.shift?.toLowerCase() || '';

      return (
        namaPetugas.includes(keyword) ||
        lokasiTugas.includes(keyword) ||
        shiftTugas.includes(keyword)
      );
    });
    // PENTING: Tambahkan jadwalPetugas ke dalam dependency array 
    // agar useMemo mendeteksi saat ada data baru masuk dari backend!
  }, [searchJadwal, jadwalPetugas]);

  const totalPagesJadwal = Math.ceil(filteredJadwal.length / itemsPerPage) || 1;
  const totalPagesPetugas = Math.ceil(petugasList.length / itemsPerPage) || 1;

  const paginatedJadwal = useMemo(() => {
    const startIndex = (currentPageJadwal - 1) * itemsPerPage;
    return filteredJadwal.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredJadwal, currentPageJadwal]);

  const paginatedPetugas = useMemo(() => {
    const startIndex = (currentPagePetugas - 1) * itemsPerPage;
    return petugasList.slice(startIndex, startIndex + itemsPerPage);
  }, [petugasList, currentPagePetugas]);

  useEffect(() => {
    setCurrentPageJadwal(1);
  }, [searchJadwal]);

  useEffect(() => {
    setCurrentPagePetugas(1);
  }, [searchPetugas]);

  const handleDelete = (userId, nama) => {
    Swal.fire({
      title: 'Hapus Data Petugas?',
      text: `Yakin ingin menghapus ${nama}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#064D36',
      cancelButtonColor: '#E11D1D',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/${userId}`);

          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Data petugas berhasil dihapus.',
            confirmButtonColor: '#064D36'
          });

          fetchUsers();
        } catch (error) {
          console.error('Gagal menghapus data petugas:', error);
          Swal.fire('Gagal', 'Data petugas gagal dihapus.', 'error');
        }
      }
    });
  };

    const todayDisplay = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleDeleteJadwal = (idJadwal, namaPetugas) => {
    Swal.fire({
        title: 'Apakah Anda yakin?',
        text: `Jadwal milik petugas "${namaPetugas || 'Tanpa Nama'}" akan dihapus secara permanen!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1b4332', // Menyelaraskan dengan tema warna hijau TerraLog
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            // Mengirim request DELETE ke endpoint Spring Boot berdasarkan idJadwal
            axios.delete(`http://localhost:8080/api/jadwal/${idJadwal}`)
                .then(() => {
                    Swal.fire(
                        'Terhapus!',
                        'Jadwal petugas telah berhasil dihapus.',
                        'success'
                    );
                    // Panggil kembali fungsi fetch utama kamu agar data di tabel langsung ter-refresh otomatis
                    fetchJadwal(); 
                })
                .catch(err => {
                    console.error("Gagal menghapus data jadwal:", err);
                    Swal.fire(
                        'Gagal!',
                        'Terjadi kesalahan pada server saat mencoba menghapus data.',
                        'error'
                    );
                });
        }
    });

};

  const renderPagination = (currentPage, totalPages, setCurrentPage) => (
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
  );

  const startJadwal = filteredJadwal.length === 0 ? 0 : (currentPageJadwal - 1) * itemsPerPage + 1;
  const endJadwal = Math.min(currentPageJadwal * itemsPerPage, filteredJadwal.length);

  const startPetugas = petugasList.length === 0 ? 0 : (currentPagePetugas - 1) * itemsPerPage + 1;
  const endPetugas = Math.min(currentPagePetugas * itemsPerPage, petugasList.length);

  return (
    <div style={styles.container}>
      <AdminSidebar activeMenu="petugas" />

      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          <section style={styles.header}>
            <div>
              <h1 style={styles.pageTitle}>Data Petugas</h1>
              <p style={styles.subtitle}>Kelola data petugas TerraLog.</p>
            </div>

            <div style={styles.headerRight}>
              <div style={styles.datePill}>{todayDisplay}</div>
            </div>
          </section>

          <section style={styles.sectionCard}>
            <div style={styles.sectionTitle}>Jadwal Petugas</div>

            <div style={styles.sectionBody}>
              <div style={styles.searchPanel}>
                <div style={styles.searchBox}>
                  <Search size={16} color="#7D8490" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama petugas atau alamat..."
                    value={searchJadwal}
                    onChange={(e) => setSearchJadwal(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>
              </div>

              <div style={styles.actionRow}>
                <button
                  style={styles.addButton}
                  // Perbaikan: Pastikan rute ini mengarah ke file AddJadwal.js kamu
                  onClick={() => navigate('/admin/tambah-jadwal')} 
                >
                  <Plus size={22} />
                  Tambah Jadwal
                </button>
              </div>

              <div style={styles.tableCard}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ ...styles.th, width: '50px' }}>No</th>
                      <th style={styles.th}>Nama Petugas</th>
                      <th style={{ ...styles.th, width: '150px' }}>Warga - Sampah</th>
                      <th style={styles.th}>Shift</th>
                      <th style={styles.th}>Tanggal</th>
                      <th style={styles.th}>Alamat</th>
                      <th style={styles.th}>Keterangan</th>
                      <th style={styles.th}>Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                  {paginatedJadwal.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={styles.emptyCell}>
                        Data jadwal petugas belum tersedia.
                      </td>
                    </tr>
                  ) : (
                    paginatedJadwal.map((item, index) => {
                      // 1. Trik Frontend: Cari data waste yang alamatnya sama dengan lokasiTugas pada jadwal
                      const matchedWaste = listWaste.find(
                        (w) => w.user?.alamat?.toLowerCase() === item.lokasiTugas?.toLowerCase()
                      );
                    
                      // 2. Jika ketemu, gabungkan nama warga dan nama sampahnya
                      const namaWarga = matchedWaste?.user?.nama || '';
                      const namaSampah = matchedWaste?.namaSampah || '';
                      const wargaSampahText = matchedWaste ? `${namaWarga} - ${namaSampah}` : '-';
                    
                      return (
                        <tr key={index} style={styles.tr}>
                          <td style={styles.td}>{(currentPageJadwal - 1) * itemsPerPage + index + 1}</td>

                          {/* Menampilkan Nama Petugas */}
                          <td style={styles.td}>{item.user?.nama || 'Tanpa Nama'}</td>

                          {/* PERBAIKAN: Kolom Nama Warga - Nama Sampah sekarang dinamis */}
                          <td style={styles.td}>{wargaSampahText}</td>

                          <td style={styles.td}>{item.shift}</td>

                          {/* Menampilkan Tanggal Tugas */}
                          <td style={styles.td}>{item.tanggalTugas}</td>

                          {/* Menampilkan Alamat / Lokasi Tugas */}
                          <td style={styles.td}>{item.lokasiTugas || '-'}</td>

                          <td style={styles.td}>{item.keterangan || '-'}</td>
                          <td style={styles.td}>
                            <div style={styles.actionGroup}>
                              {/* 1. Tombol Edit Jadwal */}
                              <button
                                style={styles.editButton}
                                // Diarahkan menggunakan ID unik Jadwal (idJadwal)
                                onClick={() => navigate(`/admin/edit-jadwal/${item.idJadwal}`)}
                              >
                                <Edit size={20} />
                              </button>

                              {/* 2. Tombol Hapus Jadwal */}
                              <button
                                style={styles.deleteButton}
                                // Mempassing idJadwal untuk dihapus, dan nama petugas untuk keperluan info konfirmasi text di SweetAlert
                                onClick={() => handleDeleteJadwal(item.idJadwal, item.user?.nama)}
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </td>                                            
                        </tr>
                      );
                    })
                  )}
                  </tbody>
                </table>
              </div>

              <div style={styles.footerRow}>
                <p style={styles.showingText}>
                  Menampilkan <strong>{startJadwal} - {endJadwal}</strong> dari {filteredJadwal.length} jadwal
                </p>

                {renderPagination(currentPageJadwal, totalPagesJadwal, setCurrentPageJadwal)}
              </div>
            </div>
          </section>

          <section style={styles.sectionCard}>
            <div style={styles.sectionTitle}>Data Petugas</div>

            <div style={styles.sectionBody}>
              <div style={styles.searchPanel}>
                <div style={styles.searchBox}>
                  <Search size={16} color="#7D8490" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama atau alamat..."
                    value={searchPetugas}
                    onChange={(e) => setSearchPetugas(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>
              </div>

              <div style={styles.actionRow}>
                <button
                  style={styles.addButton}
                  onClick={() => navigate('/admin/tambah-petugas')}
                >
                  <Plus size={22} />
                  Tambah Petugas
                </button>
              </div>

              <div style={styles.tableCard}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ ...styles.th, width: '70px' }}>No</th>
                      <th style={styles.th}>Nama Petugas</th>
                      <th style={styles.th}>Username</th>
                      <th style={styles.th}>Alamat</th>
                      <th style={styles.th}>No Telp</th>
                      <th style={{ ...styles.th, width: '170px' }}>Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" style={styles.emptyCell}>
                          Memuat data petugas...
                        </td>
                      </tr>
                    ) : errorMessage ? (
                      <tr>
                        <td colSpan="6" style={styles.emptyCell}>
                          {errorMessage}
                        </td>
                      </tr>
                    ) : paginatedPetugas.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={styles.emptyCell}>
                          Data petugas belum tersedia.
                        </td>
                      </tr>
                    ) : (
                      paginatedPetugas.map((petugas, index) => (
                        <tr key={petugas.userId} style={styles.tr}>
                          <td style={styles.td}>
                            {(currentPagePetugas - 1) * itemsPerPage + index + 1}
                          </td>
                          <td style={styles.td}>{petugas.nama || '-'}</td>
                          <td style={styles.td}>{petugas.username || '-'}</td>
                          <td style={styles.td}>{petugas.alamat || '-'}</td>
                          <td style={styles.td}>{petugas.noHp || '-'}</td>
                          <td style={styles.td}>
                            <div style={styles.actionGroup}>
                              <button
                                style={styles.editButton}
                                onClick={() => navigate(`/admin/edit-petugas/${petugas.userId}`)}
                              >
                                <Edit size={22} />
                              </button>

                              <button
                                style={styles.deleteButton}
                                onClick={() => handleDelete(petugas.userId, petugas.nama)}
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

              <div style={styles.footerRow}>
                <p style={styles.showingText}>
                  Menampilkan <strong>{startPetugas} - {endPetugas}</strong> dari {petugasList.length} petugas
                </p>

                {renderPagination(currentPagePetugas, totalPagesPetugas, setCurrentPagePetugas)}
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
    padding: '32px 36px 42px 36px',
    boxSizing: 'border-box'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '24px',
    marginBottom: '36px'
  },

  pageTitle: {
    margin: '0 0 8px 0',
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

  datePill: {
    width: '520px',
    height: '44px',
    backgroundColor: '#064D36',
    color: '#fff',
    borderRadius: '28px',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '28px',
    boxSizing: 'border-box',
    fontSize: '14px',
    fontWeight: '600'
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

  sectionBody: {
    padding: '16px 20px 22px 20px'
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
    fontSize: '12px',
    color: '#6E7480',
    fontFamily: "'Poppins', sans-serif"
  },

  actionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '18px'
  },

  addButton: {
    width: '200px',
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
    gap: '10px',
    fontFamily: "'Poppins', sans-serif"
  },

  tableCard: {
    borderRadius: '8px 8px 22px 22px',
    overflow: 'hidden',
    border: '1px solid #CDD8D5',
    backgroundColor: '#F7FBFA'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed'
  },

  th: {
    height: '48px',
    backgroundColor: '#064D36',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '800',
    textAlign: 'center',
    borderRight: '1px solid rgba(255,255,255,0.15)'
  },

  tr: {
    height: '50px',
    borderBottom: '1px solid #C7D1CF'
  },

 td: {
    textAlign: 'center',
    verticalAlign: 'middle', // Memastikan teks benar-benar di tengah secara vertikal
    fontSize: '13px',
    color: '#333',
    padding: '12px 10px',     // PERBAIKAN: Memberikan padding atas-bawah 12px agar tidak tenggelam
    borderRight: '1px solid #C7D1CF',
    
    // PERBAIKAN: Hapus nowrap & ellipsis agar teks panjang mau turun ke bawah dengan rapi
    whiteSpace: 'normal',       // Membuat teks otomatis membungkus (wrap) ke baris baru
    wordBreak: 'break-word',    // Memotong kata yang terlalu panjang agar tidak merusak layout tabel
    maxWidth: '180px'           // Membatasi lebar maksimal kolom (terutama untuk keterangan)
},

  emptyCell: {
    height: '255px',
    textAlign: 'center',
    color: '#8A8A8A',
    fontSize: '14px',
    backgroundColor: '#F7FBFA'
  },

  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },

  editButton: {
    width: '42px',
    height: '38px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#064D36',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  deleteButton: {
    width: '42px',
    height: '38px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#FF1111',
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

export default PetugasManagement;