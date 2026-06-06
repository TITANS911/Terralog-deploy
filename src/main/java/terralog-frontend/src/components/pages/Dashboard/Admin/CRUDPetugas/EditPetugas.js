import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { LayoutDashboard, FileText, MapPin, Users, Clock, MessageSquare, ArrowLeft } from 'lucide-react';
import AdminSidebar from '../../AdminSidebar';

const EditPetugas = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Ambil ID dari URL
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

    // --- FETCH DATA LAMA (AUTO-FILL) ---
    useEffect(() => {
    const loadPetugas = async () => {
        try {
            console.log("Mengambil data untuk ID:", id); // Cek apakah ID-nya muncul
            const res = await axios.get(`http://127.0.0.1:8080/api/users/${id}`);
            console.log("Data mentah dari Java:", res.data); // Cek nama field di sini
            
            const data = res.data;
            setFormData({
                nama: data.nama || '',
                username: data.username || '',
                // Gunakan pencocokan fleksibel jika Java mengirim snake_case
                noHp: data.noHp || data.no_hp || '', 
                alamat: data.alamat || '',
                komplek: data.komplek || '',
                role: data.role || 'PETUGAS',
                password: '' 
            });
        } catch (err) {
            console.error("Gagal load data:", err);
            Swal.fire('Error', 'Data petugas tidak ditemukan!', 'error');
            navigate('/admin/pengguna');
        }
    };
    if (id && id !== "undefined") {
        loadPetugas();
    }
}, [id, navigate]);

    // --- LOGIKA UPDATE ---
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            // Payload disesuaikan dengan userModel.java kamu
            const payload = { ...formData };
            // Jangan kirim password kalau user tidak mengetik apa-apa
            if (!payload.password) delete payload.password;

            await axios.put(`http://127.0.0.1:8080/api/users/${id}`, payload);
            Swal.fire('Berhasil!', 'Data petugas telah diperbarui', 'success');
            navigate('/admin/pengguna');
        } catch (error) {
            console.error("Gagal Update:", error.response?.data);
            Swal.fire('Gagal!', 'Cek kembali koneksi atau format data', 'error');
        }
    };

    // Sidebar Items (Sama dengan UserManagement)
    const menuItems = [
        { id: 'dash', icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin/dashboard' },
        { id: 'lap', icon: <FileText size={20} />, label: 'Laporan Sampah', path: '/admin/laporan' },
        { id: 'peta', icon: <MapPin size={20} />, label: 'Peta Wilayah', path: '/admin/peta' },
        { id: 'peng', icon: <Users size={20} />, label: 'Pengguna', path: '/admin/pengguna' },
        { id: 'jad', icon: <Clock size={20} />, label: 'Jadwal Pengangkutan', path: '/admin/jadwal' },
        { id: 'adu', icon: <MessageSquare size={20} />, label: 'Pengaduan', path: '/admin/pengaduan' },
    ];

    return (
        <div style={styles.container}>
            <AdminSidebar activeMenu="petugas" />
            <div style={styles.mainContent}>
                <div style={styles.whiteCanvas}>
                    <header style={styles.header}>
                        <button onClick={() => navigate(-1)} style={styles.backBtn}>
                            <ArrowLeft size={18} /> Kembali ke List
                        </button>
                        <h1 style={styles.title}>Edit Petugas</h1>
                    </header>


                    <div style={styles.formOuterBox}>
                        <form onSubmit={handleUpdate} style={styles.formElement}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Nama Lengkap</label>
                                <input type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} required style={styles.inputField} />
                            </div>
                            
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Username</label>
                                <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required style={styles.inputField} />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Password <span style={{fontSize: '11px', color: 'gray'}}>(Kosongkan jika tidak ganti)</span></label>
                                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={styles.inputField} />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>No. HP</label>
                                <input type="text" value={formData.noHp} onChange={e => setFormData({...formData, noHp: e.target.value})} style={styles.inputField} />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Alamat Detail</label>
                                <textarea value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} style={{...styles.inputField, height: '80px'}} />
                            </div>

                            <button type="submit" style={styles.submitButton}>Update Data Petugas</button>
                        </form>
                    </div>
                </div>
            </div>  
        </div>
    );
};

// Copy styles dari UserManagement kamu agar tampilannya identik
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

export default EditPetugas;