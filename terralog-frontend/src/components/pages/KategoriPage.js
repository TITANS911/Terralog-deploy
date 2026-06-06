import React, { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  Clock,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react';

import Navbar from '../Navbar';

import bgKuning from '../../assets/Rectangle 35.png';
import logoTerraLog from '../../assets/logo-terralog.png';
import heroKategori from '../../assets/kategori/hero-kategori.png';

import organik1 from '../../assets/kategori/organik-1.png';
import organik2 from '../../assets/kategori/organik-2.png';
import organik3 from '../../assets/kategori/organik-3.png';
import organik4 from '../../assets/kategori/organik-4.png';

import kertas1 from '../../assets/kategori/kertas-1.png';
import kertas2 from '../../assets/kategori/kertas-2.png';
import kertas3 from '../../assets/kategori/kertas-3.png';
import kertas4 from '../../assets/kategori/kertas-4.png';

import kaca1 from '../../assets/kategori/kaca-1.png';
import kaca2 from '../../assets/kategori/kaca-2.png';
import kaca3 from '../../assets/kategori/kaca-3.png';
import kaca4 from '../../assets/kategori/kaca-4.png';

import plastik1 from '../../assets/kategori/plastik-1.png';
import plastik2 from '../../assets/kategori/plastik-2.png';
import plastik3 from '../../assets/kategori/plastik-3.png';
import plastik4 from '../../assets/kategori/plastik-4.png';

import metal1 from '../../assets/kategori/metal-1.png';
import metal2 from '../../assets/kategori/metal-2.png';
import metal3 from '../../assets/kategori/metal-3.png';
import metal4 from '../../assets/kategori/metal-4.png';

const kategoriData = [
  {
    number: '01',
    title: 'Sampah Organik',
    color: '#64BE2E',
    description:
      'Sampah organik merupakan sampah yang berasal dari makhluk hidup dan mudah terurai secara alami.',
    label: 'Contoh Sampah Organik:',
    examples: ['Sisa makanan', 'Daun kering', 'Kulit buah', 'Sayuran', 'Ampas kopi'],
    closing:
      'Sampah organik dapat diolah menjadi kompos atau pupuk alami. Sampah organik juga membantu mengurangi limbah dan mendukung lingkungan yang lebih bersih.',
    images: [organik1, organik2, organik3, organik4],
    reverse: false
  },
  {
    number: '02',
    title: 'Sampah Kertas',
    color: '#F1C40F',
    description:
      'Sampah kertas merupakan jenis sampah yang berasal dari bahan berbasis kertas dan masih dapat didaur ulang apabila kondisinya masih layak.',
    label: 'Contoh Sampah Kertas:',
    examples: ['Koran', 'Kardus', 'Buku bekas', 'Kertas HVS', 'Majalah'],
    closing:
      'Sampah kertas dapat dipilah dan didaur ulang menjadi produk kertas baru yang lebih bermanfaat. Daur ulang kertas membantu mengurangi penebangan pohon dan menjaga kelestarian lingkungan.',
    images: [kertas1, kertas2, kertas3, kertas4],
    reverse: true
  },
  {
    number: '03',
    title: 'Sampah Kaca',
    color: '#6BC7D6',
    description:
      'Sampah kaca merupakan jenis sampah berbahan kaca yang dapat didaur ulang dan digunakan kembali melalui proses pengolahan tertentu.',
    label: 'Contoh Sampah Kaca:',
    examples: ['Botol kaca', 'Pecahan kaca', 'Gelas kaca', 'Toples', 'Kaca minuman'],
    closing:
      'Sampah kaca dapat dipisahkan berdasarkan jenisnya lalu didaur ulang menjadi produk kaca baru. Daur ulang kaca membantu mengurangi limbah dan menghemat penggunaan bahan baku baru.',
    images: [kaca1, kaca2, kaca3, kaca4],
    reverse: false
  },
  {
    number: '04',
    title: 'Sampah Plastik',
    color: '#E33B2F',
    description:
      'Sampah plastik merupakan jenis sampah berbahan plastik yang sulit terurai secara alami namun masih dapat didaur ulang melalui proses tertentu.',
    label: 'Contoh Sampah Plastik:',
    examples: ['Botol plastik', 'Kantong plastik', 'Sedotan', 'Wadah makanan', 'Kemasan minuman'],
    closing:
      'Sampah plastik dapat dipilah dan didaur ulang menjadi berbagai produk yang dapat digunakan kembali. Pengelolaan sampah plastik membantu mengurangi pencemaran lingkungan dan limbah yang sulit terurai.',
    images: [plastik1, plastik2, plastik3, plastik4],
    reverse: true
  },
  {
    number: '05',
    title: 'Sampah Metal',
    color: '#6F8F8D',
    description:
      'Sampah metal merupakan jenis sampah berbahan logam yang memiliki nilai daur ulang tinggi dan dapat digunakan kembali melalui proses pengolahan.',
    label: 'Contoh Sampah Metal:',
    examples: ['Kaleng minuman', 'Aluminium', 'Besi bekas', 'Tutup kaleng', 'Peralatan logam'],
    closing:
      'Sampah metal dapat dikumpulkan dan dilebur kembali untuk dijadikan bahan baku produk baru. Daur ulang metal membantu mengurangi limbah serta menghemat penggunaan sumber daya alam.',
    images: [metal1, metal2, metal3, metal4],
    reverse: false
  }
];

const KategoriPage = () => {
  const [hoverNav, setHoverNav] = useState(null);

  // Scroll ke paling atas ketika halaman dimuat
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, []);

  const navItems = [
    { name: 'HOME', hash: '/' },
    { name: 'TENTANG', hash: '/#tentang' },
    { name: 'FITUR', hash: '/#fitur' },
    { name: 'LAPORAN', hash: '/#laporan' },
    { name: 'KATEGORI', hash: '/kategori' },
    { name: 'KONTAK', hash: '/#kontak' }
  ];

  const getLinkStyle = (hash) => ({
    ...styles.link,
    color: hash === '/kategori' || hoverNav === hash ? '#FFD700' : '#fff',
    borderBottom: hash === '/kategori' ? '3px solid #FFD700' : '3px solid transparent'
  });

  return (
    <div style={styles.wrapper}>
      <Navbar activePage="kategori" />

      <section style={styles.heroKategori}>
        <img src={heroKategori} alt="Kategori sampah" style={styles.heroImage} />
      </section>

      <section style={styles.introSection}>
        <div style={styles.titleWrap}>
          <h1 style={styles.mainTitle}>
            <span style={{ color: '#F1C40F' }}>Yuk,</span> Kenali Kategori
            <br />
            Sampah
          </h1>

          <div style={styles.titleLine}></div>
        </div>

        <p style={styles.introText}>
          Memahami kategori sampah dapat membantu menciptakan lingkungan yang lebih bersih
          dan berkelanjutan.
        </p>
      </section>

      <main style={styles.content}>
        {kategoriData.map((item) => (
          <CategorySection key={item.number} item={item} />
        ))}
      </main>

      <footer style={styles.footer}>
        <div>Copyright © TerraLog. All Rights Reserved.</div>

        <div style={styles.footerRight}>
          <span>User Terms & Conditions</span>
          <span>|</span>
          <span>Privacy Policy</span>
        </div>
      </footer>
    </div>
  );
};

