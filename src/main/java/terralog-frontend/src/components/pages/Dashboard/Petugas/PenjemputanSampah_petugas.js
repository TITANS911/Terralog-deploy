import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios'; 
import PetugasSidebar from '../PetugasSidebar'; 
import { Search, Home, ShoppingBag } from 'lucide-react';


// 1. Mengubah format string tanggal (YYYY-MM-DD) menjadi nama Hari
const getNamaHari = (dateString) => {
  if (!dateString) return '-';
  const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const date = new Date(dateString);
  return hari[date.getDay()];
};

// 2. Mengecek apakah tanggal tugas dari API bertepatan dengan hari ini
const checkIfToday = (dateString) => {
  if (!dateString) return false;
  const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
  return dateString === today;
};

// 3. Menentukan warna badge berdasarkan teks isi Keterangan API
const getBadgeStyle = (keterangan) => {
  const teks = keterangan?.toLowerCase() || '';
  if (teks.includes('selesai')) {
    return { color: '#E8F5E9', textColor: '#2E7D32', icon: '✓ ' }; // Hijau
  } else if (teks.includes('berjalan') || teks.includes('proses')) {
    return { color: '#E8EAF6', textColor: '#3F51B5', icon: '🚚 ' }; // Biru / Ungu
  } else {
    return { color: '#F5F5F5', textColor: '#757575', icon: '🕒 ' }; // Abu-abu default
  }
};

