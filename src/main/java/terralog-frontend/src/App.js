import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Landing Page
import LandingPage from './components/pages/LandingPage';
import KategoriPage from './components/pages/KategoriPage';

// Auth
import Login from './components/pages/Auth/Login';
import Register from './components/pages/Auth/Register';

// Protected Route
import ProtectedRoute from './components/utils/ProtectedRoute';

// Petugas
import PetugasDashboard from './components/pages/Dashboard/PetugasDashboard';
import Laporan_Petugas from './components/pages/Dashboard/Petugas/Laporan_petugas';
import PenjemputanSampah_Petugas from './components/pages/Dashboard/Petugas/PenjemputanSampah_petugas';
import Transaksi_Petugas from './components/pages/Dashboard/Petugas/Transaksi_petugas';
import Warga_Petugas from './components/pages/Dashboard/Petugas/Warga_petugas';
import EditTransaksi from './components/pages/Dashboard/Petugas/CRUDTransaksi/EditTransaksi';
import AddTransaksi from './components/pages/Dashboard/Petugas/CRUDTransaksi/AddTransaksi';

// Admin
import AdminDashboard from './components/pages/Dashboard/AdminDashboard';
import UserManagement from './components/pages/Dashboard/Admin/UserManagement';
import AddPetugas from './components/pages/Dashboard/Admin/CRUDPetugas/AddPetugas';
import EditPetugas from './components/pages/Dashboard/Admin/CRUDPetugas/EditPetugas';
import AddWarga from './components/pages/Dashboard/Admin/CRUDWarga/AddWarga';
import EditWarga from './components/pages/Dashboard/Admin/CRUDWarga/EditWarga';
import AddKategori from './components/pages/Dashboard/Admin/CRUDKategori/AddKategori';
import EditKategori from './components/pages/Dashboard/Admin/CRUDKategori/EditKategori';
import PetugasManagement from './components/pages/Dashboard/Admin/PetugasManagement';
import SampahManagement from './components/pages/Dashboard/Admin/SampahManagement';
import TransaksiManagement from './components/pages/Dashboard/Admin/TransaksiManagement';
import LaporanStatistik from './components/pages/Dashboard/Admin/LaporanStatistik';
import AddJadwal from './components/pages/Dashboard/Admin/CRUDJadwal/AddJadwal';
import EditJadwal from './components/pages/Dashboard/Admin/CRUDJadwal/EditJadwal';
import DetailTransaksi from './components/pages/Dashboard/Admin/DetailTransaksi';

// Warga
import WargaDashboard from './components/pages/Dashboard/WargaDashboard';
import BuangSampah from './components/pages/Dashboard/Warga/BuangSampah';
import JadwalPenjemputan from './components/pages/Dashboard/Warga/JadwalPenjemputan';
import LaporanWarga from './components/pages/Dashboard/Warga/LaporanWarga';
import ProfilWarga from './components/pages/Dashboard/Warga/ProfilWarga';
import AddSampah from './components/pages/Dashboard/Warga/CRUD Sampah/AddSampah';
import EditSampah from './components/pages/Dashboard/Warga/CRUD Sampah/EditSampah';



// IMPORT CRUD MANAGEMENT (Gunakan UserManagement)


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/kategori" element={<KategoriPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* --- ADMIN ROUTES --- */}
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/pengguna" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/petugas" element={<ProtectedRoute><PetugasManagement /></ProtectedRoute>} />
        <Route path="/admin/sampah" element={<ProtectedRoute><SampahManagement /></ProtectedRoute>} />
        <Route path="/admin/transaksi" element={<ProtectedRoute><TransaksiManagement /></ProtectedRoute>} />
        <Route path="/admin/laporan" element={<ProtectedRoute><LaporanStatistik /></ProtectedRoute>} />
        <Route path="/admin/detail-transaksi/:id" element={<ProtectedRoute><DetailTransaksi /></ProtectedRoute>} />
        {/* CRUD Warga, Kategori, Petugas, Jadwal */}
        <Route path="/admin/tambah-warga" element={<ProtectedRoute><AddWarga /></ProtectedRoute>} />
        <Route path="/admin/edit-warga/:id" element={<ProtectedRoute><EditWarga /></ProtectedRoute>} />
        <Route path="/admin/tambah-kategori" element={<ProtectedRoute><AddKategori /></ProtectedRoute>} />
        <Route path="/admin/edit-kategori/:id" element={<ProtectedRoute><EditKategori /></ProtectedRoute>} />
        <Route path="/admin/tambah-petugas" element={<ProtectedRoute><AddPetugas /></ProtectedRoute>} />
        <Route path="/admin/edit-petugas/:id" element={<ProtectedRoute><EditPetugas /></ProtectedRoute>} />
        <Route path="/admin/tambah-jadwal" element={<ProtectedRoute><AddJadwal /></ProtectedRoute>} />
        <Route path="/admin/edit-jadwal/:id" element={<ProtectedRoute><EditJadwal /></ProtectedRoute>} />

        {/* --- PETUGAS ROUTES --- */}
        <Route path="/petugas/dashboard" element={<ProtectedRoute><PetugasDashboard /></ProtectedRoute>} />
        <Route path="/petugas/laporan" element={<ProtectedRoute><Laporan_Petugas /></ProtectedRoute>} />
        <Route path="/petugas/penjemputan" element={<ProtectedRoute><PenjemputanSampah_Petugas /></ProtectedRoute>} />
        <Route path="/petugas/transaksi" element={<ProtectedRoute><Transaksi_Petugas /></ProtectedRoute>} />
        <Route path="/petugas/warga" element={<ProtectedRoute><Warga_Petugas /></ProtectedRoute>} />
        {/* CRUD Transaksi Petugas */}
        <Route path="/petugas/tambah-transaksi" element={<ProtectedRoute><AddTransaksi /></ProtectedRoute>} />
        <Route path="/petugas/edit-transaksi/:id" element={<ProtectedRoute><EditTransaksi /></ProtectedRoute>} />


        {/* --- WARGA ROUTES --- */}
        <Route path="/dashboard" element={<ProtectedRoute><WargaDashboard /></ProtectedRoute>} />
        <Route path="/profil-warga" element={<ProtectedRoute><ProfilWarga /></ProtectedRoute>} />
        <Route path="/buang-sampah" element={<ProtectedRoute><BuangSampah /></ProtectedRoute>} />
        <Route path="/jadwal-penjemputan" element={<ProtectedRoute><JadwalPenjemputan /></ProtectedRoute>} />
        <Route path="/laporan-warga" element={<ProtectedRoute><LaporanWarga /></ProtectedRoute>} />

        {/* CRUD Sampah Warga */}
        <Route path="/tambah-sampah" element={<ProtectedRoute><AddSampah /></ProtectedRoute>} />
        <Route path="/edit-sampah/:id" element={<ProtectedRoute><EditSampah /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;