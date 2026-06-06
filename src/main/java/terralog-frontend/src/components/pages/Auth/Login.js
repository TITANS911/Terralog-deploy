import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import LoginIMG from '../../../assets/LoginIMG.png';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const googleButtonRef = useRef(null);
    const navigate = useNavigate();

    // Fungsi untuk menyimpan semua data pengguna ke localStorage
    const saveUserDataToLocalStorage = (userData) => {
        localStorage.setItem('nama', userData.nama || '');
        localStorage.setItem('user_role', (userData.role || '').toString().trim().toUpperCase());
        localStorage.setItem('userId', (userData.userId || userData.id || '').toString());
        localStorage.setItem('email', userData.email || '');
        localStorage.setItem('alamat', userData.alamat || '');
        localStorage.setItem('noHp', userData.noHp || '');
        localStorage.setItem('komplek', userData.komplek || '');
    };

    // Handle Google Login Callback
    const handleGoogleCallback = async (response) => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:8080/api/auth/google-login', {
                credential: response.credential
            });

            if (res.data.success === true) {
                saveUserDataToLocalStorage(res.data);
                
                const role = res.data.role ? res.data.role.toString().trim().toUpperCase() : "";
                Swal.fire({ 
                    icon: 'success', 
                    title: 'Login Berhasil!', 
                    text: `Selamat datang, ${res.data.nama}!`, 
                    confirmButtonColor: '#1b4332' 
                });

                if (role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
                else if (role === 'PETUGAS') navigate('/petugas/dashboard', { replace: true });
                else navigate('/dashboard', { replace: true });
            } else {
                Swal.fire({ 
                    icon: 'error', 
                    title: 'Login Gagal', 
                    text: res.data.message || "Login Google gagal!", 
                    confirmButtonColor: '#1b4332' 
                });
            }
        } catch (error) {
            console.error("Detail error Google login:", error);
            Swal.fire({ 
                icon: 'error', 
                title: 'Koneksi Error', 
                text: 'Gagal terhubung ke server backend!', 
                confirmButtonColor: '#1b4332' 
            });
        } finally { 
            setLoading(false); 
        }
    };

    // Load Google Sign-In SDK dan render button
    useEffect(() => {
        const loadGoogleSDK = () => {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                if (window.google && googleButtonRef.current) {
                    window.google.accounts.id.initialize({
                        client_id: '386780647181-98gmklbhernpn6c6ujeilt068bg8qsem.apps.googleusercontent.com',
                        callback: handleGoogleCallback,
                        auto_select: false,
                        cancel_on_tap_outside: true,
                    });
                    
                    // Render Google Sign-In button
                    window.google.accounts.id.renderButton(
                        googleButtonRef.current,
                        { 
                            theme: 'outline', 
                            size: 'large',
                            width: '280',
                            text: 'continue_with',
                            shape: 'pill',
                            logo_alignment: 'left'
                        }
                    );
                }
            };
            document.body.appendChild(script);
        };

        loadGoogleSDK();

        // Cleanup
        return () => {
            if (googleButtonRef.current) {
                googleButtonRef.current.innerHTML = '';
            }
        };
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                username: username, 
                password: password
            });

            if (response.data.success === true) {
                saveUserDataToLocalStorage(response.data);
                
                const role = response.data.role ? response.data.role.toString().trim().toUpperCase() : "";

                if (role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
                else if (role === 'PETUGAS') navigate('/petugas/dashboard', { replace: true });
                else navigate('/dashboard', { replace: true });
            } else {
                Swal.fire({ 
                    icon: 'error', 
                    title: 'Login Gagal', 
                    text: response.data.message || "Username atau password salah!", 
                    confirmButtonColor: '#1b4332' 
                });
            }
        } catch (error) {
            console.error("Detail error login:", error);
            Swal.fire({ 
                icon: 'error', 
                title: 'Koneksi Error', 
                text: 'Gagal terhubung ke server backend!', 
                confirmButtonColor: '#1b4332' 
            });
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.leftSection}>
                <div style={styles.welcomeText}>
                    <h1 style={styles.mainTitle}>Welcome to <br /><span style={styles.highlight}>TerraLog</span></h1>
                    <p style={styles.subTitle}>Masuk untuk mengelola sampah Anda.</p>
                </div>
                <div style={styles.icon}>
                   <div style={styles.iconLogin}>
                        <div style={styles.logoLogin}>
                            <img src={LoginIMG} alt="Login Illustration" style={{ width: '370px', height: '300px', objectFit: 'cover', borderRadius: '20px' }} />
                        </div>
                   </div>
                </div> 
            </div>

            <div style={styles.rightSection}>
                <form onSubmit={handleLogin} style={styles.loginCard}>
                    <h2 style={styles.formTitle}>Login</h2>
                    <p style={styles.formSubTitle}>Enter your account details</p>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}><span style={{color: 'red'}}>*</span>Username</label>
                        <input 
                            type="text" 
                            placeholder="Enter your username" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.passwordInputGroup}>
                        <label style={styles.label}><span style={{color: 'red'}}>*</span>Password</label>
                        <input 
                            type="password" 
                            placeholder="Enter your password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>


                    <button 
                        type="submit" 
                        disabled={loading} 
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        style={{ ...styles.button, ...(isHovered ? styles.buttonHover : {}) }}
                    >
                        {loading ? 'Processing...' : 'Login'}
                    </button>

                    <div style={styles.divider}>
                        <div style={styles.line}></div>
                        <span style={styles.dividerText}>Or</span>
                        <div style={styles.line}></div>
                    </div>

                    <div style={styles.socialGroup}>
                        <div ref={googleButtonRef} id="google-sign-in-button" style={styles.googleButtonWrapper}></div>
                    </div>

                    <p style={styles.registerText}>
                        Don't have an account? <a href="/register" style={styles.registerLink}>Register</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

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
    mainTitle: { fontSize: '5vw', fontWeight: '500', margin: 0, lineHeight: '1.1', marginLeft: '20px' },
    highlight: { color: '#f2d325', fontWeight: '790' },
    subTitle: { fontSize: '1.1rem', marginTop: '15px', opacity: '0.9', marginLeft: '20px' },
    
    rightSection: {
        flex: '0 0 40%',
        backgroundColor: '#fbbf24',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '55px 55px 0 55px'
    },

    loginCard: {
        backgroundColor: '#fff',
        width: '430px',
        height: '100%',
        padding: '30px 40px 30px 40px',
        borderRadius: '50px 50px 0 0',
        boxShadow: '0 -5px 20px rgba(0,0,0,0.1)',
        textAlign: 'left',
        margin: 0,
        marginTop: '50px',
        borderBottom: 'none',
        boxSizing: 'border-box'
    },
    formTitle: { fontSize: '2rem', fontWeight: 'bold', color: '#064e3b', margin: '0' },
    formSubTitle: { color: '#999', marginBottom: '25px', fontSize: '13px' },
    inputGroup: { marginBottom: '15px' },
    passwordInputGroup: { marginBottom: '40px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#064e3b' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', boxSizing: 'border-box' },
    extraActions: { 
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px', 
        fontSize: '11px' 
    },
    rememberMe: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer'
    },
    forgotPass: {
        textDecoration: 'none',
        color: '#064e3b'
    },
    button: { width: '100%', padding: '14px', backgroundColor: '#064e3b', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    buttonHover: { backgroundColor: '#065f46' },
    divider: { display: 'flex', alignItems: 'center', margin: '20px 0', marginTop: '30px' },
    line: { flex: 1, height: '2px', backgroundColor: '#fcc419' },
    dividerText: { margin: '0 20px', color: '#065f46', fontSize: '13px', fontWeight: 'bold' },
    socialGroup: { 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        marginBottom: '20px'
    },
    googleButtonWrapper: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center'
    },
    registerText: { textAlign: 'center', fontSize: '13px' },
    registerLink: { color: '#064e3b', fontWeight: 'bold', textDecoration: 'none' },
    icon: { 
        marginTop: '30px', 
        display: 'flex', 
        justifyContent: 'flex-start'
    },
    iconLogin: { 
        width: '150px', 
        height: '280px', 
        borderRadius: '20px', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '20px',
        marginLeft: '150px',
    },
    logoLogin: { 
        fontSize: '300px' 
    }
};

export default Login;
