import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import LogoRegister from '../../../assets/logoRegister.png'; // Menggunakan asset yang sama dengan Login

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        nama: '',
        alamat: '',
        komplek: '',
        noHp: '', 
        role: 'WARGA' 
    });
    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:8080/api/auth/register', formData);
            if (response.data.success) {
                Swal.fire({ 
                    icon: 'success', 
                    title: 'Berhasil!', 
                    text: 'Akun kamu sudah terdaftar, silakan login.', 
                    confirmButtonColor: '#1b4332' 
                });
                navigate('/login');
            } else {
                Swal.fire({ 
                    icon: 'error', 
                    title: 'Gagal', 
                    text: response.data.message || "Registrasi Gagal!", 
                    confirmButtonColor: '#1b4332' 
                });
            }
        } catch (error) {
            Swal.fire({ 
                icon: 'error', 
                title: 'Oops!', 
                text: 'Gagal terhubung ke server!', 
                confirmButtonColor: '#1b4332' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.pageWrapper}>
            {/* KIRI (HIJAU) - Identik dengan Login */}
            <div style={styles.leftSection}>
                <div style={styles.welcomeText}>
                    <h1 style={styles.mainTitle}>Start With <br /><span style={styles.highlight}>TerraLog</span></h1>
                    <p style={styles.subTitle}>Daftar untuk mulai mengelola sampah anda.</p>
                </div>
                <div style={styles.icon}>
                    <div style={styles.iconLogin}>
                        <div style={styles.logoLogin}>
                            <img src={LogoRegister} alt="Register Illustration" style={{ width: '370px', height: '310px', objectFit: 'cover', borderRadius: '20px' }} />
                        </div>
                    </div>
                </div> 
            </div>

            {/* KANAN (KUNING) - Form Register */}
            <div style={styles.rightSection}>
                <form onSubmit={handleRegister} style={styles.loginCard}>
                    <h2 style={styles.formTitle}>Register</h2>
                    <p style={styles.formSubTitle}>Enter your account details</p>

                    {/* Grid untuk field yang bisa disejajarkan */}
                        <div style={styles.inputGroup}>
                            <label style={styles.label}><span style={{color: 'red'}}>*</span>Fullname</label>
                            <input name="nama" type="text" placeholder='Enter your full name' onChange={handleChange} style={styles.input} required />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}><span style={{color: 'red'}}>*</span>Telephone Number</label>
                            <input name="noHp" type="text" placeholder="08.." onChange={handleChange} style={styles.input} required />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}><span style={{color: 'red'}}>*</span>Address</label>
                            <input name="alamat" type="text" placeholder='Enter your address' onChange={handleChange} style={styles.input} required />
                        </div>                       

                        <div style={styles.inputGroup}>
                            <label style={styles.label}><span style={{color: 'red'}}>*</span>Username</label>
                            <input name="username" type="text" placeholder='Enter your username' onChange={handleChange} style={styles.input} required />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}><span style={{color: 'red'}}>*</span>Password</label>
                            <input name="password" type="password" placeholder='Enter your password' onChange={handleChange} style={styles.input} required />
                        </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        style={{ ...styles.button, ...(isHovered ? styles.buttonHover : {}) }}
                    >
                        {loading ? 'Processing...' : 'Register'}
                    </button>

                    <p style={styles.registerText}>
                        Already have an account? <a href="/login" style={styles.registerLink}>Login</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

// Styles di bawah ini disalin persis dari komponen Login kamu
const styles = {
    pageWrapper: { display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' },
    leftSection: {
        flex: '0 0 45%',
        backgroundColor: '#064e3b',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 50px',
        color: '#fff',
    },
    mainTitle: { fontSize: '5vw', fontWeight: '450', margin: 0, lineHeight: '1.1', marginLeft: '50px', color: '#FACC15' , fontfamily: 'Poppins' },
    highlight: { color: '#FACC15', fontWeight: '790', fontfamily: 'Poppins' },
    subTitle: { fontSize: '1.1rem', marginTop: '15px', opacity: '0.9', marginLeft: '50px' },
    
    rightSection: {
        flex: '0 0 55%', // Sedikit disesuaikan agar form register yang panjang muat
        backgroundColor: '#fbbf24',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '50px'
    },
    loginCard: {
        backgroundColor: '#fff',
        width: '380px', 
        // Sedikit lebih lebar dari login karena field lebih banyak
        padding: '30px 40px 20px 40px',
        borderRadius: '50px 50px 0 0',
        boxShadow: '0 -5px 20px rgba(0,0,0,0.1)',
        textAlign: 'left',
        margin: 0,
        marginTop: '40px',
        marginLeft: '-200px',
        borderBottom: 'none'    
    },

    formTitle: { fontSize: '45px', fontWeight: 'bold', color: '#064e3b', margin: '0', fontfamily: 'Poppins' },
    formSubTitle: { color: '#999', marginBottom: '28px', fontSize: '15px', marginTop: '11px' },
    inputGroup: { marginBottom: '10px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#064e3b' },
    input: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #065f46', boxSizing: 'border-box' },
    button: { width: '100%', padding: '14px', backgroundColor: '#064e3b', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
    buttonHover: { backgroundColor: '#065f46' },
    divider: { display: 'flex', alignItems: 'center', margin: '20px 0' },
    line: { flex: 1, height: '2px', backgroundColor: '#fcc419' },
    dividerText: { margin: '0 20px', color: '#065f46', fontSize: '13px', fontWeight: 'bold' },
    registerText: { textAlign: 'center', fontSize: '13px', marginTop: '10px' },
    registerLink: { color: '#064e3b', fontWeight: 'bold', textDecoration: 'none' },
    icon: { marginTop: '30px', display: 'flex', justifyContent: 'flex-start' },
    iconLogin: { 
        width: '150px', 
        height: '280px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' ,
        marginTop: '30px', 
        marginLeft: '190px',
    },
    logoLogin: { fontSize: '200px' }
};

export default Register;