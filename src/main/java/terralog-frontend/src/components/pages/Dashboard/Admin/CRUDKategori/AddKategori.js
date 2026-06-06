import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { LayoutDashboard, FileText, MapPin, Users, Clock, MessageSquare, ArrowLeft, Tag } from 'lucide-react';
import AdminSidebar from '../../AdminSidebar';

const AddKategori = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    // State disesuaikan dengan Entity Kategori (namaKategori)
    const [formData, setFormData] = useState({
        namaKategori: ''
    });

    // --- LOGIKA FETCH DATA UNTUK EDIT ---
    useEffect(() => {
        if (isEdit) {
            axios.get(`http://localhost:8080/api/kategori/${id}`)
                .then(res => {
                    setFormData({
                        namaKategori: res.data.namaKategori || ''
                    });
                })
                .catch(err => {
                    console.error("Gagal mengambil data kategori:", err);
                    Swal.fire('Error', 'Data kategori tidak ditemukan', 'error');
                });
        }
    }, [id, isEdit]);

    const menuItems = [
        { id: 'dash', icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin/dashboard' },
        { id: 'peng', icon: <Users size={20} />, label: 'Pengguna', path: '/admin/pengguna' },
        { id: 'kat', icon: <Tag size={20} />, label: 'Kategori Sampah', path: '/admin/pengguna' }, // Asumsi kategori di halaman yang sama
    ];

    // --- LOGIKA SUBMIT ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (isEdit) {
                await axios.put(`http://localhost:8080/api/kategori/${id}`, formData);
                Swal.fire('Berhasil!', 'Kategori diperbarui', 'success');
            } else {
                await axios.post('http://localhost:8080/api/kategori', formData);
                Swal.fire('Berhasil!', 'Kategori baru ditambahkan', 'success');
            }
            navigate('/admin/sampah'); // Sesuaikan rute kembali kamu
        } catch (error) {
            console.error("Error:", error);
            Swal.fire('Gagal!', 'Terjadi kesalahan pada server', 'error');
        }
    };

    return (
        <div style={styles.container}>
            <AdminSidebar activeMenu='sampah' />

           <div style={styles.mainContent}>
           <div style={styles.whiteCanvas}>
           <header style={styles.header}>
                <button onClick={() => navigate(-1)} style={styles.backBtn}>
                    <ArrowLeft size={18} /> Kembali
                </button>
                <h1>Tambah Kategori</h1>
           </header>
        
            
                    <div style={styles.formOuterBox}>
                        <form onSubmit={handleSubmit} style={styles.formElement}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Nama Kategori</label>
                                <input 
                                    type="text" 
                                    placeholder="Contoh: Plastik, Organik, B3"
                                    value={formData.namaKategori} 
                                    onChange={e => setFormData({namaKategori: e.target.value})} 
                                    required 
                                    style={styles.inputField} 
                                />
                            </div>

                            <button type="submit" style={styles.submitButton}>
                                {isEdit ? 'Simpan Perubahan' : 'Tambahkan Kategori'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Styles tetap sama seperti yang kamu buat
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

// INI YANG PALING PENTING AGAR TIDAK ERROR "ELEMENT TYPE INVALID"
export default AddKategori;