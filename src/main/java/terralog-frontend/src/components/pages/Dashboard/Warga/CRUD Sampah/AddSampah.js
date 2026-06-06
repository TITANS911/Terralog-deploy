import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin } from 'lucide-react';
import WargaSidebar from '../../WargaSidebar';

const AddSampah = () => {
  const navigate = useNavigate();
  
  // Cek kelengkapan profil
  const userAlamat = localStorage.getItem('alamat') || '';
  const userNoHp = localStorage.getItem('noHp') || '';
  const isProfileComplete = userAlamat.trim() !== '' && userNoHp.trim() !== '';
  
  // 1. State untuk Form
  const [formData, setFormData] = useState({
    namaSampah: '',
    idKategori: '', // Ini akan menampung ID dari dropdown
    berat: '',
    deskripsi: '',
    tanggalInput: new Date().toISOString().split('T')[0]
  });

  // 2. State untuk menampung list kategori dari DB
  const [categories, setCategories] = useState([]);

  // Cek kelengkapan profil saat halaman dimuat
  useEffect(() => {
    if (!isProfileComplete) {
      Swal.fire({
        title: 'Profil Belum Lengkap!',
        html: '<p>Anda harus melengkapi <strong>alamat</strong> dan <strong>nomor HP</strong> terlebih dahulu sebelum dapat membuang sampah.</p>',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#064D36',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Lengkapi Profil',
        cancelButtonText: 'Kembali'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/profil-warga');
        } else {
          navigate(-1);
        }
      });
    }
  }, [isProfileComplete, navigate]);

  // Fetch kategori saat halaman dibuka
  useEffect(() => {
    const fetchKategori = async () => {
      if (!isProfileComplete) return;
      try {
        const res = await axios.get('http://127.0.0.1:8080/api/kategori');
        console.log("Data Kategori dari Backend:", res.data);
        setCategories(res.data);
      } catch (err) {
        console.error("Gagal ambil kategori:", err);
      }
    };
    fetchKategori();
  }, [isProfileComplete]);

  // Handle perubahan input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const currentUserId = localStorage.getItem('userId'); 
    const { namaSampah, berat, idKategori, deskripsi } = formData;
    const nilaiBerat = parseFloat(berat) || 0.0;

    // 1. Validasi
    if (!idKategori) {
      Swal.fire('Error', 'Pilih kategori terlebih dahulu!', 'error');
      return;
    }

    // 2. Payload disesuaikan dengan struktur baru
    const payload = {
      userId: currentUserId ? parseInt(currentUserId) : null,
      namaSampah: namaSampah,
      deskripsi: deskripsi,
      berat: nilaiBerat,            // Cukup satu field 'berat' saja
      idKategori: parseInt(idKategori) // Kirim ID Kategori-nya saja!
    };

    console.log("Payload baru yang dikirim:", payload);

    try {
      // 3. Pastikan endpoint di backend sudah sesuai menerima struktur ini
      await axios.post('http://127.0.0.1:8080/api/waste', payload);
      
      Swal.fire({ title: 'Sukses!', text: 'Laporan berhasil dibuat', icon: 'success', timer: 1500 });
      navigate('/buang-sampah');
    } catch (error) {
      console.error("Detail Error:", error.response?.data);
      Swal.fire('Gagal!', 'Terjadi kesalahan.', 'error');
    }
  };

  // Jika profil belum lengkap, tampilkan pesan
  if (!isProfileComplete) {
    return (
      <div style={styles.container}>
        <WargaSidebar activeMenu="buang-sampah" />
        <div style={styles.mainContent}>
          <div style={styles.whiteCanvas}>
            <div style={styles.incompleteProfileContainer}>
              <div style={styles.incompleteIcon}>
                <User size={80} color="#064D36" />
              </div>
              <h2 style={styles.incompleteTitle}>Profil Anda Belum Lengkap!</h2>
              <p style={styles.incompleteText}>Untuk membuang sampah, Anda harus melengkapi:</p>
              <div style={styles.requiredFields}>
                <div style={styles.requiredItem}>
                  <MapPin size={24} color="#064D36" />
                  <span style={styles.requiredText}>Alamat Lengkap</span>
                </div>
                <div style={styles.requiredItem}>
                  <Phone size={24} color="#064D36" />
                  <span style={styles.requiredText}>Nomor HP</span>
                </div>
              </div>
              <button 
                onClick={() => navigate('/profil-warga')} 
                style={styles.completeProfileBtn}
              >
                Lengkapi Profil Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <WargaSidebar activeMenu="buang-sampah" />

      <div style={styles.mainContent}>
        <div style={styles.whiteCanvas}>
          <header style={styles.header}>
            <button onClick={() => navigate('/buang-sampah')} style={styles.backBtn}>
              <ArrowLeft size={20} /> Kembali
            </button>
            <h1 style={styles.title}>Tambah Sampah</h1>
          </header>

          <div style={styles.formOuterBox}>
            <form onSubmit={handleSubmit} style={styles.formElement}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nama Sampah</label>
                <input 
                  type="text" 
                  name="namaSampah"
                  value={formData.namaSampah}
                  onChange={handleChange}
                  style={styles.inputField} 
                  placeholder="Misal: Botol Plastik Bekas" 
                  required 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Kategori</label>
                <select 
                  name="idKategori" 
                  value={formData.idKategori}
                  onChange={handleChange}
                  style={styles.inputField} 
                  required
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories && categories.length > 0 ? (
                    categories.map((cat) => (
                      <option key={cat.idKategori} value={cat.idKategori}>
                        {cat.namaKategori}
                      </option>
                    ))
                  ) : (
                    <option disabled>Memuat kategori...</option>
                  )}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Berat (kg)</label>
                <input 
                  type="number" 
                  name="berat"
                  value={formData.berat}
                  onChange={handleChange}
                  style={styles.inputField} 
                  placeholder="Contoh: 5" 
                  required 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Deskripsi</label>
                <textarea 
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  style={{...styles.inputField, height: '80px', resize: 'none'}} 
                  placeholder="Tambahkan catatan tambahan..."
                ></textarea>
              </div>

              <button type="submit" style={styles.submitButton}>
                Simpan
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', backgroundColor: '#064D36', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" },
  mainContent: { marginLeft: '270px', flex: 1, padding: '24px 24px 24px 0', display: 'flex' },
  whiteCanvas: { backgroundColor: '#FFFFFF', flex: 1, borderRadius: '38px', padding: '40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },
  header: { marginBottom: '25px' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#064D36', fontWeight: '600', marginBottom: '10px' },
  title: { fontSize: '32px', fontWeight: '700', color: '#111', margin: 0 },
  formOuterBox: { backgroundColor: '#F4F6F5', borderRadius: '24px', padding: '35px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  formElement: { width: '100%', maxWidth: '850px', display: 'flex', flexDirection: 'column', gap: '20px' },
  formGroup: { display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: '15px' },
  label: { fontSize: '14px', fontWeight: '700', color: '#111' },
  inputField: { backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 18px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: "'Poppins', sans-serif" },
  submitButton: { backgroundColor: '#064D36', color: '#FFFFFF', border: 'none', borderRadius: '14px', padding: '14px 0', fontSize: '15px', fontWeight: '700', cursor: 'pointer', width: '100%', marginTop: '15px', fontFamily: "'Poppins', sans-serif" },
  incompleteProfileContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '60vh', 
    textAlign: 'center',
    padding: '40px'
  },
  incompleteIcon: { 
    width: '120px', 
    height: '120px', 
    backgroundColor: '#F3F8F6', 
    borderRadius: '50%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: '30px'
  },
  incompleteTitle: { 
    fontSize: '28px', 
    fontWeight: '800', 
    color: '#111', 
    margin: '0 0 10px 0' 
  },
  incompleteText: { 
    fontSize: '16px', 
    color: '#666', 
    margin: '0 0 30px 0' 
  },
  requiredFields: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '15px', 
    marginBottom: '40px'
  },
  requiredItem: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    padding: '12px 24px', 
    backgroundColor: '#FFF3CD', 
    borderRadius: '12px',
    border: '1px solid #FFC107'
  },
  requiredText: { 
    fontSize: '15px', 
    fontWeight: '600', 
    color: '#856404'
  },
  completeProfileBtn: { 
    backgroundColor: '#064D36', 
    color: '#FFFFFF', 
    border: 'none', 
    borderRadius: '14px', 
    padding: '16px 40px', 
    fontSize: '16px', 
    fontWeight: '700', 
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  }
};

export default AddSampah;