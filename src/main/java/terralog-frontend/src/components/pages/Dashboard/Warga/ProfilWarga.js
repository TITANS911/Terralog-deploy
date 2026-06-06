import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, Mail, UserCircle } from 'lucide-react';
import WargaSidebar from '../WargaSidebar';

const ProfilWarga = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('nama') || 'Warga';
  const now = new Date();

  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    email: '',
    noHp: '',
    alamat: '',
    role: 'WARGA'
  });

  // Fetch data user dari server
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      
      try {
        setFetchLoading(true);
        const res = await axios.get(`http://127.0.0.1:8080/api/users/${userId}`);
        const data = res.data;
        
        setFormData({
          nama: data.nama || '',
          username: data.username || '',
          email: data.email || '',
          noHp: data.noHp || data.no_hp || '',
          alamat: data.alamat || '',
          role: data.role || 'WARGA'
        });
      } catch (err) {
        console.error("Gagal memuat data pengguna:", err);
        Swal.fire('Error', 'Gagal memuat data profil.', 'error');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit Update Profil
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData };
      // Hapus password karena tidak diubah di halaman profil
      delete payload.password;
      
      console.log("Updating profile with payload:", payload);
      console.log("User ID:", userId);

      const response = await axios.put(`http://127.0.0.1:8080/api/users/${userId}`, payload);
      console.log("Server response:", response.data);

      // Update localStorage juga
      localStorage.setItem('nama', formData.nama);
      localStorage.setItem('alamat', formData.alamat);
      localStorage.setItem('noHp', formData.noHp);
      localStorage.setItem('username', formData.username);
      localStorage.setItem('email', formData.email);
      
      Swal.fire({
        title: 'Berhasil!',
        text: 'Profil Anda telah diperbarui',
        icon: 'success',
        confirmButtonColor: '#064D36'
      });

    } catch (error) {
      console.error("Error Detail:", error);
      Swal.fire('Gagal!', 'Terjadi kesalahan saat memperbarui profil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const todayDisplay = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  if (fetchLoading) {
    return (
      <div style={styles.container}>
        <WargaSidebar activeMenu="profil" />
        <main style={styles.mainContent}>
          <div style={styles.whiteCanvas}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Memuat data profil...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <WargaSidebar activeMenu="profil" />
      
      <main style={styles.mainContent}>
        <div style={styles.whiteCanvas}>
          <section style={styles.header}>
            <div>
              <h1 style={styles.pageTitle}>Profil Saya</h1>
              <p style={styles.subtitle}>Kelola informasi profil Anda, {userName}.</p>
            </div>
            <div style={styles.headerRight}>
              <div style={styles.datePill}>{todayDisplay}</div>
            </div>        
          </section>

          <div style={styles.profileCard}>
            {/* Avatar & Info Singkat */}
            <div style={styles.profileHeader}>
              <div style={styles.avatar}>
                <UserCircle size={80} color="#064D36" />
              </div>
              <div style={styles.profileInfo}>
                <h2 style={styles.profileName}>{formData.nama || 'Nama Pengguna'}</h2>
                <p style={styles.profileEmail}>
                  <Mail size={16} style={{ marginRight: '8px' }} />
                  {formData.email || 'email@example.com'}
                </p>
                <p style={styles.profileUsername}>@{formData.username || 'username'}</p>
              </div>
            </div>

            {/* Form Edit Profil */}
            <div style={styles.formOuterBox}>
              <form onSubmit={handleSubmit} style={styles.formElement}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <User size={16} style={{ marginRight: '8px' }} />
                    Nama Lengkap
                  </label>
                  <input type="text" name="nama" value={formData.nama} onChange={handleChange} style={styles.inputField} required />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Username</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} style={styles.inputField} />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} style={styles.inputField}/>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <Phone size={16} style={{ marginRight: '8px' }} />
                    No. HP
                  </label>
                  <input type="text" name="noHp" value={formData.noHp} onChange={handleChange} style={styles.inputField} placeholder="08xxxxxxxxxx" />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <MapPin size={16} style={{ marginRight: '8px' }} />
                    Alamat
                  </label>
                  <textarea name="alamat" value={formData.alamat} onChange={handleChange} style={{...styles.inputField, height: '100px', resize: 'none'}} placeholder="Masukkan alamat lengkap Anda" />
                </div>



                <div style={styles.buttonGroup}>
                  <button type="button" onClick={() => navigate(-1)} style={styles.cancelButton}>
                    <ArrowLeft size={16} style={{ marginRight: '8px' }} />
                    Kembali
                  </button>
                  <button type="submit" disabled={loading} style={styles.submitButton}>
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: { display: 'flex', backgroundColor: '#064D36', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" },
  mainContent: { marginLeft: '270px', flex: 1, padding: '25px', display: 'flex' },
  whiteCanvas: { backgroundColor: '#FFFFFF', flex: 1, borderRadius: '38px', padding: '40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },

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

  profileCard: {
    borderRadius: '22px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    border: '1px solid #D5D5D5'
  },

  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '32px 40px',
    borderBottom: '1px solid #D5D5D5',
    backgroundColor: '#F3F8F6'
  },

  avatar: {
    width: '100px',
    height: '100px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },

  profileInfo: {
    flex: 1
  },

  profileName: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111',
    margin: '0 0 8px 0'
  },

  profileEmail: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 4px 0',
    display: 'flex',
    alignItems: 'center'
  },

  profileUsername: {
    fontSize: '14px',
    color: '#888',
    margin: 0
  },

  formOuterBox: {
    padding: '35px 40px'
  },

  formElement: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },

  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },

  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  label: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#111',
    display: 'flex',
    alignItems: 'center'
  },

  inputField: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '12px 18px',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: '0.2s ease',
    '&:focus': {
      borderColor: '#064D36',
      boxShadow: '0 0 0 3px rgba(6, 77, 54, 0.1)'
    }
  },

  buttonGroup: {
    display: 'flex',
    gap: '16px',
    marginTop: '16px'
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    color: '#666',
    border: 'none',
    borderRadius: '14px',
    padding: '14px 0',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: '0.2s ease',
    '&:hover': {
      backgroundColor: '#e0e0e0'
    }
  },

  submitButton: {
    flex: 1,
    backgroundColor: '#064D36',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '14px',
    padding: '14px 0',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: '0.2s ease',
    '&:hover': {
      backgroundColor: '#086b49'
    },
    '&:disabled': {
      backgroundColor: '#888',
      cursor: 'not-allowed'
    }
  }
};

export default ProfilWarga;
