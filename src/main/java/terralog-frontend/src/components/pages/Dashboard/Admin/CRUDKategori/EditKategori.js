import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { LayoutDashboard, Users, ArrowLeft, Tag } from 'lucide-react';
import AdminSidebar from '../../AdminSidebar';

// ... (bagian atas kode tetap sama)

const EditKategori = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Pastikan variabelnya adalah 'id' sesuai Route

    const [formData, setFormData] = useState({
        namaKategori: ''
    });

    // --- FETCH DATA LAMA (AUTO-FILL) ---
   // --- FETCH DATA LAMA ---
useEffect(() => {
    const loadKategori = async () => {
        try {
            const res = await axios.get(`http://127.0.0.1:8080/api/kategori/${id}`);
            if (res.data) {
                setFormData({
                    // Tambahkan idKategori ke dalam state agar sinkron dengan model Java
                    idKategori: res.data.idKategori, 
                    namaKategori: res.data.namaKategori || ''
                });
            }
        } catch (err) {
            console.error("Gagal load data kategori:", err);
            Swal.fire('Error', 'Data kategori tidak ditemukan!', 'error');
        }
    };

    if (id && id !== "undefined") {
        loadKategori();
    }
}, [id]);

// --- LOGIKA UPDATE ---
const handleUpdate = async (e) => {
    e.preventDefault();
    try {
        // Kirim formData yang sekarang sudah berisi {idKategori, namaKategori}
        await axios.put(`http://127.0.0.1:8080/api/kategori/${id}`, formData);
        
        Swal.fire({
            title: 'Berhasil!',
            text: 'Nama kategori telah diperbarui',
            icon: 'success',
            confirmButtonColor: '#1b4332'
        });
        navigate('/admin/sampah'); 
    } catch (error) {
        console.error("Gagal Update:", error.response?.data);
        Swal.fire('Gagal!', 'Terjadi kesalahan saat memperbarui data', 'error');
    }
};

    // ... (sisa kode return dan styles tetap sama)

    // ... (menuItems dan Return tetap sama seperti kode kamu)
    const menuItems = [
        { id: 'dash', icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin/dashboard' },
        { id: 'peng', icon: <Users size={20} />, label: 'Pengguna', path: '/admin/pengguna' },
        { id: 'kat', icon: <Tag size={20} />, label: 'Kategori Sampah', path: '/admin/kategori' },
    ];

    return (
        <div style={styles.container}>
            <AdminSidebar activeMenu='sampah' />
            <div style={styles.mainContent}>
                <div style={styles.whiteCanvas}>
                    <header style={styles.header}>
                        <button onClick={() => navigate(-1)} style={styles.backBtn}>
                            <ArrowLeft size={18} /> Kembali ke List
                        </button>
                        <h1>Edit Kategori Sampah</h1>
                        <p style={{color: 'gray', marginBottom: '25px', fontSize: '14px'}}>ID Kategori: {id}</p>
                    </header>

                    <div style={styles.formOuterBox}>
                        <form onSubmit={handleUpdate} style={styles.formElement}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Nama Kategori</label>
                                <input 
                                    type="text" 
                                    placeholder="Masukkan nama kategori"
                                    value={formData.namaKategori} 
                                    onChange={e => setFormData({namaKategori: e.target.value})} 
                                    required 
                                    style={styles.inputField} 
                                />
                            </div>
                            <button type="submit" style={styles.submitButton}>Simpan Perubahan</button>
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
    submitButton: { backgroundColor: '#064D36', color: '#FFFFFF', border: 'none', borderRadius: '14px', padding: '14px 0', fontSize: '15px', fontWeight: '700', cursor: 'pointer', width: '100%', marginTop: '15px' },
};

export default EditKategori;