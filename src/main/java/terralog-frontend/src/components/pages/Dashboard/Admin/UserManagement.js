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

const UserManagement = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const now = new Date();

  const itemsPerPage = 5;

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.get(API_URL);
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Gagal mengambil data warga:', error);
      setErrorMessage('Gagal mengambil data warga dari server.');
      Swal.fire('Error', 'Gagal mengambil data warga dari server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const wargaList = useMemo(() => {
    return users
      .filter((user) => user.role?.toUpperCase().trim() === 'WARGA')
      .filter((user) => {
        const keyword = searchTerm.toLowerCase();

        return (
          user.nama?.toLowerCase().includes(keyword) ||
          user.username?.toLowerCase().includes(keyword) ||
          user.alamat?.toLowerCase().includes(keyword) ||
          user.noHp?.toLowerCase().includes(keyword)
        );
      });
  }, [users, searchTerm]);

  const totalPages = Math.ceil(wargaList.length / itemsPerPage) || 1;

  const paginatedWarga = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return wargaList.slice(startIndex, startIndex + itemsPerPage);
  }, [wargaList, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = (userId, nama) => {
    Swal.fire({
      title: 'Hapus Data Warga?',
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
            text: 'Data warga berhasil dihapus.',
            confirmButtonColor: '#064D36'
          });

          fetchUsers();
        } catch (error) {
          console.error('Gagal menghapus data warga:', error);
          Swal.fire('Gagal', 'Data warga gagal dihapus.', 'error');
        }
      }
    });
  };

    const todayDisplay = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });


  const startNumber = wargaList.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endNumber = Math.min(currentPage * itemsPerPage, wargaList.length);

  return (
    <div style={styles.container}>
      <AdminSidebar activeMenu="warga" />

      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          <section style={styles.header}>
            <div>
              <h1 style={styles.pageTitle}>Data Warga</h1>
              <p style={styles.subtitle}>Kelola data warga TerraLog.</p>
            </div>

            <div style={styles.headerRight}>
              <div style={styles.datePill}>{todayDisplay}</div>
            </div>
          </section>

          <section style={styles.searchSection}>
            <div style={styles.searchBox}>
              <Search size={18} color="#7D8490" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau alamat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.totalText}>
              <span>Total:</span>
              <strong>{wargaList.length}</strong>
              <span>Warga Terdaftar</span>
            </div>
          </section>

          <div style={styles.actionRow}>
            <button
              style={styles.addButton}
              onClick={() => navigate('/admin/tambah-warga')}
            >
              <Plus size={24} />
              Tambah Warga
            </button>
          </div>

          <section style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: '70px' }}>No</th>
                  <th style={styles.th}>Nama Warga</th>
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
                      Memuat data warga...
                    </td>
                  </tr>
                ) : errorMessage ? (
                  <tr>
                    <td colSpan="6" style={styles.emptyCell}>
                      {errorMessage}
                    </td>
                  </tr>
                ) : paginatedWarga.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={styles.emptyCell}>
                      Data warga belum tersedia.
                    </td>
                  </tr>
                ) : (
                  paginatedWarga.map((warga, index) => (
                    <tr key={warga.userId} style={styles.tr}>
                      <td style={styles.td}>
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td style={styles.td}>{warga.nama || '-'}</td>
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

                          <button
                            style={styles.deleteButton}
                            onClick={() => handleDelete(warga.userId, warga.nama)}
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
          </section>

          <section style={styles.footerRow}>
            <p style={styles.showingText}>
              Menampilkan <strong>{startNumber} - {endNumber}</strong> dari {wargaList.length} warga
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
    width: '360px',
    height: '42px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #D8DFDE',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 14px',
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
    justifyContent: 'flex-end',
    marginBottom: '16px'
  },

  addButton: {
    width: '230px',
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

  tableCard: {
    borderRadius: '25px',
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
  }
};

export default UserManagement;