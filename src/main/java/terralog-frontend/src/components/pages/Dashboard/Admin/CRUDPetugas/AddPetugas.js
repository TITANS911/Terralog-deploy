import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { LayoutDashboard, FileText, MapPin, Users, Clock, MessageSquare, ArrowLeft } from 'lucide-react';
import AdminSidebar from '../../AdminSidebar';

const AddPetugas = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const userName = localStorage.getItem('nama') || 'Admin';

    const [formData, setFormData] = useState({
        nama: '',
        username: '',
        password: '',
        noHp: '',
        alamat: '',
        komplek: '',
        role: 'PETUGAS'
    });

    // --- LOGIKA FETCH DATA UNTUK AUTO-FILL ---
    useEffect(() => {
    if (isEdit) {
        console.log("Sedang mengambil data untuk ID:", id); // Cek ID-nya muncul gak
        axios.get(`http://127.0.0.1:8080/api/users/${id}`)
            .then(res => {
                console.log("Data dari Java:", res.data); // Cek isi datanya
                setFormData({
                    nama: res.data.nama || '',
                    username: res.data.username || '',
                    noHp: res.data.no_hp || res.data.noHp || '', 
                    alamat: res.data.alamat || '',
                    komplek: res.data.komplek || '',
                    role: res.data.role || 'PETUGAS',
                    password: ''
                });
            })
            .catch(err => {
                // Ini bakal kasih tau di console kenapa dia gagal (404, 500, atau 400)
                console.error("Detail Error Axios:", err.response); 
                Swal.fire('Error', `Gagal memuat data: ${err.response?.status || 'Server Mati'}`, 'error');
            });
    }
}, [id, isEdit]);

    const menuItems = [
        { id: 'dash', icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin/dashboard' },
        { id: 'lap', icon: <FileText size={20} />, label: 'Laporan Sampah', path: '/admin/laporan' },
        { id: 'peta', icon: <MapPin size={20} />, label: 'Peta Wilayah', path: '/admin/peta' },
        { id: 'peng', icon: <Users size={20} />, label: 'Pengguna', path: '/admin/pengguna' },
        { id: 'jad', icon: <Clock size={20} />, label: 'Jadwal Pengangkutan', path: '/admin/jadwal' },
        { id: 'adu', icon: <MessageSquare size={20} />, label: 'Pengaduan', path: '/admin/pengaduan' },
    ];

    // --- LOGIKA SUBMIT (POST & PUT) ---
    const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Pastikan key yang dikirim ke Backend konsisten
    const payload = {
        nama: formData.nama,
        username: formData.username,
        noHp: formData.noHp, // UBAH dari no_hp menjadi noHp
        alamat: formData.alamat,
        komplek: formData.komplek,
        role: formData.role
    };

    if (formData.password) {
        payload.password = formData.password;
    }

        try {
            if (isEdit) {
                // Gunakan PUT untuk update
                await axios.put(`http://127.0.0.1:8080/api/users/${id}`, payload);
                Swal.fire('Berhasil!', 'Data petugas diperbarui', 'success');
            } else {
                // Gunakan POST untuk tambah baru
                await axios.post('http://127.0.0.1:8080/api/users', payload);
                Swal.fire('Berhasil!', 'Petugas baru ditambahkan', 'success');
            }
            navigate('/admin/pengguna');
        } catch (error) {
            console.error("Error detail:", error.response?.data);
            Swal.fire('Gagal!', 'Terjadi kesalahan sistem atau format data salah', 'error');
        }
    };

    return (
        <div style={styles.container}>
            <AdminSidebar activeMenu="petugas" />

            <div style={styles.mainContent}>
                <div style={styles.whiteCanvas}>
                    <header style={styles.header}>
                       <button onClick={() => navigate(-1)} style={styles.backBtn}>
                           <ArrowLeft size={18} /> Kembali ke List
                       </button>
                        <h1 style={styles.title}>Tambah Petugas Baru</h1>
                    </header>
        

                    <div style={styles.formOuterBox}>
                    
                        <form onSubmit={handleSubmit} style={styles.formElement}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Nama Lengkap</label>
                                <input type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} required style={styles.inputField} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Username</label>
                                <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required style={styles.inputField} />
                            </div>
                        
                            {/* Password hanya required kalau sedang TAMBAH baru */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Password {isEdit && <span style={{fontSize: '11px', color: 'gray'}}>(Kosongkan jika tidak ingin ganti)</span>}</label>
                                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!isEdit} style={styles.inputField} />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>No. HP</label>
                                <input 
                                    type="text" 
                                    name="noHp" // Tambahkan ini
                                    value={formData.noHp} 
                                    onChange={e => setFormData({...formData, noHp: e.target.value})} 
                                    style={styles.inputField} 
                                />
                            </div>
                            
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Alamat Detail</label>
                                <textarea value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} style={{...styles.inputField, height: '80px'}} />
                            </div>

                            <button type="submit" style={styles.submitButton}>
                                {isEdit ? 'Simpan Perubahan' : 'Tambahkan Petugas'}
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

export default AddPetugas;