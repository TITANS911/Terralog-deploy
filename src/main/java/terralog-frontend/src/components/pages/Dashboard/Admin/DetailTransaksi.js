import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import AdminSidebar from '../AdminSidebar';

const DetailTransaksi = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        // Panggil berdasarkan transaksiId
        const response = await axios.get(`http://127.0.0.1:8080/api/transaksi/${id}`);
        setData(response.data);
      } catch (error) {
        console.error("Gagal ambil detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <div>Memuat...</div>;
  if (!data) return <div>Data tidak ditemukan!</div>;

  return (
    <div style={styles.container}>
      <AdminSidebar activeMenu='transaksi' />

      <div style={styles.mainContent}>
        <div style={styles.whiteCanvas}>
          <header style={styles.header}>
            <button style={styles.backBtn} onClick={() => navigate(-1)}><ArrowLeft /> Kembali</button>
            <h2>Detail Transaksi #{data.transaksiId}</h2> 
          </header>
      
      <div style={styles.formOuterBox}>
        
        <div style={styles.formElement}>
          {/* Foto dari folder uploads */}
          <div style={styles.imageContainer}>
            <img 
              src={`http://127.0.0.1:8080/uploads/${data.foto}`} 
              alt="Foto Sampah" 
              style={styles.image}
              onError={(e) => e.target.src = '/placeholder.jpg'}
            />
          </div>
          
          <div style={styles.formGroup}>
            <p><strong>Warga:</strong> {data.user?.nama || 'N/A'}</p>
            <p><strong>Petugas:</strong> {data.petugas?.nama || 'Belum ditugaskan'}</p>
            <p><strong>Tanggal:</strong> {data.tanggal}</p>
            <p><strong>Lokasi:</strong> {data.lokasi || '-'}</p>
            <p><strong>Kategori:</strong> {data.kategoriSampah || 'Kategori tidak tersedia'}</p>
            <p><strong>Total Berat:</strong> {data.totalBerat || '0'} Kg</p>
          </div>
        </div>
      </div>
      </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', backgroundColor: '#064D36', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
    mainContent: { marginLeft: '260px', flex: 1, padding: '25px', display: 'flex' },
    whiteCanvas: { backgroundColor: '#FFFFFF', flex: 1, borderRadius: '32px', padding: '40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },
    header: { marginBottom: '25px' },
    backBtn: { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#064D36', fontWeight: '600', marginBottom: '10px' },
    title: { fontSize: '32px', fontWeight: '700', color: '#111', margin: 0 },
    formOuterBox: { backgroundColor: '#F4F6F5', borderRadius: '24px', padding: '35px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    formElement: { width: '100%', maxWidth: '850px', display: 'flex', flexDirection: 'column', gap: '20px' },
    formGroup: { display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: '15px' },
    label: { fontSize: '14px', fontWeight: '700', color: '#111' },
    inputField: { backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 18px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
    submitButton: { backgroundColor: '#064D36', color: '#FFFFFF', border: 'none', borderRadius: '14px', padding: '14px 0', fontSize: '15px', fontWeight: '700', cursor: 'pointer', width: '100%', marginTop: '15px' },
    imageContainer: {
    width: '300px', // Set ukuran fixed
    height: '300px', // Set ukuran fixed (menjadi persegi)
    margin: '0 auto 20px auto', // Di tengah
    overflow: 'hidden',
    borderRadius: '10px',
    backgroundColor: '#eee' // Kasih background abu jika foto aslinya tidak penuh
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' // <--- PENTING: Akan memotong (crop) sisi foto agar persegi penuh
  }
};

export default DetailTransaksi;