const PenjemputanSampahPetugas = () => {
  // State untuk menyimpan data dinamis dari API jadwal
  const [dataJadwal, setDataJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ruteData, setRuteData] = useState([]);
  const [jadwalList, setJadwalList] = useState([]);
  const now = new Date();
  const today = new Date().toISOString().split('T')[0]; 

  // Helper yang lebih aman untuk penanganan Tanggal
  const getNamaHari = (dateString) => {
    // Menambahkan 'T00:00:00' agar tidak bergeser karena timezone
    const date = new Date(dateString + 'T00:00:00');
    return new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(date);
  };

  // Fetch data terpusat
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:8080/api/jadwal');
        setJadwalList(response.data);
      } catch (err) {
        console.error('Gagal mengambil data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Kamu bisa memfilter data langsung di sini untuk kebutuhan tampilan
const jadwalHariIni = useMemo(() => {
  const today = new Date().toISOString().split('T')[0]; // Format: 2026-05-29
  
  return jadwalList.filter((item) => {
    // Pastikan item.tanggalTugas ada
    if (!item.tanggalTugas) return false;
    
    // Ambil 10 karakter pertama dari tanggal API untuk mendapatkan YYYY-MM-DD
    // Ini mengabaikan jam (HH:mm:ss) jika ada di data Anda
    const tanggalAPI = item.tanggalTugas.substring(0, 10);
    
    return tanggalAPI === today;
  });
}, [jadwalList]);

  // Menghitung data secara otomatis berdasarkan jadwalList
const stats = useMemo(() => {
  // 1. Dapatkan tanggal hari ini (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  
  // 2. Filter jadwal hanya untuk hari ini
  const todayTasks = jadwalList.filter(item => item.tanggalTugas === today);
  const totalRumah = todayTasks.length;

  // 4. Estimasi Berat = Asumsi 5kg per alamat/titik penjemputan
  const totalBerat = totalRumah * 2; 

  return { totalRumah, totalBerat };
}, [jadwalList]);

  const todayDisplay = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });


  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <PetugasSidebar activeMenu="penjemputan" />

      {/* MAIN CONTENT AREA */}
      <div style={styles.mainContent}>
        <div style={styles.whiteCanvas}>
          
          {/* HEADER SECTION */}
          <section style={styles.header}>
            <div>
              <h1 style={styles.pageTitle}>Penjemputan Sampah</h1>
              <p style={styles.subtitle}>Pantau jadwal dan lokasi penjemputan sampah.</p>
            </div>

            <div style={styles.headerRight}>
              <div style={styles.datePill}>{todayDisplay}</div>
            </div>        
          </section>

          {/* GRID CONTENT */}
          <div style={styles.gridContainer}>
            
            {/* LEFT COLUMN: Rute Penjemputan & Ringkasan */}
            <div style={styles.leftColumn}>
              <div style={styles.leftColumn}>
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

              <div style={styles.infoCardDark}>
                <div>
                  <p style={styles.infoLabelText}>Target Hari Ini</p>
                  <p style={styles.infoValueText}>
                    {stats.totalRumah} <span style={{ fontSize: '16px', fontWeight: 'normal' }}>Rumah</span>
                  </p>
                </div>
                <div style={styles.infoIconBoxDark}>
                  <Home size={20} color="#fff" />
                </div>
              </div>

              {/* Card Estimasi Berat */}
              <div style={styles.infoCardGreen}>
                <div>
                  <p style={styles.infoLabelText}>Est. Berat Sampah</p>
                  <p style={styles.infoValueText}>
                    {stats.totalBerat} <span style={{ fontSize: '16px', fontWeight: 'normal' }}>Kg</span>
                  </p>
                </div>
                <div style={styles.infoIconBoxGreen}>
                  <ShoppingBag size={20} color="#fff" />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Tabel Jadwal Penjemputan (Dinamis dari API) */}
            <div style={styles.rightColumn}>
              <div style={styles.jadwalCard}>
                <div style={styles.jadwalHeader}>
                  <h3 style={styles.sectionTitle}>
                    <span style={{ marginRight: '8px' }}>📅</span> Jadwal Penjemputan
                  </h3>
                  <span style={styles.weekBadge}>Minggu Ini</span>
                </div>

                {/* Table Layout Baru */}
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeadRow}>
                      <th style={{ ...styles.th, borderRadius: '8px 0 0 8px' }}>Hari</th>
                      <th style={styles.th}>Shift</th>
                      <th style={styles.th}>Alamat</th>
                      <th style={{ ...styles.th, borderRadius: '0 8px 8px 0' }}>Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jadwalList.map((item) => {
                      const namaHari = getNamaHari(item.tanggalTugas);
                      const isToday = checkIfToday(item.tanggalTugas);
                      const badgeStyle = getBadgeStyle(item.keterangan);

                      return (
                        <tr 
                          key={item.idJadwal} 
                          style={{
                            ...styles.tableRow,
                            backgroundColor: isToday ? '#F1F9F5' : 'transparent'
                          }}
                        >
                          {/* Kolom Hari & Indikator Hari Ini */}
                          <td style={{ 
                            ...styles.td, 
                            fontWeight: isToday ? 'bold' : 'normal', 
                            color: isToday ? '#064D36' : '#333' 
                          }}>
                            {namaHari} 
                            {isToday && (
                              <span style={{ display: 'block', fontSize: '10px', fontWeight: 'normal', color: '#666' }}>
                                (Hari Ini)
                              </span>
                            )}
                          </td>
                          
                          {/* Kolom Shift */}
                          <td style={styles.td}>{item.shift || '-'}</td>
                          
                          {/* Kolom Alamat / Lokasi */}
                          <td style={styles.td}>{item.lokasiTugas || '-'}</td>
                          
                          {/* Kolom Keterangan */}
                          <td style={styles.td}>
                            {item.keterangan ? (
                              <span style={{
                                ...styles.statusBadge,
                                backgroundColor: badgeStyle.color,
                                color: badgeStyle.textColor
                              }}>
              
                                {item.keterangan}
                              </span>
                            ) : (
                              <span style={{ color: '#999', fontSize: '12px' }}>-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Fallback info jika data API masih kosong */}
                    {jadwalList.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ ...styles.td, textAlign: 'center', color: '#999' }}>
                          Sedang memuat data jadwal...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

// Style Mapping tetap presisi bawaan kode awal
const styles = {
  container: { display: 'flex', backgroundColor: '#064D36', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" },
  mainContent: { marginLeft: '270px', flex: 1, padding: '25px', display: 'flex' },
  whiteCanvas: { backgroundColor: '#FFFFFF', flex: 1, borderRadius: '32px', padding: '40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },
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
  searchContainer: { display: 'flex', alignItems: 'center', backgroundColor: '#064D36', borderRadius: '25px', padding: '6px 15px', width: '240px' },
  searchInput: { border: 'none', backgroundColor: 'transparent', color: '#fff', outline: 'none', fontSize: '13px', width: '100%' },
  iconCircle: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  gridContainer: { display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '30px', flex: 1 },
  leftColumn: { display: 'flex', flexDirection: 'column', gap: '20px' },
  ruteCard: { backgroundColor: '#F8F9FA', borderRadius: '20px', padding: '20px', border: '1px solid #EAEAEA' },
  sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#064D36', margin: '0 0 15px 0', display: 'flex', alignItems: 'center' },
  subSectionTitle: { fontSize: '11px', fontWeight: '700', color: '#999', letterSpacing: '1px', margin: '0 0 20px 0' },
  timelineContainer: { display: 'flex', flexDirection: 'column' },
  timelineItem: { display: 'flex', gap: '15px' },
  timelineLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  timelineDot: { width: '12px', height: '12px', borderRadius: '50%', zIndex: 2 },
  timelineLine: { width: '0px', height: '45px' },
  timelineRight: { paddingBottom: '20px' },
  lokasiText: { fontSize: '13px', margin: 0 },
  detailText: { fontSize: '11px', color: '#888', margin: '2px 0 0 0' },
  infoCardDark: { backgroundColor: '#043424', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  infoCardGreen: { backgroundColor: '#10B981', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  infoLabelText: { fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0 },
  infoValueText: { fontSize: '24px', fontWeight: 'bold', color: '#fff', margin: '5px 0 0 0' },
  infoIconBoxDark: { backgroundColor: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '12px' },
  infoIconBoxGreen: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' },
  rightColumn: { backgroundColor: '#F8F9FA', borderRadius: '20px', padding: '25px', border: '1px solid #EAEAEA' },
  jadwalCard: { display: 'flex', flexDirection: 'column', height: '100%' },
  jadwalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  weekBadge: { backgroundColor: '#D1FAE5', color: '#065F46', fontSize: '11px', fontWeight: '600', padding: '5px 12px', borderRadius: '12px' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  tableHeadRow: { backgroundColor: '#064D36' },
  th: { color: '#fff', fontSize: '13px', fontWeight: '600', padding: '12px 15px' },
  tableRow: { borderBottom: '1px solid #EAEAEA' },
  td: { padding: '16px 15px', fontSize: '13px', color: '#444' },
  statusBadge: { fontSize: '11px', fontWeight: '600', padding: '4px 12px', borderRadius: '12px', display: 'inline-block' },

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

export default PenjemputanSampahPetugas;