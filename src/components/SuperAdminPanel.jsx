import { useState, useEffect } from 'react';

function SuperAdminPanel({ onLogout }) {
    const [mosques, setMosques] = useState([]);
    const [requests, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('requests'); // requests, mosques

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const savedMosques = JSON.parse(localStorage.getItem('registered_mosques') || '[]');
        const savedRequests = JSON.parse(localStorage.getItem('deletion_requests') || '[]');
        setMosques(savedMosques);
        setRequests(savedRequests);
    };

    const handleApproveDelete = (request) => {
        if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE ${request.mosqueName}? This action cannot be undone.`)) {
            return;
        }

        // 1. Remove from registered_mosques
        const updatedMosques = mosques.filter(m => m.id !== request.mosqueId);
        localStorage.setItem('registered_mosques', JSON.stringify(updatedMosques));

        // 2. Remove from deletion_requests
        const updatedRequests = requests.filter(r => r.id !== request.id);
        localStorage.setItem('deletion_requests', JSON.stringify(updatedRequests));

        // 3. Clean up mosque specific data (optional but good practice)
        // We can't easily iterate all keys, but we can rely on the fact that without the user record, they can't login.
        // Or we could loop through keys if we knew the ID format.
        // For now, removing the user record is sufficient to deny access.
        
        loadData();
        alert('Mosque account deleted successfully.');
    };

    const handleRejectDelete = (requestId) => {
        if (!window.confirm('Reject this deletion request?')) {
            return;
        }

        // Just remove the request
        const updatedRequests = requests.filter(r => r.id !== requestId);
        localStorage.setItem('deletion_requests', JSON.stringify(updatedRequests));
        
        loadData();
    };

    return (
        <div className="super-admin-panel fade-in">
            <header className="app-header" style={{ background: '#1e293b', color: 'white' }}>
                <div className="header-left">
                    <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                    <h1>Super Admin Panel</h1>
                </div>
                <div className="header-right">
                    <button className="btn btn-danger" onClick={onLogout} style={{ padding: '8px 16px' }}>
                        Logout
                    </button>
                </div>
            </header>

            <div className="container" style={{ padding: '20px' }}>
                <div className="tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button 
                        className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('requests')}
                        style={{ background: activeTab !== 'requests' ? '#e2e8f0' : '', color: activeTab !== 'requests' ? '#64748b' : '' }}
                    >
                        Deletion Requests 
                        {requests.length > 0 && (
                            <span style={{ 
                                background: '#ef4444', 
                                color: 'white', 
                                borderRadius: '50%', 
                                padding: '2px 6px', 
                                fontSize: '0.8rem', 
                                marginLeft: '8px' 
                            }}>
                                {requests.length}
                            </span>
                        )}
                    </button>
                    <button 
                        className={`btn ${activeTab === 'mosques' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('mosques')}
                        style={{ background: activeTab !== 'mosques' ? '#e2e8f0' : '', color: activeTab !== 'mosques' ? '#64748b' : '' }}
                    >
                        All Mosques
                    </button>
                </div>

                {activeTab === 'requests' && (
                    <div className="card">
                        <h3>Pending Deletion Requests</h3>
                        {requests.length === 0 ? (
                            <p className="text-muted">No pending requests.</p>
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Mosque Name</th>
                                            <th>Phone</th>
                                            <th>Requested At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map(req => (
                                            <tr key={req.id}>
                                                <td>{req.mosqueName}</td>
                                                <td>{req.phone}</td>
                                                <td>{new Date(req.timestamp).toLocaleDateString()}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <button 
                                                            className="btn btn-danger" 
                                                            onClick={() => handleApproveDelete(req)}
                                                            style={{ padding: '5px 10px', fontSize: '0.9rem' }}
                                                        >
                                                            Accept & Delete
                                                        </button>
                                                        <button 
                                                            className="btn" 
                                                            onClick={() => handleRejectDelete(req.id)}
                                                            style={{ padding: '5px 10px', fontSize: '0.9rem', background: '#cbd5e1', color: '#334155' }}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'mosques' && (
                    <div className="card">
                        <h3>Registered Mosques ({mosques.length})</h3>
                        {mosques.length === 0 ? (
                            <p className="text-muted">
                                No registered mosques found in local registry.<br />
                                <small>
                                    Mosques will appear here after they are registered or logged in on this
                                    device.
                                </small>
                            </p>
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Address</th>
                                            <th>Phone</th>
                                            <th>Email</th>
                                            <th>Secret Code</th>
                                            <th>Registered At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mosques.map(mosque => (
                                            <tr key={mosque.id}>
                                                <td>{mosque.name}</td>
                                                <td>{mosque.address}</td>
                                                <td>{mosque.phone}</td>
                                                <td>{mosque.email}</td>
                                                <td><code>{mosque.secretCode}</code></td>
                                                <td>{new Date(mosque.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SuperAdminPanel;
