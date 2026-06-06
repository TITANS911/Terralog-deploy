import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Search, Upload, ArrowLeft } from 'lucide-react';
import PetugasSidebar from '../../PetugasSidebar'; 

const AddTransaksi = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [wargaList, setWargaList] = useState([]); 
  const [kategoriList, setKategoriList] = useState([]);
  const [wasteList, setWasteList] = useState([]);
  
  // Ambil ID petugas yang sedang login dari localStorage
  const petugasId = localStorage.getItem('userId') || ''; 

  // State Form disesuaikan dengan struktur kolom database
  const [formData, setFormData] = useState({
    user_id: '',       // Menghubungkan ke warga_id (default kosong agar terfokus ke placeholder)
    petugas_id: petugasId, // Diisi otomatis dari session/localStorage petugas
    tanggal: '',       // Tipe DATE di database
    lokasi: '',        // Tipe VARCHAR(100) di database
    foto: null,
    kategoriSampah: '', // Baru
    totalBerat: ''         // Tipe VARCHAR(255) untuk file path/nama gambar
  });

  // State tambahan untuk preview gambar lokal sebelum diupload
  const [imagePreview, setImagePreview] = useState(null);

  // --- FETCH DATA WARGA UNTUK DROPDOWN (USER_ID) ---
  useEffect(() => {
    const fetchWarga = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8080/api/users');
        // Filter hanya user yang rolenya WARGA
        const hanyaWarga = response.data.filter(user => user.role?.toUpperCase() === 'WARGA');
        setWargaList(hanyaWarga);
      } catch (error) {
        console.error("Gagal memuat data warga:", error);
      }
    };
    fetchWarga();
  }, []);

  // Handle perubahan text/select input
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'user_id') {
      // Cari data warga yang terpilih berdasarkan userId-nya
      const wargaTerpilih = wargaList.find(warga => String(warga.userId) === String(value));
      
      setFormData((prev) => ({
        ...prev,
        user_id: value,
        // Jika warga ditemukan, otomatis set kolom lokasi dengan alamat si warga. Jika tidak, kosongkan.
        lokasi: wargaTerpilih ? (wargaTerpilih.alamat || '') : ''
      }));
    } else {
      // Untuk input selain user_id (seperti tanggal atau foto) tetap normal
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle input file gambar (Foto)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        foto: file
      }));
      setImagePreview(URL.createObjectURL(file)); // Membuat preview gambar temporer
    }
  };

  useEffect(() => {
  const fetchSupportingData = async () => {
    try {
      const [katRes] = await Promise.all([
        axios.get('http://127.0.0.1:8080/api/kategori'),
      ]);
      setKategoriList(katRes.data);
    } catch (err) {
      console.error("Gagal ambil data pendukung:", err);
    }
  };
  fetchSupportingData();
}, []);

  // --- SUBMIT DATA KE DATABASE ---
  // Ganti bagian catch di handleSubmit di AddTransaksi.js kamu
  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    let fileName = null;

    // 1. UPLOAD FOTO TERLEBIH DAHULU (Jika ada file yang dipilih)
    if (formData.foto instanceof File) {
      const data = new FormData();
      data.append('file', formData.foto);

      // Kirim file ke endpoint upload
      const uploadRes = await axios.post('http://127.0.0.1:8080/api/transaksi/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fileName = uploadRes.data; // Nama file yang sudah tersimpan di server
    } else {
      fileName = formData.foto; // Jika sudah berupa string nama file
    }

    // 2. KIRIM DATA TRANSAKSI
    const jsonPayload = {
      user: { userId: Number(formData.user_id) },
      petugas: { userId: Number(formData.petugas_id) },
      tanggal: formData.tanggal,
      lokasi: formData.lokasi,
      kategoriSampah: formData.kategoriSampah,
      totalBerat: Number(formData.totalBerat),
      foto: fileName // Gunakan nama file yang sudah di-upload
    };

    await axios.post('http://127.0.0.1:8080/api/transaksi', jsonPayload, {
      headers: { 'Content-Type': 'application/json' }
    });

    Swal.fire({
      title: 'Berhasil!',
      text: 'Data transaksi berhasil disimpan!',
      icon: 'success',
      confirmButtonColor: '#064D36'
    });

    navigate('/petugas/transaksi');
  } catch (error) {
    console.error("Error Detail:", error.response?.data || error.message);
    Swal.fire('Gagal!', 'Terjadi kesalahan sistem.', 'error');
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={styles.container}>
      <PetugasSidebar activeMenu="transaksi" />

      <div style={styles.mainContent}>
        <div style={styles.whiteCanvas}>
          
          <header style={styles.header}>
            <div>
                <button onClick={() => navigate(-1)} style={styles.backBtn}>
                    <ArrowLeft size={20} /> Kembali ke List
                </button>
              <h1 style={styles.title}>Tambah Transaksi</h1>
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
                      {/* OPSI DEFAULT: Memaksa user memilih agar tidak mengirimkan ID kosong ke backend */}
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
  container: { display: 'flex', backgroundColor: '#064D36', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  mainContent: { marginLeft: '260px', flex: 1, padding: '25px', display: 'flex' },
  whiteCanvas: { backgroundColor: '#FFFFFF', flex: 1, borderRadius: '32px', padding: '40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  title: { fontSize: '32px', fontWeight: '700', color: '#111', margin: 0 },
  subtitle: { fontSize: '14px', color: '#777', margin: '5px 0 0 0' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  topSearchContainer: { display: 'flex', alignItems: 'center', backgroundColor: '#064D36', borderRadius: '25px', padding: '6px 15px', width: '240px' },
  topSearchInput: { border: 'none', backgroundColor: 'transparent', color: '#fff', outline: 'none', fontSize: '13px', width: '100%' },
  iconCircle: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  formOuterBox: { backgroundColor: '#F4F6F5', borderRadius: '24px', padding: '35px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  formMainTitle: { fontSize: '20px', fontWeight: '700', color: '#111', marginBottom: '30px', marginTop: 0 },
  formElement: { width: '100%', maxWidth: '850px', display: 'flex', flexDirection: 'column', gap: '20px' },
  formGroup: { display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center' },
  formGroupTextArea: { display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'start' },
  label: { fontSize: '14px', fontWeight: '700', color: '#111' },
  inputField: { backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 18px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
  selectWrapper: { position: 'relative', width: '100%' },
  selectField: { backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 18px', fontSize: '14px', outline: 'none', color: '#333', width: '100%', boxSizing: 'border-box', appearance: 'none', backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23064D36' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 18px center', backgroundSize: '16px' },
  submitButton: { backgroundColor: '#064D36', color: '#FFFFFF', border: 'none', borderRadius: '14px', padding: '14px 0', fontSize: '15px', fontWeight: '700', cursor: 'pointer', width: '100%', marginTop: '15px' },

  formGroupUpload: {
    display: 'grid',
    gridTemplateColumns: '180px 1fr',
    alignItems: 'start',
    marginTop: '10px'
  },
  uploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
    width: '100%'
  },
  uploadBox: {
    width: '100%',
    height: '180px',
    backgroundColor: '#FFFFFF',
    border: '2px dashed #064D36',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxSizing: 'border-box',
    overflow: 'hidden',
    position: 'relative'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  uploadText: {
    fontSize: '14px',
    color: '#555',
    fontWeight: '500'
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    boxSizing: 'border-box'
  },
  previewImage: {
    maxHeight: '100%',
    maxWidth: '100%',
    objectFit: 'contain',
    borderRadius: '12px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
  },
  successText: {
    fontSize: '13px',
    color: '#2E7D32',
    fontWeight: '600',
    marginTop: '4px'
  },
  backBtn: { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#064D36', fontWeight: '600', marginBottom: '10px' },
};

export default AddTransaksi;
