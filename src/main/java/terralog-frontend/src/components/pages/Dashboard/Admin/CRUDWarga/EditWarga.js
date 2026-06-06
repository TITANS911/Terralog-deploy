import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ArrowLeft } from 'lucide-react';
import AdminSidebar from '../../AdminSidebar'; // Sesuaikan path

const EditWarga = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Ambil ID dari URL
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    password: '',
    noHp: '',
    alamat: '',
    role: 'WARGA'
  });

  // 1. Fetch data warga berdasarkan ID untuk keperluan edit
  useEffect(() => {
    const fetchWarga = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://127.0.0.1:8080/api/users/${id}`);
        const data = res.data;
        setFormData({
          nama: data.nama || '',
          username: data.username || '',
          password: '', // Password dikosongkan agar tidak overwrite kecuali diisi
          noHp: data.noHp || data.no_hp || '',
          alamat: data.alamat || '',
          role: data.role || 'WARGA'
        });
      } catch (err) {
        console.error("Gagal memuat data warga:", err);
        Swal.fire('Error', 'Gagal memuat data warga.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchWarga();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 2. Submit Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData };
      // Opsional: Hapus password jika field kosong agar tidak update password kosong
      if (!payload.password) delete payload.password;

      await axios.put(`http://127.0.0.1:8080/api/users/${id}`, payload);

      Swal.fire({
        title: 'Berhasil!',
        text: 'Data warga telah diperbarui.',
        icon: 'success',
        confirmButtonColor: '#064D36'
      });

      navigate('/petugas/warga'); // Sesuaikan dengan route tujuan Anda
    } catch (error) {
      console.error("Error Detail:", error);
      Swal.fire('Gagal!', 'Terjadi kesalahan saat mengupdate data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <AdminSidebar activeMenu="warga" />

      <div style={styles.mainContent}>
        <div style={styles.whiteCanvas}>
          <header style={styles.header}>
            <button onClick={() => navigate(-1)} style={styles.backBtn}>
              <ArrowLeft size={20} /> Kembali
            </button>
            <h1 style={styles.title}>Edit Data Warga</h1>
          </header>

          <div style={styles.formOuterBox}>
            <form onSubmit={handleSubmit} style={styles.formElement}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nama Lengkap</label>
                <input type="text" name="nama" value={formData.nama} onChange={handleChange} style={styles.inputField} required />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} style={styles.inputField} required />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Password (Kosongkan jika tetap)</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} style={styles.inputField} />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>No. HP</label>
                <input type="text" name="noHp" value={formData.noHp} onChange={handleChange} style={styles.inputField} />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Alamat</label>
                <textarea name="alamat" value={formData.alamat} onChange={handleChange} style={{...styles.inputField, height: '80px', resize: 'none'}} />
              </div>

              <button type="submit" disabled={loading} style={styles.submitButton}>
                {loading ? 'Menyimpan...' : 'Update Data'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Gunakan style yang sama dengan AddTransaksi agar konsisten
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
    submitButton: { backgroundColor: '#064D36', color: '#FFFFFF', border: 'none', borderRadius: '14px', padding: '14px 0', fontSize: '15px', fontWeight: '700', cursor: 'pointer', width: '100%', marginTop: '15px' }
};

export default EditWarga;