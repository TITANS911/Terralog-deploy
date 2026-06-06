import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { LayoutDashboard, Users, Clock, ArrowLeft } from 'lucide-react';
import AdminSidebar from '../../AdminSidebar';

const AddJadwal = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    // State menggunakan format camelCase agar serasi dengan penamaan properti di Java/Spring Boot
    const [formData, setFormData] = useState({
        userId: '',          
        tanggalTugas: '',    
        shift: '',
        lokasiTugas: '',     
        keterangan: ''
    });

    const [listPetugas, setListPetugas] = useState([]);
    const [listWaste, setListWaste] = useState([]);

    // --- 1. LOGIKA FETCH DATA UNTUK EDIT ---
    useEffect(() => {
        if (isEdit) {
            axios.get(`http://localhost:8080/api/jadwal/${id}`)
                .then(res => {
                    // Cek dualisme properti jika dari backend masih ada yang bertipe snake_case
                    setFormData({
                        userId: res.data.userId || res.data.user_id || '',
                        tanggalTugas: res.data.tanggalTugas || res.data.tanggal_tugas || '',
                        shift: res.data.shift || '',
                        lokasiTugas: res.data.lokasiTugas || res.data.lokasi_tugas || '',
                        keterangan: res.data.keterangan || ''
                    });
                })
                .catch(err => {
                    console.error("Gagal mengambil data jadwal:", err);
                    Swal.fire('Error', 'Data jadwal tidak ditemukan', 'error');
                });
        }
    }, [id, isEdit]);

    // --- 2. LOGIKA FETCH DATA PETUGAS & WASTE ---
    useEffect(() => {
        axios.get('http://localhost:8080/api/users')
            .then(res => {
                setListPetugas(res.data);
            })
            .catch(err => {
                console.error("Gagal mengambil list petugas:", err);
            });

        axios.get('http://localhost:8080/api/waste')
            .then(res => {
                setListWaste(res.data);
            })
            .catch(err => {
                console.error("Gagal mengambil list data sampah:", err);
            });
    }, []);

    const menuItems = [
        { id: 'dash', icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin/dashboard' },
        { id: 'peng', icon: <Users size={20} />, label: 'Pengguna', path: '/admin/pengguna' },
        { id: 'jadwal', icon: <Clock size={20} />, label: 'Jadwal Petugas', path: '/admin/jadwal' }, 
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // --- LOGIKA AUTOFILL LOKASI DARI REQUEST SAMPAH ---
    const handleWasteChange = (e) => {
        const wasteId = e.target.value;
        if (!wasteId) {
            setFormData(prev => ({ ...prev, lokasiTugas: '' }));
            return;
        }

        const selectedWaste = listWaste.find(w => w.wasteId === parseInt(wasteId));
        
        if (selectedWaste && selectedWaste.user) {
            setFormData(prev => ({
                ...prev,
                lokasiTugas: selectedWaste.user.alamat || ''
            }));
        } else {
            setFormData(prev => ({ ...prev, lokasiTugas: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // PENTING: Struktur payload harus disesuaikan dengan Entity jadwalModel di Spring Boot
        const cleanPayload = {
            user: {
                userId: parseInt(formData.userId) // Memenuhi kebutuhan objek userModel di backend
            },
            tanggalTugas: formData.tanggalTugas,  // Masuk ke private LocalDate tanggalTugas
            shift: formData.shift,                // Masuk ke private String shift
            lokasiTugas: formData.lokasiTugas,    // Masuk ke private String lokasiTugas
            keterangan: formData.keterangan       // Masuk ke private String keterangan
        };

        console.log("Mengirim payload terstruktur ke Spring Boot:", cleanPayload);

        try {
            if (isEdit) {
                await axios.put(`http://localhost:8080/api/jadwal/${id}`, cleanPayload);
                Swal.fire('Berhasil!', 'Jadwal petugas diperbarui', 'success');
            } else {
                await axios.post('http://localhost:8080/api/jadwal', cleanPayload);
                Swal.fire('Berhasil!', 'Jadwal baru berhasil ditambahkan', 'success');
            }
            navigate('/admin/petugas'); 
        } catch (error) {
            console.error("Error Detail dari Backend:", error.response?.data || error.message);
            Swal.fire('Gagal!', 'Terjadi kesalahan pada server saat memproses data.', 'error');
        }
    };

    return (
        <div style={styles.container}>
            <AdminSidebar activeMenu="petugas"/>

            {/* MAIN CONTENT */}
            <div style={styles.mainContent}>
                <div style={styles.whiteCanvas}>
                    <header style={styles.header}>
                        <button onClick={() => navigate(-1)} style={styles.backBtn}>
                            <ArrowLeft size={18} /> Kembali
                        </button>
                        <h1 style={styles.title}>Tambah Jadwal</h1>
                        <p style={styles.subtitle}>Kelola penugasan operasional kebersihan.</p>
                    </header>

                    <div style={styles.formOuterBox}>      
                        <form onSubmit={handleSubmit} style={styles.formElement}>
                            
                            {/* Dropdown Request Sampah Warga */}
                            {!isEdit && (
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Pilih Request Sampah Warga (Untuk Autofill Alamat)</label>
                                    <select onChange={handleWasteChange} style={styles.selectField}>
                                        <option value="">-- Pilih Request Sampah --</option>
                                        {listWaste.map((w) => (
                                            <option key={w.wasteId} value={w.wasteId}>
                                                {w.user?.nama || 'Tanpa Nama'} - {w.namaSampah}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
    
                            {/* 1. Pilih Petugas */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Pilih Petugas *</label>
                                <select 
                                    name="userId"
                                    value={formData.userId} 
                                    onChange={handleChange} 
                                    required 
                                    style={styles.selectField}
                                >
                                    <option value="">-- Pilih Nama Petugas --</option>
                                    {listPetugas
                                        .filter(user => user.role && user.role.toUpperCase() === 'PETUGAS')
                                        .map((petugas) => (
                                            <option key={petugas.userId} value={petugas.userId}>
                                                {petugas.nama}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                                
                            {/* 2. Lokasi Tugas */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Lokasi Tugas / Alamat Warga *</label>
                                <input 
                                    type="text" 
                                    name="lokasiTugas"
                                    placeholder="Isi lokasi atau pilih request sampah di atas"
                                    value={formData.lokasiTugas} 
                                    onChange={handleChange} 
                                    required
                                    style={styles.inputField} 
                                />
                            </div>
                                
                            {/* 3. Tanggal Tugas */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Tanggal Tugas *</label>
                                <input 
                                    type="date" 
                                    name="tanggalTugas"
                                    value={formData.tanggalTugas} 
                                    onChange={handleChange} 
                                    required 
                                    style={styles.inputField} 
                                />
                            </div>
                                
                            {/* 4. Shift */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Shift *</label>
                                <select 
                                    name="shift"
                                    value={formData.shift} 
                                    onChange={handleChange} 
                                    required 
                                    style={styles.selectField}
                                >
                                    <option value="">-- Pilih Shift --</option>
                                    <option value="Pagi">Pagi</option>
                                    <option value="Siang">Siang</option>
                                    <option value="Malam">Malam</option>
                                </select>
                            </div>
                                
                            {/* 5. Keterangan */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Keterangan</label>
                                <textarea 
                                    name="keterangan"
                                    placeholder="Catatan tambahan (opsional)..."
                                    value={formData.keterangan} 
                                    onChange={handleChange} 
                                    rows="3"
                                    style={{...styles.inputField, resize: 'none'}} 
                                />
                            </div>
                                
                            <button type="submit" style={styles.submitButton}>
                                {isEdit ? 'Simpan Perubahan' : 'Tambahkan Jadwal'}
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
    submitButton: { backgroundColor: '#064D36', color: '#FFFFFF', border: 'none', borderRadius: '14px', padding: '14px 0', fontSize: '15px', fontWeight: '700', cursor: 'pointer', width: '100%', marginTop: '15px' },
    selectField: { backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 18px', fontSize: '14px', outline: 'none', color: '#333', width: '100%', boxSizing: 'border-box', appearance: 'none', backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23064D36' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 18px center', backgroundSize: '16px' },
};

export default AddJadwal;