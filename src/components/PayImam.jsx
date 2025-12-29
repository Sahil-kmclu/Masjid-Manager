import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import { verifyOTP } from '../utils/otp';
import './ImamSalary.css';

function PayImam({ imams = [], imamPayouts = [], onAddImam, onUpdateImam, onDeleteImam, onAddPayout, onDeletePayout, isReadOnly }) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('payouts');
    const [selectedImamId, setSelectedImamId] = useState('');
    
    // Auto-select first imam if available and none selected
    useEffect(() => {
        if (!selectedImamId && imams.length > 0) {
            setSelectedImamId(imams[0].id);
        }
        // If no imams, force to registration tab
        if (imams.length === 0) {
            setActiveTab('imams');
        }
    }, [imams, selectedImamId]);

    // --- Imam Registration Logic ---
    const [showImamForm, setShowImamForm] = useState(false);
    const [editingImam, setEditingImam] = useState(null);
    const [imamFormData, setImamFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        monthlySalary: '',
        joiningDate: new Date().toISOString().split('T')[0]
    });

    const handleImamSubmit = async (e) => {
        e.preventDefault();
        const data = {
            ...imamFormData,
            monthlySalary: parseFloat(imamFormData.monthlySalary) || 0
        };

        if (editingImam) {
            const isVerified = await verifyOTP(editingImam.mobile, 'update this Imam profile');
            if (!isVerified) return;
            onUpdateImam(editingImam.id, data);
        } else {
            onAddImam(data);
        }

        setShowImamForm(false);
        setEditingImam(null);
        setImamFormData({
            name: '',
            mobile: '',
            email: '',
            monthlySalary: '',
            joiningDate: new Date().toISOString().split('T')[0]
        });
        
        // Switch to payouts tab after successful registration if it's the first one
        if (imams.length === 0) {
            setActiveTab('payouts');
        }
    };

    const startEditImam = (imam) => {
        setEditingImam(imam);
        setImamFormData({
            name: imam.name,
            mobile: imam.mobile,
            email: imam.email,
            monthlySalary: imam.monthlySalary,
            joiningDate: imam.joiningDate
        });
        setShowImamForm(true);
    };

    // --- Payout Logic ---
    const [showPayoutForm, setShowPayoutForm] = useState(false);
    const currentDate = new Date();
    const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    const [payoutFormData, setPayoutFormData] = useState({
        month: currentMonthStr,
        amount: '',
        paymentDate: currentDate.toISOString().split('T')[0],
        notes: ''
    });

    // Calculate status for the selected month in the form
    const selectedImam = imams.find(i => i.id === selectedImamId);
    
    const paymentStatus = useMemo(() => {
        if (!selectedImam || !payoutFormData.month) return { total: 0, paid: 0, due: 0, isFullyPaid: false };
        
        const salary = parseFloat(selectedImam.monthlySalary) || 0;
        const paidInMonth = imamPayouts
            .filter(p => p.imamId === selectedImamId && p.month === payoutFormData.month)
            .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
            
        const due = Math.max(0, salary - paidInMonth);
        
        return {
            total: salary,
            paid: paidInMonth,
            due: due,
            isFullyPaid: due === 0 && salary > 0
        };
    }, [selectedImam, payoutFormData.month, imamPayouts, selectedImamId]);

    // Calculate General Stats (Total Months, Paid Months, Pending Months)
    const imamStats = useMemo(() => {
        if (!selectedImam) return { totalMonths: 0, paidMonths: 0, pendingMonths: 0 };

        const joiningDate = new Date(selectedImam.joiningDate);
        const today = new Date();
        const startYear = joiningDate.getFullYear();
        const startMonth = joiningDate.getMonth();
        const endYear = today.getFullYear();
        const endMonth = today.getMonth();

        let totalMonths = 0;
        let paidMonths = 0;
        let pendingMonths = 0;

        // Iterate through each month from joining date to current month
        let currentIterYear = startYear;
        let currentIterMonth = startMonth;

        while (currentIterYear < endYear || (currentIterYear === endYear && currentIterMonth <= endMonth)) {
            totalMonths++;
            
            const monthStr = `${currentIterYear}-${String(currentIterMonth + 1).padStart(2, '0')}`;
            const salary = parseFloat(selectedImam.monthlySalary) || 0;
            
            const paidInThisMonth = imamPayouts
                .filter(p => p.imamId === selectedImam.id && p.month === monthStr)
                .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

            if (salary > 0 && paidInThisMonth >= salary) {
                paidMonths++;
            } else {
                pendingMonths++;
            }

            // Move to next month
            currentIterMonth++;
            if (currentIterMonth > 11) {
                currentIterMonth = 0;
                currentIterYear++;
            }
        }

        return { totalMonths, paidMonths, pendingMonths };
    }, [selectedImam, imamPayouts]);


    // Auto-fill amount with due amount when month changes
    useEffect(() => {
        if (showPayoutForm && paymentStatus.due > 0) {
            setPayoutFormData(prev => ({ ...prev, amount: paymentStatus.due }));
        } else if (showPayoutForm && paymentStatus.due === 0) {
             setPayoutFormData(prev => ({ ...prev, amount: '' }));
        }
    }, [paymentStatus.due, showPayoutForm, payoutFormData.month]);

    const handlePayoutSubmit = (e) => {
        e.preventDefault();
        if (!payoutFormData.amount || !payoutFormData.month || !selectedImamId) return;

        // Prevent payment if fully paid
        if (paymentStatus.isFullyPaid) {
            alert(t('This month is already fully paid.'));
            return;
        }

        // Prevent overpayment (optional but good UX)
        if (parseFloat(payoutFormData.amount) > paymentStatus.due) {
            if (!window.confirm(t('The amount exceeds the due salary. Do you want to proceed?'))) {
                return;
            }
        }

        onAddPayout({
            ...payoutFormData,
            imamId: selectedImamId,
            amount: parseFloat(payoutFormData.amount)
        });

        setShowPayoutForm(false);
        setPayoutFormData({
            month: currentMonthStr,
            amount: '',
            paymentDate: new Date().toISOString().split('T')[0],
            notes: ''
        });
        alert(t('Payment recorded successfully'));
    };

    // Filter payouts for list
    const filteredPayouts = useMemo(() => {
        let filtered = [...imamPayouts];
        if (selectedImamId) {
            filtered = filtered.filter(p => p.imamId === selectedImamId);
        }
        return filtered.sort((a, b) => b.month.localeCompare(a.month));
    }, [imamPayouts, selectedImamId]);

    const formatMonth = (monthStr) => {
        if (!monthStr) return '-';
        const [year, month] = monthStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
    };

    // Get min month for input (joining date)
    const minMonth = selectedImam ? selectedImam.joiningDate.slice(0, 7) : '';

    const generateReceipt = (payout, imam) => {
        const doc = new jsPDF();
        const currentUser = JSON.parse(localStorage.getItem('masjid_current_user') || '{}');
        const mosqueName = currentUser.name || 'Mosque Payment Receipt';
        
        // Header
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text(mosqueName, 105, 20, { align: 'center' });
        
        doc.setFontSize(16);
        doc.text('Salary Payment Receipt', 105, 30, { align: 'center' });
        
        // Date
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 40, { align: 'center' });
        
        // Line
        doc.setLineWidth(0.5);
        doc.line(20, 45, 190, 45);
        
        // Details
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        
        let y = 60;
        const addLine = (label, value) => {
            doc.setFont('helvetica', 'bold');
            doc.text(`${label}:`, 20, y);
            doc.setFont('helvetica', 'normal');
            doc.text(String(value || '-'), 70, y);
            y += 10;
        };
        
        addLine('Receipt No', payout.id.slice(-6).toUpperCase());
        addLine('Payment Date', new Date(payout.paymentDate).toLocaleDateString());
        addLine('Imam Name', imam.name);
        addLine('Mobile', imam.mobile);
        addLine('Salary Month', formatMonth(payout.month));
        addLine('Amount Paid', `Rs. ${parseFloat(payout.amount).toLocaleString()}`);
        if (payout.notes) {
            addLine('Notes', payout.notes);
        }
        
        // Footer
        doc.setLineWidth(0.5);
        doc.line(20, y + 20, 190, y + 20);
        
        doc.setFontSize(10);
        doc.text('Authorized Signature', 150, y + 30, { align: 'center' });
        doc.text('Receiver Signature', 50, y + 30, { align: 'center' });
        
        doc.save(`Salary_Receipt_${imam.name}_${payout.month}.pdf`);
    };

    const shareViaWhatsApp = (payout, imam) => {
        // First download the PDF
        generateReceipt(payout, imam);
        
        // Show instruction
        alert(t('PDF Receipt downloaded. Please attach it to the WhatsApp message.'));
        
        const currentUser = JSON.parse(localStorage.getItem('masjid_current_user') || '{}');
        const mosqueName = currentUser.name || t('Mosque Payment');
        
        const message = encodeURIComponent(
            `*${mosqueName} - ${t('Salary Payment')}*\n\n` +
            `${t('Imam Name')}: ${imam.name}\n` +
            `${t('Month')}: ${formatMonth(payout.month)}\n` +
            `${t('Amount Paid')}: Rs. ${parseFloat(payout.amount).toLocaleString()}\n` +
            `${t('Date')}: ${new Date(payout.paymentDate).toLocaleDateString()}\n\n` +
            `${t('Payment receipt attached.')}`
        );
        
        const url = imam.mobile 
            ? `https://wa.me/${imam.mobile.length === 10 ? '91' + imam.mobile : imam.mobile}?text=${message}`
            : `https://wa.me/?text=${message}`;
            
        window.open(url, '_blank');
    };

    const handleDeleteImam = async (imam) => {
        const isVerified = await verifyOTP(imam.mobile, 'delete this Imam profile');
        if (isVerified) {
            onDeleteImam(imam.id);
        }
    };

    const handleDeletePayout = async (payout) => {
        // Verify with the selected Imam's phone (since we are in their view)
        const phoneToVerify = selectedImam?.mobile;
        
        const isVerified = await verifyOTP(phoneToVerify, 'delete this salary payment record');
        if (isVerified) {
            onDeletePayout(payout.id);
        }
    };

    return (
        <div className="imam-salary fade-in">
            <div className="page-header">
                <div>
                    <h2>{t('Pay Imam')}</h2>
                    <p className="text-muted">{t('Manage Imam profiles and salary payouts')}</p>
                </div>
                <div className="tab-buttons">
                    <button 
                        className={`btn ${activeTab === 'payouts' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('payouts')}
                        disabled={imams.length === 0}
                    >
                        {t('Salary Payouts')}
                    </button>
                    <button 
                        className={`btn ${activeTab === 'imams' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('imams')}
                        style={{ marginLeft: '10px' }}
                    >
                        {t('Imam Profiles')}
                    </button>
                </div>
            </div>

            {/* --- IMAM PROFILES TAB --- */}
            {activeTab === 'imams' && (
                <div>
                    <div className="action-bar mb-4">
                        <h3>{t('Registered Imams')}</h3>
                        {!isReadOnly && !showImamForm && (
                            <button className="btn btn-primary" onClick={() => {
                                window.history.pushState({ view: 'pay-imam', modal: 'add-imam' }, '', '');
                                setEditingImam(null);
                                setImamFormData({
                                    name: '',
                                    mobile: '',
                                    email: '',
                                    monthlySalary: '',
                                    joiningDate: new Date().toISOString().split('T')[0]
                                });
                                setShowImamForm(true);
                            }}>
                                {t('Register New Imam')} ➕
                            </button>
                        )}
                    </div>

                    {showImamForm && (
                        <div className="card mb-4">
                            <div className="card-header">
                                <h3>{editingImam ? t('Edit Imam Details') : t('Register New Imam')}</h3>
                                <button className="btn btn-sm btn-secondary" onClick={() => window.history.back()}>✕</button>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleImamSubmit}>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>{t('Full Name')}</label>
                                            <input 
                                                type="text" 
                                                className="form-input"
                                                value={imamFormData.name}
                                                onChange={e => setImamFormData({...imamFormData, name: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('Mobile Number')}</label>
                                            <input 
                                                type="tel" 
                                                className="form-input"
                                                value={imamFormData.mobile}
                                                onChange={e => setImamFormData({...imamFormData, mobile: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('Gmail / Email')}</label>
                                            <input 
                                                type="email" 
                                                className="form-input"
                                                value={imamFormData.email}
                                                onChange={e => setImamFormData({...imamFormData, email: e.target.value})}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('Monthly Salary')} (₹)</label>
                                            <input 
                                                type="number" 
                                                className="form-input"
                                                value={imamFormData.monthlySalary}
                                                onChange={e => setImamFormData({...imamFormData, monthlySalary: e.target.value})}
                                                required
                                                min="0"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('Joining Date')}</label>
                                            <input 
                                                type="date" 
                                                className="form-input"
                                                value={imamFormData.joiningDate}
                                                onChange={e => setImamFormData({...imamFormData, joiningDate: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-actions mt-3">
                                        <button type="submit" className="btn btn-primary">{t('Save Details')}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="grid-view">
                        {imams.map(imam => (
                            <div key={imam.id} className="card member-card">
                                <div className="card-header">
                                    <h3>{imam.name}</h3>
                                    {!isReadOnly && (
                                        <div className="card-actions">
                                            <button onClick={() => startEditImam(imam)} title={t("Edit")}>✏️</button>
                                            <button 
                                                onClick={() => handleDeleteImam(imam)} 
                                                title={t("Delete")}
                                                className="delete-btn"
                                            >🗑️</button>
                                        </div>
                                    )}
                                </div>
                                <div className="card-body">
                                    <p><strong>📱 {t('Mobile')}:</strong> {imam.mobile}</p>
                                    <p><strong>📧 {t('Email')}:</strong> {imam.email || '-'}</p>
                                    <p><strong>💰 {t('Salary')}:</strong> ₹{imam.monthlySalary}</p>
                                    <p><strong>📅 {t('Joined')}:</strong> {new Date(imam.joiningDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                        {imams.length === 0 && !showImamForm && (
                            <div className="empty-state">
                                <p>{t('No Imams registered yet. Please register an Imam first.')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- PAYOUTS TAB --- */}
            {activeTab === 'payouts' && (
                <div>
                    {/* Imam Selector */}
                    <div className="mb-4">
                        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>{t('Select Imam:')}</label>
                        <select 
                            className="form-input" 
                            style={{ width: 'auto', display: 'inline-block' }}
                            value={selectedImamId}
                            onChange={(e) => setSelectedImamId(e.target.value)}
                        >
                            {imams.map(imam => (
                                <option key={imam.id} value={imam.id}>{imam.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedImam && (
                        <>
                        <div className="card mb-4 summary-card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white' }}>
                            <div className="card-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{selectedImam.name}</h3>
                                        <p style={{ margin: 0, opacity: 0.9 }}>{t('Monthly Salary')}: ₹{selectedImam.monthlySalary}</p>
                                    </div>
                                    {!isReadOnly && !showPayoutForm && (
                                        <button 
                                            className="btn" 
                                            style={{ background: 'white', color: '#1d4ed8', border: 'none' }}
                                            onClick={() => setShowPayoutForm(true)}
                                        >
                                            {t('Record New Payment')} ➕
                                        </button>
                                    )}
                                </div>
                                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '15px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t('Total Months')}</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{imamStats.totalMonths}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t('Paid Months')}</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{imamStats.paidMonths}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t('Pending Months')}</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{imamStats.pendingMonths}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {showPayoutForm && (
                            <div className="card mb-4">
                                <div className="card-header">
                                    <h3>{t('Record Salary Payment')}</h3>
                                    <button className="btn btn-sm btn-secondary" onClick={() => setShowPayoutForm(false)}>✕</button>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={handlePayoutSubmit}>
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label>{t('Salary For Month')}</label>
                                                <input 
                                                    type="month" 
                                                    className="form-input"
                                                    value={payoutFormData.month}
                                                    onChange={e => setPayoutFormData({...payoutFormData, month: e.target.value})}
                                                    min={minMonth}
                                                    required
                                                />
                                            </div>
                                            
                                            {/* Status Indicator */}
                                            <div className="form-group" style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                    <span><strong>{t('Total Salary')}:</strong> ₹{paymentStatus.total}</span>
                                                    <span style={{ color: 'green' }}><strong>{t('Paid')}:</strong> ₹{paymentStatus.paid}</span>
                                                    <span style={{ color: paymentStatus.isFullyPaid ? 'green' : 'red' }}>
                                                        <strong>{paymentStatus.isFullyPaid ? t('Fully Paid') : t('Due')}:</strong> 
                                                        {!paymentStatus.isFullyPaid && ` ₹${paymentStatus.due}`}
                                                    </span>
                                                </div>
                                                {paymentStatus.isFullyPaid && (
                                                    <div style={{ color: 'green', fontSize: '0.85rem', marginTop: '5px' }}>
                                                        ✅ {t('This month is already fully paid.')}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="form-group">
                                                <label>{t('Amount to Pay')}</label>
                                                <input 
                                                    type="number" 
                                                    className="form-input"
                                                    value={payoutFormData.amount}
                                                    onChange={e => setPayoutFormData({...payoutFormData, amount: e.target.value})}
                                                    required
                                                    min="1"
                                                    disabled={paymentStatus.isFullyPaid}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>{t('Payment Date')}</label>
                                                <input 
                                                    type="date" 
                                                    className="form-input"
                                                    value={payoutFormData.paymentDate}
                                                    onChange={e => setPayoutFormData({...payoutFormData, paymentDate: e.target.value})}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>{t('Notes')}</label>
                                                <input 
                                                    type="text" 
                                                    className="form-input"
                                                    value={payoutFormData.notes}
                                                    onChange={e => setPayoutFormData({...payoutFormData, notes: e.target.value})}
                                                    placeholder={t('Optional notes')}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-actions mt-3">
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary"
                                                disabled={paymentStatus.isFullyPaid}
                                            >
                                                {t('Save Record')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                        </>
                    )}

                    {/* Payout History List */}
                    <div className="card">
                        <div className="card-header">
                            <h3>{t('Payment History')}</h3>
                        </div>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('Month')}</th>
                                        <th>{t('Amount')}</th>
                                        <th>{t('Payment Date')}</th>
                                        <th>{t('Notes')}</th>
                                        <th>{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayouts.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                                {t('No payout records found')}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPayouts.map(payout => (
                                            <tr key={payout.id}>
                                                <td style={{ fontWeight: 'bold' }}>{formatMonth(payout.month)}</td>
                                                <td className="amount-badge">₹{payout.amount}</td>
                                                <td>{new Date(payout.paymentDate).toLocaleDateString()}</td>
                                                <td>{payout.notes || '-'}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        onClick={() => generateReceipt(payout, selectedImam)}
                                                        title={t('Download Voucher')}
                                                        style={{ marginRight: '5px' }}
                                                    >
                                                        📄
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => shareViaWhatsApp(payout, selectedImam)}
                                                        title={t('Share via WhatsApp')}
                                                        style={{ marginRight: '5px', backgroundColor: '#25D366', borderColor: '#25D366', color: 'white' }}
                                                    >
                                                        📱
                                                    </button>
                                                    {!isReadOnly && (
                                                        <button 
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleDeletePayout(payout)}
                                                            title={t('Delete')}
                                                        >
                                                            🗑️
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PayImam;
