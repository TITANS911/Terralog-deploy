import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ArrowLeft } from 'lucide-react';
import AdminSidebar from '../../AdminSidebar';

const EditJadwal = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        userId: '',
        tanggalTugas: '',
        shift: '',
        lokasiTugas: '',
        keterangan: ''
    });

    const [listPetugas, setListPetugas] = useState([]);
    const [listWaste, setListWaste] = useState([]);

    useEffect(() => {
        if (isEdit) {
            axios.get(`http://localhost:8080/api/jadwal/${id}`)
                .then(res => {
                    const data = res.data;
                    setFormData({
                        userId: data.user?.userId || '',
                        tanggalTugas: data.tanggalTugas || '',
                        shift: data.shift || '',
                        lokasiTugas: data.lokasiTugas || '',
                        keterangan: data.keterangan || ''
                    });
                })
                .catch(() => Swal.fire('Error', 'Gagal memuat data', 'error'));
        }
        
        axios.get('http://localhost:8080/api/users').then(res => setListPetugas(res.data));
        axios.get('http://localhost:8080/api/waste').then(res => setListWaste(res.data));
    }, [id, isEdit]);

    const handleWasteChange = (e) => {
        const wasteId = e.target.value;
        const selectedWaste = listWaste.find(w => w.wasteId === parseInt(wasteId));
        if (selectedWaste) {
            setFormData(prev => ({ ...prev, lokasiTugas: selectedWaste.user?.alamat || '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            user: { userId: parseInt(formData.userId) },
            tanggalTugas: formData.tanggalTugas,
            shift: formData.shift,
            lokasiTugas: formData.lokasiTugas,
            keterangan: formData.keterangan
        };

        try {
            if (isEdit) await axios.put(`http://localhost:8080/api/jadwal/${id}`, payload);
            else await axios.post('http://localhost:8080/api/jadwal', payload);
            
            Swal.fire('Berhasil!', 'Data jadwal berhasil disimpan', 'success');
            navigate('/admin/petugas');
        } catch (err) {
            Swal.fire('Gagal!', 'Terjadi kesalahan sistem', 'error');
        }
    };

    return (
        <div style={styles.container}>
            <AdminSidebar activeMenu="petugas"/>
            <div style={styles.mainContent}>
                <div style={styles.whiteCanvas}>
                    <header style={styles.header}>
                        <button onClick={() => navigate(-1)} style={styles.backBtn}>
                            <ArrowLeft size={18} /> Kembali
                        </button>
                        <h1 style={styles.title}>Edit Jadwal</h1>
                        <p style={styles.subtitle}>Kelola penugasan operasional kebersihan.</p>
                    </header>
                

                    <div style={styles.formOuterBox}>
                        <form onSubmit={handleSubmit} style={styles.formElement}>
                            {!isEdit && (
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Pilih Request Sampah (Autofill)</label>
                                    <select onChange={handleWasteChange} style={styles.selectField}>
                                        <option value="">-- Pilih Request --</option>
                                        {listWaste.map(w => (
                                            <option key={w.wasteId} value={w.wasteId}>
                                                {w.user?.nama} - {w.namaSampah}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Pilih Petugas</label>
                                <select name="userId" value={formData.userId} onChange={e => setFormData({...formData, userId: e.target.value})} required style={styles.selectField}>
                                    <option value="">-- Pilih Petugas --</option>
                                    {listPetugas.filter(u => u.role?.toUpperCase() === 'PETUGAS').map(u => 
                                        <option key={u.userId} value={u.userId}>{u.nama}</option>
                                    )}
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Lokasi Tugas</label>
                                <input type="text" value={formData.lokasiTugas} onChange={e => setFormData({...formData, lokasiTugas: e.target.value})} required style={styles.inputField} />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Tanggal Tugas</label>
                                <input type="date" value={formData.tanggalTugas} onChange={e => setFormData({...formData, tanggalTugas: e.target.value})} required style={styles.inputField} />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Shift</label>
                                <select value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value})} required style={styles.selectField}>
                                    <option value="">Pilih Shift</option>
                                    <option value="Pagi">Pagi</option>
                                    <option value="Siang">Siang</option>
                                    <option value="Malam">Malam</option>
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Keterangan</label>
                                <textarea value={formData.keterangan} onChange={e => setFormData({...formData, keterangan: e.target.value})} style={{...styles.inputField, height: '100px', resize: 'none'}} />
                            </div>

                            <button type="submit" style={styles.submitButton}>Simpan Jadwal</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    // Di file EditJadwal.js
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

export default EditJadwal;