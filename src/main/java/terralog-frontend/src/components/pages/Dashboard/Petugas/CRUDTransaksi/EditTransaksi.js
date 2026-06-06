import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Search, Upload, ArrowLeft } from 'lucide-react';
import PetugasSidebar from '../../PetugasSidebar'; 
import AdminSidebar from '../../AdminSidebar';

const EditTransaksi = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [wargaList, setWargaList] = useState([]); 
  const [kategoriList, setKategoriList] = useState([]);
  
  const petugasId = localStorage.getItem('userId') || ''; 
  const userRole = localStorage.getItem('user_role') || '';

  const [formData, setFormData] = useState({
    user_id: '',
    petugas_id: petugasId,
    tanggal: '',
    lokasi: '',
    foto: null,
    kategoriSampah: '',
    totalBerat: ''
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const [wargaRes, katRes] = await Promise.all([
          axios.get('http://127.0.0.1:8080/api/users'),
          axios.get('http://127.0.0.1:8080/api/kategori')
        ]);
        
        setWargaList(wargaRes.data.filter(u => u.role?.toUpperCase() === 'WARGA'));
        setKategoriList(katRes.data);

        if (id && id !== 'undefined') {
          const transRes = await axios.get(`http://127.0.0.1:8080/api/transaksi/${id}`);
          const data = transRes.data;

          setFormData({
            user_id: data.user?.userId || '',
            petugas_id: data.petugas?.userId || petugasId,
            tanggal: data.tanggal,
            lokasi: data.lokasi,
            foto: data.foto,
            kategoriSampah: data.kategoriSampah || '',
            totalBerat: data.totalBerat || ''
          });

          if (data.foto) {
            setImagePreview(`http://127.0.0.1:8080/uploads/${data.foto}`);
          }
        }
      } catch (err) {
        console.error("Gagal inisialisasi data:", err);
        Swal.fire('Error', 'Gagal memuat data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    initData();
  }, [id, petugasId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'user_id') {
      const wargaTerpilih = wargaList.find(warga => String(warga.userId) === String(value));
      
      setFormData((prev) => ({
        ...prev,
        user_id: value,
        lokasi: wargaTerpilih ? (wargaTerpilih.alamat || '') : prev.lokasi
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, foto: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalFileName = formData.foto;
      if (formData.foto instanceof File) {
        const data = new FormData();
        data.append('file', formData.foto);
        const uploadRes = await axios.post('http://127.0.0.1:8080/api/transaksi/upload', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalFileName = uploadRes.data;
      }

      const jsonPayload = {
        user: { userId: Number(formData.user_id) },
        petugas: { userId: Number(formData.petugas_id) },
        tanggal: formData.tanggal,
        lokasi: formData.lokasi,
        foto: finalFileName,
        kategoriSampah: formData.kategoriSampah,
        totalBerat: Number(formData.totalBerat)
      };

      await axios.put(`http://127.0.0.1:8080/api/transaksi/${id}`, jsonPayload, {
        headers: { 'Content-Type': 'application/json' }
      });

      Swal.fire({
        title: 'Berhasil!',
        text: 'Data transaksi telah diperbarui!',
        icon: 'success',
        confirmButtonColor: '#064D36'
      });

      // Cek role user untuk menentukan halaman tujuan
      const userRole = localStorage.getItem('user_role');
      if (userRole === 'ADMIN') {
        navigate('/admin/transaksi');
      } else {
        navigate('/petugas/transaksi');
      }
    } catch (error) {
      console.error("Error Detail:", error);
      Swal.fire('Gagal!', 'Terjadi kesalahan saat mengupdate data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {userRole === 'ADMIN' ? (
        <AdminSidebar activeMenu="transaksi" />
      ) : (
        <PetugasSidebar activeMenu="transaksi" />
      )}

      <div style={styles.mainContent}>
        <div style={styles.whiteCanvas}>
          
          <header style={styles.header}>
            <div>
              <button onClick={() => {
                const userRole = localStorage.getItem('user_role');
                if (userRole === 'ADMIN') {
                  navigate('/admin/transaksi');
                } else {
                  navigate('/petugas/transaksi');
                }
              }} style={styles.backBtn}>
                <ArrowLeft size={18} /> Kembali
              </button>
              <h1 style={styles.title}>Edit Transaksi</h1>
              <p style={styles.subtitle}>Input data transaksi ke database internal system.</p>
            </div>
          </header>

          <div style={styles.formOuterBox}>
            <h3 style={styles.formMainTitle}>Laporkan Pembuangan Sampah</h3>
            
            <form onSubmit={handleSubmit} style={styles.formElement}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Pilih Warga</label>
                  <div style={styles.selectWrapper}>
                    <select 
                      name="user_id"
                      value={formData.user_id}
                      onChange={handleChange}
                      style={styles.selectField}
                    >
                      <option value="">-- Pilih Warga --</option>
                      {wargaList.map((warga) => (
                        <option key={warga.userId} value={warga.userId}>
                          {warga.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                  
                {/* 2. Input Tanggal */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tanggal</label>
                  <input 
                    type="date" 
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleChange}
                    style={styles.inputField} 
                  />
                </div>
                  
                {/* 3. Input Lokasi */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Lokasi / Alamat</label>
                  <input 
                    type="text" 
                    name="lokasi"
                    value={formData.lokasi}
                    onChange={handleChange}
                    placeholder="Alamat warga akan muncul otomatis" 
                    style={styles.inputField} 
                  />
                </div>
              
                {/* Dropdown Kategori */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Kategori Sampah</label>
                  <select name="kategoriSampah" value={formData.kategoriSampah} onChange={handleChange} style={styles.selectField} required>
                    <option value="">-- Pilih Kategori --</option>
                    {kategoriList.map((kat) => (
                      <option key={kat.id} value={kat.namaKategori}>{kat.namaKategori}</option>
                    ))}
                  </select>
                </div>
                
                {/* Dropdown Waste (Berat) */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Total Berat (kg)</label>
                  <input 
                    type="number" 
                    name="totalBerat" 
                    value={formData.totalBerat} 
                    onChange={handleChange} 
                    placeholder="Contoh: 5" 
                    style={styles.inputField} 
                    required 
                  />
                </div>

                <div style={styles.formGroupUpload}>
                  <label style={styles.label}>Foto Sampah</label>

                  <div style={styles.uploadContainer}>
                    <label style={styles.uploadBox}>
                      <input 
                        type="file" 
                        accept="image/*"
                        name="foto"
                        onChange={handleFileChange}
                        style={{ display: 'none' }} 
                      />

                      {!imagePreview ? (
                        <div style={styles.emptyState}>
                          <Upload size={24} color="#064D36" style={{ marginBottom: '8px' }} />
                          <span style={styles.uploadText}>Pilih atau seret foto ke sini</span>
                        </div>
                      ) : (
                        <div style={styles.imageWrapper}>
                          <img src={imagePreview} alt="Preview Sampah" style={styles.previewImage} />
                        </div>
                      )}
                    </label>
                  
                    {imagePreview && (
                      <span style={styles.successText}>✓ Gambar terpilih</span>
                    )}
                  </div>
                </div>
              <button type="submit" disabled={loading} style={styles.submitButton}>
                {loading ? 'Menyimpan ke Database...' : 'Kirim'}
              </button>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', backgroundColor: '#064D36', minHeight: '100vh', fontFamily: "'Inter', sans-serif "},
  mainContent: { marginLeft: '260px', flex: 1, padding: '25px', display: 'flex' },
  whiteCanvas: { backgroundColor: '#FFFFFF', flex: 1, borderRadius: '32px', padding: '40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  title: { fontSize: '32px', fontWeight: '700', color: '#111', margin: 0 },
  subtitle: { fontSize: '14px', color: '#777', margin: '5px 0 0 0' },
  formOuterBox: { backgroundColor: '#F4F6F5', borderRadius: '24px', padding: '35px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  formMainTitle: { fontSize: '20px', fontWeight: '700', color: '#111', marginBottom: '30px', marginTop: 0 },
  formElement: { width: '100%', maxWidth: '850px', display: 'flex', flexDirection: 'column', gap: '20px' },
  formGroup: { display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center' },
  label: { fontSize: '14px', fontWeight: '700', color: '#111' },
  inputField: { backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 18px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
  selectWrapper: { position: 'relative', width: '100%' },
  selectField: { backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 18px', fontSize: '14px', outline: 'none', color: '#333', width: '100%', boxSizing: 'border-box', appearance: 'none', backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23064D36' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 18px center', backgroundSize: '16px' },
  submitButton: { backgroundColor: '#064D36', color: '#FFFFFF', border: 'none', borderRadius: '14px', padding: '14px 0', fontSize: '15px', fontWeight: '700', cursor: 'pointer', width: '100%', marginTop: '15px' },
  formGroupUpload: { display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'start', marginTop: '10px' },
  uploadContainer: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', width: '100%' },
  uploadBox: { width: '100%', height: '180px', backgroundColor: '#FFFFFF', border: '2px dashed #064D36', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxSizing: 'border-box', overflow: 'hidden', position: 'relative' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  uploadText: { fontSize: '14px', color: '#555', fontWeight: '500' },
  imageWrapper: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', boxSizing: 'border-box' },
  previewImage: { maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' },
  successText: { fontSize: '13px', color: '#2E7D32', fontWeight: '600', marginTop: '4px' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#064D36', fontWeight: '600', marginBottom: '10px' }
};

export default EditTransaksi;