const CategorySection = ({ item }) => {
  const textContent = (
    <div style={styles.categoryText}>
      <h2 style={{ ...styles.categoryNumber, color: item.color }}>
        / {item.number}
      </h2>

      <h3 style={styles.categoryTitle}>{item.title}</h3>

      <p style={styles.categoryDesc}>{item.description}</p>

      <p style={styles.exampleTitle}>{item.label}</p>

      <ol style={styles.exampleList}>
        {item.examples.map((example) => (
          <li key={example}>{example}</li>
        ))}
      </ol>

      <p style={styles.categoryDesc}>{item.closing}</p>
    </div>
  );

  const imageContent = (
    <div style={styles.imageGrid}>
      {item.images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`${item.title} ${index + 1}`}
          style={styles.categoryImage}
        />
      ))}
    </div>
  );

  return (
    <section style={styles.categorySection}>
      {item.reverse ? (
        <>
          {imageContent}
          {textContent}
        </>
      ) : (
        <>
          {textContent}
          {imageContent}
        </>
      )}
    </section>
  );
};

const styles = {
  wrapper: {
    fontFamily: "'Poppins', sans-serif",
    color: '#333',
    backgroundColor: '#fff',
    minHeight: '100vh',
    scrollBehavior: 'smooth'
  },

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
    backgroundColor: '#1b4332',
    padding: '15px 10%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    minHeight: '60px',
    boxSizing: 'border-box'
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
    transform: 'translateY(-8px)'
  },

  navLinks: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  },

  link: {
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 'bold',
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
    color: '#fff',
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
    color: '#1b4332',
    cursor: 'pointer',
    fontSize: '13px'
  },

  heroKategori: {
    backgroundColor: 'rgba(10, 64, 12, 0.15)',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible'
  },

  heroImage: {
    width: '100%',
    maxWidth: '1440px',
    height: 'auto',
    objectFit: 'contain',
    display: 'block'
  },

  introSection: {
    padding: '55px 10% 15px 10%'
  },

  titleWrap: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '35px'
  },

  mainTitle: {
    fontSize: '48px',
    lineHeight: '1.08',
    margin: 0,
    color: '#2B2B2B',
    fontWeight: '900',
    minWidth: '530px'
  },

  titleLine: {
    height: '8px',
    backgroundColor: '#064D36',
    flex: 1,
    marginTop: '28px'
  },

  introText: {
    color: '#8A8A8A',
    fontSize: '16px',
    maxWidth: '720px',
    margin: '-48px 0 0 240px',
    lineHeight: '1.4'
  },

  content: {
    padding: '65px 10% 80px'
  },

  categorySection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '70px',
    alignItems: 'center',
    marginBottom: '115px'
  },

  categoryText: {
    maxWidth: '520px'
  },

  categoryNumber: {
    fontSize: '42px',
    margin: '0 0 10px 0',
    fontWeight: '900',
    lineHeight: '1'
  },

  categoryTitle: {
    fontSize: '30px',
    margin: '0 0 10px 0',
    color: '#2D2D2D',
    fontWeight: '900',
    lineHeight: '1.1'
  },

  categoryDesc: {
    fontSize: '17px',
    color: '#7A7A7A',
    lineHeight: '1.25',
    margin: '0 0 20px 0'
  },

  exampleTitle: {
    fontSize: '17px',
    color: '#7A7A7A',
    margin: '0 0 2px 0'
  },

  exampleList: {
    fontSize: '17px',
    color: '#7A7A7A',
    paddingLeft: '22px',
    margin: '0 0 20px 0',
    lineHeight: '1.15'
  },

  imageGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },

  categoryImage: {
    width: '100%',
    height: '155px',
    objectFit: 'cover',
    borderRadius: '10px',
    display: 'block'
  },

  footer: {
    backgroundColor: '#FFD700',
    padding: '20px 10%',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#1b4332'
  },

  footerRight: {
    display: 'flex',
    gap: '15px'
  }
};

export default KategoriPage;