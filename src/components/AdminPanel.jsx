import { useState, useEffect } from 'react';
import './AdminPanel.css';

function AdminPanel({ members, payments, onUpdateSettings, onImportData, onClearData }) {
    const [settings, setSettings] = useState({
        masjidName: 'Churaman Chak Bhatwaliya Masjid',
        defaultMonthlyAmount: 500,
        adminPassword: '',
        contactPhone: '',
        contactEmail: '',
    });

    useEffect(() => {
        const savedSettings = localStorage.getItem('masjid_settings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    const handleSettingsChange = (field, value) => {
        const newSettings = { ...settings, [field]: value };
        setSettings(newSettings);
    };

    const handleSaveSettings = () => {
        localStorage.setItem('masjid_settings', JSON.stringify(settings));
        if (onUpdateSettings) {
            onUpdateSettings(settings);
        }
        alert('Settings saved successfully!');
    };

    const handleExportData = () => {
        const data = {
            members,
            payments,
            settings,
            exportDate: new Date().toISOString(),
        };

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `masjid-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert('Data exported successfully!');
    };

    const handleImportData = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (window.confirm('This will replace all existing data. Are you sure?')) {
                    if (data.members) {
                        localStorage.setItem('masjid_members', JSON.stringify(data.members));
                    }
                    if (data.payments) {
                        localStorage.setItem('masjid_payments', JSON.stringify(data.payments));
                    }
                    if (data.settings) {
                        localStorage.setItem('masjid_settings', JSON.stringify(data.settings));
                        setSettings(data.settings);
                    }

                    alert('Data imported successfully! Please refresh the page.');
                    window.location.reload();
                }
            } catch (error) {
                alert('Error importing data. Please check the file format.');
                console.error(error);
            }
        };
        reader.readAsText(file);
    };

    const handleClearAllData = () => {
        const confirmed = window.confirm(
            'WARNING: This will delete ALL data (members, payments, settings). This action cannot be undone. Are you absolutely sure?'
        );

        if (confirmed) {
            const doubleConfirm = window.prompt(
                'Type "DELETE ALL" to confirm this action:'
            );

            if (doubleConfirm === 'DELETE ALL') {
                localStorage.removeItem('masjid_members');
                localStorage.removeItem('masjid_payments');
                localStorage.removeItem('masjid_settings');
                alert('All data has been cleared. The page will now reload.');
                window.location.reload();
            } else {
                alert('Action cancelled.');
            }
        }
    };

    const stats = {
        totalMembers: members.length,
        totalPayments: payments.length,
        totalAmount: payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
        dataSize: new Blob([
            JSON.stringify({ members, payments, settings })
        ]).size,
    };

    return (
        <div className="admin-panel fade-in">
            <div className="page-header">
                <h2>Admin Panel</h2>
                <p className="text-muted">Manage system settings and data</p>
            </div>

            {/* Statistics Overview */}
            <div className="admin-section">
                <h3>📊 System Statistics</h3>
                <div className="grid grid-cols-4">
                    <div className="card stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            👥
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Total Members</div>
                            <div className="stat-value">{stats.totalMembers}</div>
                        </div>
                    </div>

                    <div className="card stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                            💰
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Total Payments</div>
                            <div className="stat-value">{stats.totalPayments}</div>
                        </div>
                    </div>

                    <div className="card stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                            ₹
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Total Collected</div>
                            <div className="stat-value">₹{stats.totalAmount.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="card stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                            💾
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Data Size</div>
                            <div className="stat-value">{(stats.dataSize / 1024).toFixed(2)} KB</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Settings */}
            <div className="admin-section">
                <h3>⚙️ System Settings</h3>
                <div className="card">
                    <div className="settings-grid">
                        <div className="form-group">
                            <label className="form-label">Masjid Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={settings.masjidName}
                                onChange={(e) => handleSettingsChange('masjidName', e.target.value)}
                                placeholder="Enter masjid name"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Default Monthly Amount (₹)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={settings.defaultMonthlyAmount}
                                onChange={(e) => handleSettingsChange('defaultMonthlyAmount', e.target.value)}
                                placeholder="500"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Contact Phone</label>
                            <input
                                type="tel"
                                className="form-input"
                                value={settings.contactPhone}
                                onChange={(e) => handleSettingsChange('contactPhone', e.target.value)}
                                placeholder="Enter contact number"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Contact Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={settings.contactEmail}
                                onChange={(e) => handleSettingsChange('contactEmail', e.target.value)}
                                placeholder="email@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Admin Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={settings.adminPassword}
                                onChange={(e) => handleSettingsChange('adminPassword', e.target.value)}
                                placeholder="Set admin password"
                            />
                            <small className="form-hint">Used for future admin login protection</small>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button className="btn btn-primary" onClick={handleSaveSettings}>
                            💾 Save Settings
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Management */}
            <div className="admin-section">
                <h3>💾 Data Management</h3>
                <div className="grid grid-cols-2">
                    <div className="card">
                        <h4>Export Data</h4>
                        <p className="text-muted">Download all data as JSON backup file</p>
                        <button className="btn btn-success" onClick={handleExportData}>
                            ⬇️ Export Backup
                        </button>
                    </div>

                    <div className="card">
                        <h4>Import Data</h4>
                        <p className="text-muted">Restore data from backup file</p>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImportData}
                            style={{ display: 'none' }}
                            id="import-file"
                        />
                        <label htmlFor="import-file" className="btn btn-primary" style={{ cursor: 'pointer' }}>
                            ⬆️ Import Backup
                        </label>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="admin-section">
                <h3>⚠️ Danger Zone</h3>
                <div className="card danger-card">
                    <h4>Clear All Data</h4>
                    <p className="text-muted">
                        Permanently delete all members, payments, and settings. This action cannot be undone!
                    </p>
                    <button className="btn btn-danger" onClick={handleClearAllData}>
                        🗑️ Clear All Data
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="admin-section">
                <h3>🚀 Quick Actions</h3>
                <div className="card">
                    <div className="quick-actions-grid">
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                const data = localStorage.getItem('masjid_members');
                                console.log('Members Data:', JSON.parse(data || '[]'));
                                alert('Check browser console (F12) for members data');
                            }}
                        >
                            🔍 View Members Data
                        </button>

                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                const data = localStorage.getItem('masjid_payments');
                                console.log('Payments Data:', JSON.parse(data || '[]'));
                                alert('Check browser console (F12) for payments data');
                            }}
                        >
                            🔍 View Payments Data
                        </button>

                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                window.location.reload();
                            }}
                        >
                            🔄 Refresh Application
                        </button>

                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                const usage = {
                                    membersCount: members.length,
                                    paymentsCount: payments.length,
                                    storageUsed: (stats.dataSize / 1024).toFixed(2) + ' KB',
                                    lastUpdate: new Date().toLocaleString(),
                                };
                                alert(JSON.stringify(usage, null, 2));
                            }}
                        >
                            📈 Storage Info
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminPanel;
