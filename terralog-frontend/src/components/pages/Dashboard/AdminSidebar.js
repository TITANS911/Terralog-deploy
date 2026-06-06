import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Trash2,
  FileText,
  BarChart3,
  Megaphone,
  LogOut
} from 'lucide-react';

import logoTerraLog from '../../../assets/logo-terralog.png';

const AdminSidebar = ({ activeMenu = 'dashboard' }) => {
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      icon: <LayoutDashboard size={20} />,
      label: 'Dashboard',
      path: '/admin/dashboard'
    },
    {
      id: 'warga',
      icon: <Users size={20} />,
      label: 'Data Warga',
      path: '/admin/pengguna'
    },
    {
      id: 'petugas',
      icon: <UserCog size={20} />,
      label: 'Data Petugas',
      path: '/admin/petugas'
    },
    {
      id: 'sampah',
      icon: <Trash2 size={20} />,
      label: 'Data Kategori Sampah',
      path: '/admin/sampah'
    },
    {
      id: 'transaksi',
      icon: <FileText size={20} />,
      label: 'Data Transaksi',
      path: '/admin/transaksi'
    },
    {
      id: 'laporan',
      icon: <BarChart3 size={20} />,
      label: 'Laporan & Statistik',
      path: '/admin/laporan'
    },
  ];

  const handleLogout = () => {
    Swal.fire({
      title: 'Mau keluar aplikasi?',
      text: 'Anda harus login kembali untuk masuk.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0A4D36',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Keluar!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        // Gunakan replace agar tidak bisa kembali dengan tombol back
        navigate('/login', { replace: true });
      }
    });
  };

  return (
    <aside style={styles.sidebar}>
      <div>
        <div style={styles.logoWrapper}>
          <img src={logoTerraLog} alt="TerraLog" style={styles.logo} />
        </div>

        <div style={styles.divider}></div>

        <p style={styles.navigationText}>NAVIGATION</p>

        <nav style={styles.nav}>
          {menuItems.map((item) => {
            const isActive = activeMenu === item.id;
            const isHovered = hoveredItem === item.id;

            return (
              <div
                key={item.id}
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.activeItem : {}),
                  ...(isHovered && !isActive ? styles.hoverItem : {})
                }}
              >
                <div style={styles.navLeft}>
                  {item.icon}
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span style={styles.badge}>{item.badge}</span>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div
        onClick={handleLogout}
        onMouseEnter={() => setIsLogoutHovered(true)}
        onMouseLeave={() => setIsLogoutHovered(false)}
        style={{
          ...styles.logoutItem,
          ...(isLogoutHovered ? styles.logoutHover : {})
        }}
      >
        <LogOut size={20} />
        <span style={{ fontSize: '12px' }}>Keluar</span>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '270px',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    backgroundColor: '#064D36',
    color: '#fff',
    padding: '28px 25px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    fontFamily: "'Poppins', sans-serif",
    zIndex: 1000
  },

  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: '24px'
  },

  logo: {
    width: '180px',
    height: 'auto',
    objectFit: 'contain',
    display: 'block',
    marginLeft: '10px'
  },

  divider: {
    width: '100%',
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    marginBottom: '10px'
  },

  navigationText: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.7)',
    margin: '0 0 18px 0'
  },

  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },

  navItem: {
    minHeight: '42px',
    padding: '0 18px',
    borderRadius: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    transition: '0.25s ease',
    fontSize: '12px',
    fontWeight: '600'
  },

  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },

  activeItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)'
  },

  hoverItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateX(4px)'
  },

  badge: {
    width: '17px',
    height: '17px',
    borderRadius: '50%',
    backgroundColor: '#FF2020',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '700'
  },

  logoutItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 16px',
    minHeight: '44px',
    borderRadius: '24px',
    cursor: 'pointer',
    transition: '0.25s ease',
    fontSize: '14px',
    fontWeight: '600'
  },

  logoutHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateX(4px)'
  }
};

export default AdminSidebar;