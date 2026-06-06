import React, { useState } from 'react';
import {
  Phone,
  Mail,
  Clock,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react';

import bgKuning from '../assets/Rectangle 35.png';
import logoTerraLog from '../assets/logo-terralog.png';

const Navbar = ({ activePage = 'home' }) => {
  const [hoverNav, setHoverNav] = useState(null);

  const navItems = [
    { id: 'home', name: 'HOME', path: '/' },
    { id: 'tentang', name: 'TENTANG', path: '/#tentang' },
    { id: 'fitur', name: 'FITUR', path: '/#fitur' },
    { id: 'laporan', name: 'LAPORAN', path: '/#laporan' },
    { id: 'kategori', name: 'KATEGORI', path: '/kategori' },
    { id: 'kontak', name: 'KONTAK', path: '/#kontak' }
  ];

  const handleNavClick = (e, item) => {
    e.preventDefault();

    if (item.path === '/') {
      window.location.href = '/';
      return;
    }

    if (item.path === '/kategori') {
      window.location.href = '/kategori';
      return;
    }

    if (window.location.pathname !== '/') {
      window.location.href = item.path;
      return;
    }

    const targetId = item.path.replace('/#', '');
    const element = document.getElementById(targetId);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <>
      <div style={styles.topNavbar}>
        <div style={styles.navInfoGroup}>
          <div style={styles.topNavContact}>
            <span style={styles.navInfoItem}>
              <Clock size={14} color="#FFD700" />
              24/7 Customer Service
            </span>

            <span style={styles.navInfoItem}>
              <Mail size={14} color="#FFD700" />
              terralog.idn@gmail.com
            </span>

            <span style={styles.navInfoItem}>
              <Phone size={14} color="#FFD700" />
              (+62) 895 3279 16134
            </span>
          </div>
        </div>

        <div style={styles.yellowBranding}>
          <div style={styles.socialGroup}>
            <Facebook size={16} color="white" />
            <Twitter size={16} color="white" />
            <Instagram size={16} color="white" />
          </div>
        </div>
      </div>

      <nav style={styles.navbar}>
        <a href="/" style={styles.logoLink}>
          <img src={logoTerraLog} alt="TerraLog" style={styles.logoImage} />
        </a>

        <div style={styles.navLinks}>
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            const isHovered = hoverNav === item.id;

            return (
              <a
                key={item.id}
                href={item.path}
                onClick={(e) => handleNavClick(e, item)}
                onMouseEnter={() => setHoverNav(item.id)}
                onMouseLeave={() => setHoverNav(null)}
                style={{
                  ...styles.link,
                  color: isActive || isHovered ? '#FFD700' : '#fff',
                  borderBottom: isActive ? '3px solid #FFD700' : '3px solid transparent'
                }}
              >
                {item.name}
              </a>
            );
          })}
        </div>

        <div style={styles.navAuth}>
          <a href="/login">
            <button style={styles.btnMasuk}>Masuk</button>
          </a>

          <a href="/register">
            <button style={styles.btnDaftar}>Daftar</button>
          </a>
        </div>
      </nav>
    </>
  );
};

const styles = {
  topNavbar: {
    height: '40px',
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden'
  },

  topNavContact: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    fontSize: '12px',
    color: '#555'
  },

  navInfoGroup: {
    display: 'flex',
    gap: '20px',
    marginLeft: '140px',
    marginRight: '40px',
    fontSize: '12px',
    color: '#666',
    alignItems: 'center'
  },

  navInfoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginLeft: '10px',
    whiteSpace: 'nowrap'
  },

  yellowBranding: {
    backgroundImage: `url(${bgKuning})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right center',
    backgroundSize: '100% 100%',
    height: '100%',
    width: '450px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '60px',
    gap: '15px',
    color: '#1b4332',
    marginLeft: 'auto'
  },

  socialGroup: {
    display: 'flex',
    gap: '35px',
    alignItems: 'center',
    paddingRight: '130px'
  },

  navbar: {
    backgroundColor: '#064D36',
    padding: '10px 10%',
    minHeight: '60px',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },

  logoLink: {
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    height: '45px'
  },

  logoImage: {
    width: '135px',
    height: '45px',
    objectFit: 'contain',
    display: 'block',
    transform: 'translateY(-4px)'
  },

  navLinks: {
    display: 'flex',
    gap: '22px',
    alignItems: 'center'
  },

  link: {
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: '800',
    paddingBottom: '5px',
    transition: '0.3s'
  },

  navAuth: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center'
  },

  btnMasuk: {
    background: 'none',
    border: 'none',
    color: '#FFD700',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold'
  },

  btnDaftar: {
    backgroundColor: '#FFD700',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '15px',
    fontWeight: 'bold',
    color: '#064D36',
    cursor: 'pointer',
    fontSize: '13px'
  }
};

export default Navbar;