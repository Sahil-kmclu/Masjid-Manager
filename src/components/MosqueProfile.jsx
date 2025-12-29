import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { verifyOTP } from '../utils/otp';

function MosqueProfile({ user, onUpdateProfile }) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        secretCode: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [hasPendingDeletion, setHasPendingDeletion] = useState(false);

    useEffect(() => {
        if (user) {
            let email = user.email || '';
            let phone = user.phone || '';

            // Auto-fix: If email looks like a phone number (no @, mostly digits) and phone is empty
            // This fixes legacy data where phone was saved in email field
            if (email && !email.includes('@') && !phone) {
                // Check if it looks like a phone number (allow +, -, space, digits)
                const isPhoneNumber = /^[\d\s\+\-]+$/.test(email);
                if (isPhoneNumber) {
                    phone = email;
                    email = '';
                }
            }

            setFormData({
                name: user.name || '',
                address: user.address || '',
                phone: phone,
                email: email,
                secretCode: user.secretCode || ''
            });

            // Check for pending deletion request
            const requests = JSON.parse(localStorage.getItem('deletion_requests') || '[]');
            const isPending = requests.some(req => req.mosqueId === user.id);
            setHasPendingDeletion(isPending);
        }
    }, [user]);

    const handleDeleteRequest = async () => {
        if (!user.phone) {
            alert('Please add a phone number to your profile first to receive OTP.');
            return;
        }

        const isVerified = await verifyOTP(user.phone, 'request account deletion');
        
        if (isVerified) {
            // Save request
            const requests = JSON.parse(localStorage.getItem('deletion_requests') || '[]');
            
            // Avoid duplicates
            if (requests.some(req => req.mosqueId === user.id)) {
                alert('You already have a pending deletion request.');
                setHasPendingDeletion(true);
                return;
            }

            const newRequest = {
                id: Date.now().toString(),
                mosqueId: user.id,
                mosqueName: user.name,
                phone: user.phone,
                timestamp: new Date().toISOString(),
                status: 'pending'
            };

            localStorage.setItem('deletion_requests', JSON.stringify([...requests, newRequest]));
            setHasPendingDeletion(true);
            alert('Deletion request sent to Super Admin successfully.');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            setMessage({ type: 'error', text: t('Mosque Name is required') });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!formData.secretCode.trim()) {
            setMessage({ type: 'error', text: t('Secret Code is required') });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Verify OTP with current registered phone (before update)
        // If user has no phone, we can't verify, but maybe allow if it's the first setup?
        // Assuming user.phone exists if they are logged in and it's a critical action.
        // If user.phone is empty, verifyOTP handles the alert.
        const phoneToVerify = user.phone || formData.phone; // Fallback to new phone if old is empty (first time setup)
        
        const isVerified = await verifyOTP(phoneToVerify, 'update mosque profile');
        if (!isVerified) return;

        onUpdateProfile({
            ...user,
            ...formData
        });

        setMessage({ type: 'success', text: t('Profile updated successfully!') });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
            setMessage({ type: '', text: '' });
        }, 3000);
    };

    return (
        <div className="mosque-profile fade-in">
            <div className="page-header">
                <h2>🕌 {t('Mosque Profile')}</h2>
                <p className="text-muted">{t('Manage your mosque details and access settings')}</p>
            </div>

            <div className="card" style={{ maxWidth: '800px' }}>
                {message.text && (
                    <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`} 
                         style={{ 
                             padding: '12px', 
                             borderRadius: '8px', 
                             marginBottom: '20px',
                             backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7',
                             color: message.type === 'error' ? '#dc2626' : '#16a34a',
                             border: `1px solid ${message.type === 'error' ? '#fca5a5' : '#86efac'}`
                         }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2" style={{ gap: '20px' }}>
                        <div className="form-group">
                            <label className="form-label">{t('Mosque Name')} *</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder={t("Mosque Name")}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('Address')}</label>
                            <input
                                type="text"
                                name="address"
                                className="form-input"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder={t("Full Address")}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('Email')}</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={t("Email Address")}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('Phone')}</label>
                            <input
                                type="text"
                                name="phone"
                                className="form-input"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder={t("Phone Number")}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '20px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <label className="form-label" style={{ color: '#475569' }}>🔒 {t('Secret Code (For Guest Access)')}</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                                type="text"
                                name="secretCode"
                                className="form-input"
                                value={formData.secretCode}
                                onChange={handleChange}
                                placeholder={t("Secret Code")}
                                style={{ fontWeight: 'bold', letterSpacing: '1px' }}
                            />
                            <div style={{ fontSize: '0.85rem', color: '#64748b', flex: 1 }}>
                                {t('Share this code with members. They can use it to view the dashboard in Read-Only mode.')}
                            </div>
                        </div>
                    </div>

                    <div className="form-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary">
                            {t('Save Changes')}
                        </button>
                    </div>
                </form>
            </div>

            <div className="card" style={{ maxWidth: '800px', marginTop: '30px', border: '1px solid #fee2e2' }}>
                <h3 style={{ color: '#dc2626', marginBottom: '15px' }}>⚠️ {t('Danger Zone')}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '5px' }}>{t('Delete Mosque Account')}</h4>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                            {t('Once you delete your account, there is no going back. Please be certain.')}
                            <br />
                            {t('This will require OTP verification sent to your registered mobile number.')}
                        </p>
                    </div>
                    
                    {hasPendingDeletion ? (
                        <div style={{ 
                            background: '#fff7ed', 
                            color: '#c2410c', 
                            padding: '10px 15px', 
                            borderRadius: '6px', 
                            border: '1px solid #ffedd5',
                            fontWeight: '500'
                        }}>
                            ⏳ {t('Deletion Request Pending')}
                        </div>
                    ) : (
                        <button 
                            type="button" 
                            className="btn btn-danger" 
                            onClick={handleDeleteRequest}
                            style={{ background: '#dc2626', color: 'white' }}
                        >
                            {t('Request Account Deletion')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MosqueProfile;
