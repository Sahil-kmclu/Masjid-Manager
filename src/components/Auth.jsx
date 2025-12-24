import { useState, useEffect } from 'react';
import './Auth.css';

function Auth({ onLogin }) {
    const [mode, setMode] = useState('login'); // login, register, guest-login, super-admin-login
    const [formData, setFormData] = useState({
        mosqueName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        address: '',
        secretCode: ''
    });
    const [guestCode, setGuestCode] = useState('');
    const [adminCreds, setAdminCreds] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [mosques, setMosques] = useState([]);

    useEffect(() => {
        // Reload mosques every time mode changes or component mounts
        const savedMosques = JSON.parse(localStorage.getItem('registered_mosques') || '[]');
        setMosques(savedMosques);
    }, [mode]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleRegister = (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!formData.secretCode) {
            setError('Secret Code is required');
            return;
        }

        if (mosques.some(m => m.email === formData.email || m.phone === formData.email)) {
            setError('Account with this Email or Phone already exists');
            return;
        }

        // Check if phone number is already used (strictly checking phone field against phone field)
        // Note: formData.email field is used for "Email / Phone" input, so we need to check if it matches any existing phone or email
        const isDuplicate = mosques.some(m => {
            // Check if input matches an existing email
            if (m.email && m.email === formData.email) return true;
            // Check if input matches an existing phone
            if (m.phone && m.phone === formData.email) return true;
            // Check if explicit phone field (if we had one separate) matches - here we use formData.email as the single identifier
            return false;
        });

        if (isDuplicate) {
             setError('This Mobile Number or Email is already registered with another Mosque.');
             return;
        }

        // Check if secret code is unique across mosques to ensure correct mapping
        if (mosques.some(m => m.secretCode === formData.secretCode)) {
            setError('This Secret Code is already in use. Please choose another.');
            return;
        }

        const newMosque = {
            id: Date.now().toString(),
            name: formData.mosqueName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password, // In a real app, this should be hashed
            address: formData.address,
            secretCode: formData.secretCode,
            createdAt: new Date().toISOString()
        };

        const updatedMosques = [...mosques, newMosque];
        localStorage.setItem('registered_mosques', JSON.stringify(updatedMosques));
        setMosques(updatedMosques);
        
        // Auto login after register
        onLogin({
            ...newMosque,
            role: 'admin'
        });
    };

    const handleLogin = (e) => {
        e.preventDefault();
        
        const mosque = mosques.find(m => 
            (m.email === formData.email || m.phone === formData.email) && 
            m.password === formData.password
        );

        if (mosque) {
            onLogin({
                ...mosque,
                role: 'admin'
            });
        } else {
            setError('Invalid credentials');
        }
    };

    const handleGuestLogin = (e) => {
        e.preventDefault();
        
        // Refresh mosques list from storage right before checking
        // This ensures we have the absolute latest data even if something changed externally
        const currentMosques = JSON.parse(localStorage.getItem('registered_mosques') || '[]');
        setMosques(currentMosques);

        const mosque = currentMosques.find(m => m.secretCode === guestCode);

        if (mosque) {
            onLogin({
                ...mosque,
                role: 'guest'
            });
        } else {
            setError('Invalid Secret Code. Please check and try again.');
        }
    };

    const handleSuperAdminLogin = (e) => {
        e.preventDefault();
        
        // Hardcoded Super Admin Credentials
        if (adminCreds.username === 'mmadmin' && adminCreds.password === 'sahil@96618') {
            onLogin({
                id: 'super_admin',
                name: 'Super Admin',
                role: 'super_admin'
            });
        } else {
            setError('Invalid Super Admin credentials');
        }
    };

    if (mode === 'super-admin-login') {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <button className="back-btn" onClick={() => setMode('login')}>
                        ← Back to Login
                    </button>
                    <div className="auth-header">
                        <span className="auth-logo">🛡️</span>
                        <h2 className="auth-title">Super Admin</h2>
                        <p className="auth-subtitle">Owner Access Only</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSuperAdminLogin}>
                        {error && <div className="error-message">{error}</div>}
                        
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                className="form-input"
                                value={adminCreds.username}
                                onChange={(e) => {
                                    setAdminCreds({ ...adminCreds, username: e.target.value });
                                    setError('');
                                }}
                                placeholder="Username"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={adminCreds.password}
                                onChange={(e) => {
                                    setAdminCreds({ ...adminCreds, password: e.target.value });
                                    setError('');
                                }}
                                placeholder="Password"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#1e293b' }}>
                            Login as Owner
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (mode === 'guest-login') {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <button className="back-btn" onClick={() => setMode('login')}>
                        ← Back to Login
                    </button>
                    <div className="auth-header">
                        <span className="auth-logo">👁️</span>
                        <h2 className="auth-title">Guest Access</h2>
                        <p className="auth-subtitle">Enter the secret code to view mosque data</p>
                    </div>

                    <form className="auth-form" onSubmit={handleGuestLogin}>
                        {error && <div className="error-message">{error}</div>}
                        
                        <div className="form-group">
                            <label>Secret Code</label>
                            <input
                                type="text"
                                className="form-input"
                                value={guestCode}
                                onChange={(e) => {
                                    setGuestCode(e.target.value);
                                    setError('');
                                }}
                                placeholder="Enter secret code provided by mosque admin"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Access Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <span className="auth-logo">🕌</span>
                    <h2 className="auth-title">Masjid Manager</h2>
                    <p className="auth-subtitle">Donation & Expense Tracking System</p>
                </div>

                <div className="auth-tabs">
                    <button 
                        className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                        onClick={() => { setMode('login'); setError(''); }}
                    >
                        Login
                    </button>
                    <button 
                        className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
                        onClick={() => { setMode('register'); setError(''); }}
                    >
                        Register Mosque
                    </button>
                </div>

                <form className="auth-form" onSubmit={mode === 'login' ? handleLogin : handleRegister}>
                    {error && <div className="error-message">{error}</div>}

                    {mode === 'register' && (
                        <>
                            <div className="form-group">
                                <label>Mosque Name</label>
                                <input
                                    type="text"
                                    name="mosqueName"
                                    className="form-input"
                                    value={formData.mosqueName}
                                    onChange={handleChange}
                                    placeholder="e.g. Jama Masjid"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    className="form-input"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Mosque Location"
                                />
                            </div>

                            <div className="form-group">
                                <label>Secret Code (for Guest Access)</label>
                                <input
                                    type="text"
                                    name="secretCode"
                                    className="form-input"
                                    value={formData.secretCode}
                                    onChange={handleChange}
                                    placeholder="e.g. 7860 or secret123"
                                    required
                                />
                                <small style={{ display: 'block', marginTop: '4px', color: 'var(--text-muted)' }}>
                                    Share this code with members for read-only access.
                                </small>
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Email / Phone</label>
                        <input
                            type="text"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email or phone number"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    {mode === 'register' && (
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="form-input"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm password"
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        {mode === 'login' ? 'Login' : 'Register Mosque'}
                    </button>
                </form>

                <div className="auth-footer">
                    <button className="guest-access-btn" onClick={() => setMode('guest-login')}>
                        👁️ View as Guest (Read Only)
                    </button>
                    <div style={{ marginTop: '10px', fontSize: '0.8rem' }}>
                        <button className="text-btn" onClick={() => setMode('super-admin-login')} style={{ color: '#94a3b8' }}>
                            Owner Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Auth;
