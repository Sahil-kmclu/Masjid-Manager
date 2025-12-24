import { useState, useEffect } from 'react';

function MosqueProfile({ user, onUpdateProfile }) {
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
            setFormData({
                name: user.name || '',
                address: user.address || '',
                phone: user.phone || '',
                email: user.email || '',
                secretCode: user.secretCode || ''
            });

            // Check for pending deletion request
            const requests = JSON.parse(localStorage.getItem('deletion_requests') || '[]');
            const isPending = requests.some(req => req.mosqueId === user.id);
            setHasPendingDeletion(isPending);
        }
    }, [user]);

    const handleDeleteRequest = () => {
        if (!user.phone) {
            alert('Please add a phone number to your profile first to receive OTP.');
            return;
        }

        // 1. Generate OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        
        // 2. Simulate sending OTP
        alert(`[SIMULATED SMS] Your OTP for Account Deletion Request is: ${otp}`);

        // 3. Prompt for OTP
        const inputOtp = window.prompt(`Enter the OTP sent to ${user.phone}:`);

        // 4. Verify
        if (inputOtp === otp) {
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
        } else {
            if (inputOtp !== null) { // If user didn't cancel
                alert('Invalid OTP. Deletion request cancelled.');
            }
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            setMessage({ type: 'error', text: 'Mosque Name is required' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!formData.secretCode.trim()) {
            setMessage({ type: 'error', text: 'Secret Code is required' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        onUpdateProfile({
            ...user,
            ...formData
        });

        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
            setMessage({ type: '', text: '' });
        }, 3000);
    };

    return (
        <div className="mosque-profile fade-in">
            <div className="page-header">
                <h2>🕌 Mosque Profile</h2>
                <p className="text-muted">Manage your mosque details and access settings</p>
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
                            <label className="form-label">Mosque Name *</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Mosque Name"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Address</label>
                            <input
                                type="text"
                                name="address"
                                className="form-input"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Full Address"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email Address"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input
                                type="text"
                                name="phone"
                                className="form-input"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Phone Number"
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '20px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <label className="form-label" style={{ color: '#475569' }}>🔒 Secret Code (For Guest Access)</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                                type="text"
                                name="secretCode"
                                className="form-input"
                                value={formData.secretCode}
                                onChange={handleChange}
                                placeholder="Secret Code"
                                style={{ fontWeight: 'bold', letterSpacing: '1px' }}
                            />
                            <div style={{ fontSize: '0.85rem', color: '#64748b', flex: 1 }}>
                                Share this code with members. They can use it to view the dashboard in Read-Only mode.
                            </div>
                        </div>
                    </div>

                    <div className="form-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>

            <div className="card" style={{ maxWidth: '800px', marginTop: '30px', border: '1px solid #fee2e2' }}>
                <h3 style={{ color: '#dc2626', marginBottom: '15px' }}>⚠️ Danger Zone</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '5px' }}>Delete Mosque Account</h4>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                            Once you delete your account, there is no going back. Please be certain.
                            <br />
                            This will require OTP verification sent to your registered mobile number.
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
                            ⏳ Deletion Request Pending
                        </div>
                    ) : (
                        <button 
                            type="button" 
                            className="btn btn-danger" 
                            onClick={handleDeleteRequest}
                            style={{ background: '#dc2626', color: 'white' }}
                        >
                            Request Account Deletion
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MosqueProfile;
