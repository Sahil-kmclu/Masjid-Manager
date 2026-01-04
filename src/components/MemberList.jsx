import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './MemberList.css';
import { generatePaymentReceipt, generatePendingSlip, sendWhatsAppMessage, calculatePendingMonths, generatePendingSlipPDF } from '../utils/receiptGenerator';
import { verifyOTP } from '../utils/otp';

function MemberList({ members = [], payments = [], imamSalaryPayments = [], onUpdateMember, onDeleteMember, onDeletePayment, onDeleteImamSalaryPayment, isReadOnly, user }) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({});

    // Handle back button for modals
    useEffect(() => {
        const handlePopState = () => {
            setEditMode(false);
            setEditData({});
            setSelectedMember(null);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const filteredMembers = useMemo(() => {
        return members.filter(member =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.phone.includes(searchTerm)
        );
    }, [members, searchTerm]);

    // Helper to safely get string ID from various formats
    const getSafeId = (val) => {
        if (!val) return '';
        if (typeof val === 'object' && val.id) return String(val.id);
        if (typeof val === 'object' && val._id) return String(val._id);
        return String(val);
    };

    const getMemberPayments = (member) => {
        // Handle if member is just an ID or object
        const targetId = getSafeId(member.id || member);
        const targetName = member.name || "";
        const targetPhone = member.phone || "";

        return (payments || []).filter(p => {
            if (!p) return false;
            // Match by ID
            if (getSafeId(p.memberId) === targetId) return true;
            // Fallback: Match by Name and Phone if available
            if (targetName && targetPhone && p.memberName === targetName && p.memberPhone === targetPhone) return true;
            return false;
        }).sort((a, b) => new Date(b.month) - new Date(a.month));
    };

    const getMemberImamSalaryPayments = (member) => {
        const sep2020 = new Date('2020-09-01');
        // Handle if member is just an ID or object
        const targetId = getSafeId(member.id || member);
        const targetName = member.name || "";
        const targetPhone = member.phone || "";
        
        return (imamSalaryPayments || []).filter(p => {
            if (!p || !p.month) return false;
            const paymentDate = new Date(p.month + '-01');
            if (paymentDate < sep2020) return false;

            // Match by ID
            if (getSafeId(p.memberId) === targetId) return true;
            
            // Fallback: Match by Name and Phone (very safe check)
            if (targetName && targetPhone && p.memberName === targetName && p.memberPhone === targetPhone) return true;
            
            // Fallback 2: Match by Name only if Name is unique enough (optional, but let's stick to name+phone for safety)
            // But some old records might miss phone. Let's trust Name if ID is missing in payment.
            if (targetName && p.memberName === targetName && !p.memberId) return true;

            return false;
        }).sort((a, b) => new Date(b.month) - new Date(a.month));
    };

    const getMemberMonthlyStats = (member) => {
        const memberPaymentsList = getMemberPayments(member);
        const memberImamSalaryList = getMemberImamSalaryPayments(member);

        // Calculate total paid from BOTH general payments AND Imam salary payments
        const totalFromGeneralPayments = memberPaymentsList.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const totalFromImamSalary = memberImamSalaryList.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const totalPaid = totalFromGeneralPayments + totalFromImamSalary;

        // Monthly contribution
        const monthlyAmount = parseFloat(member.monthlyAmount) || 0;

        // Months paid = Total ÷ Monthly Amount
        const monthsPaid = monthlyAmount > 0 ? Math.floor(totalPaid / monthlyAmount) : 0;

        // Calculate expected months from Joining Date (or Sep 2020) to current month
        const startDate = member.joiningDate ? new Date(member.joiningDate) : new Date('2020-09-01');
        const currentDate = new Date();

        const yearsDiff = currentDate.getFullYear() - startDate.getFullYear();
        const monthsDiff = currentDate.getMonth() - startDate.getMonth();
        const expectedMonths = Math.max(0, (yearsDiff * 12) + monthsDiff + 1);


        // Pending months
        const pendingMonths = Math.max(0, expectedMonths - monthsPaid);

        // Calculate amounts
        const expectedAmount = expectedMonths * monthlyAmount;
        const remainingAmount = Math.max(0, expectedAmount - totalPaid);

        // Completion percentage
        const completionPercentage = expectedMonths > 0
            ? Math.min(100, Math.round((monthsPaid / expectedMonths) * 100))
            : 0;

        // Status
        let status = t('No Payments');
        let statusColor = '#ef4444'; // red
        if (monthsPaid >= expectedMonths) {
            status = t('Fully Paid');
            statusColor = '#10b981'; // green
            if (monthsPaid > expectedMonths) {
                status = t('Fully Paid (+{{count}} months advance)', { count: monthsPaid - expectedMonths });
            }
        } else if (monthsPaid > 0) {
            status = t('{{count}} Months Pending', { count: pendingMonths });
            statusColor = '#f59e0b'; // yellow
        }

        return {
            totalPaid,
            monthsPaid,
            expectedMonths,
            pendingMonths,
            expectedAmount,
            remainingAmount,
            completionPercentage,
            status,
            statusColor
        };
    };

    const handleDownloadSlip = (member) => {
        try {
            const memberPayments = getMemberPayments(member);
            const memberImamSalary = getMemberImamSalaryPayments(member);
            const pendingMonthsList = calculatePendingMonths(memberPayments, memberImamSalary, member.joiningDate, member.monthlyAmount);
            
            // Generate PDF
            generatePendingSlipPDF(member, pendingMonthsList, user?.name);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert(t('Failed to generate PDF') + `: ${error.message || error}`);
        }
    };

    const handleShareWhatsApp = (member) => {
        const memberPayments = getMemberPayments(member);
        const memberImamSalary = getMemberImamSalaryPayments(member);
        const pendingMonthsList = calculatePendingMonths(memberPayments, memberImamSalary, member.joiningDate, member.monthlyAmount);
        
        const currentMonthStr = new Date().toISOString().slice(0, 7);
        const slipText = generatePendingSlip(member, currentMonthStr, pendingMonthsList, user?.name);

        sendWhatsAppMessage(member.phone, slipText);
    };

    const handleEdit = (member) => {
        setEditMode(true);
        // Ensure joiningDate is in YYYY-MM-DD format for the date input
        const formattedData = {
            ...member,
            joiningDate: member.joiningDate ? member.joiningDate.split('T')[0] : ''
        };
        setEditData(formattedData);
        window.history.pushState({ modal: 'edit-member' }, '', '');
    };

    const handleViewDetails = (member) => {
        if (selectedMember === member.id) {
            setSelectedMember(null);
        } else {
            setSelectedMember(member.id);
        }
    };

    const handleSaveEdit = async () => {
        const isVerified = await verifyOTP(editData.phone, 'update this member profile');
        if (isVerified) {
            onUpdateMember(editData.id, editData);
            alert(t('Member updated successfully!'));
            window.history.back();
        }
    };

    const handleDeleteMemberWrapper = async (member) => {
        const isVerified = await verifyOTP(member.phone, 'delete this member');
        if (isVerified) {
            onDeleteMember(member.id);
        }
    };

    const handleDeletePaymentWrapper = async (payment, member) => {
        const isVerified = await verifyOTP(member.phone, 'delete this payment record');
        if (isVerified) {
            onDeletePayment(payment.id);
            // We might need to refresh or force re-render, but props change should handle it
        }
    };

    const handleDeleteImamSalaryPaymentWrapper = async (payment, member) => {
        const isVerified = await verifyOTP(member.phone, 'delete this imam salary payment');
        if (isVerified) {
            onDeleteImamSalaryPayment(payment.id);
        }
    };

    const handleCancelEdit = () => {
        window.history.back();
    };

    const handleSendPendingSlip = (member) => {
        const memberPayments = getMemberPayments(member);
        const memberImamSalary = getMemberImamSalaryPayments(member);
        const pendingMonths = calculatePendingMonths(memberPayments, memberImamSalary, member.joiningDate, member.monthlyAmount);

        if (pendingMonths.length === 0) {
            alert(t('This member has no pending payments!'));
            return;
        }

        const slip = generatePendingSlip(member, pendingMonths[0], pendingMonths, user?.name);
        sendWhatsAppMessage(member.phone, slip);
    };


    return (
        <div className="member-list fade-in">
            <div className="page-header">
                <div>
                    <h2>{t('Member Management')}</h2>
                    <p className="text-muted">{t('View and manage all registered members')}</p>
                </div>
                <div className="search-box">
                    <input
                        type="text"
                        placeholder={t("Search by name or phone...")}
                        className="form-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {editMode && (
                <div className="modal-overlay" onClick={handleCancelEdit}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{t('Edit Member')}</h3>
                            <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">{t('Name')}</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('Phone')}</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={editData.phone}
                                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('Email')}</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={editData.email || ''}
                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('Monthly Amount (₹)')}</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={editData.monthlyAmount}
                                    onChange={(e) => setEditData({ ...editData, monthlyAmount: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('Joining Date')}</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={editData.joiningDate || ''}
                                    onChange={(e) => setEditData({ ...editData, joiningDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('Address')}</label>
                                <textarea
                                    className="form-textarea"
                                    value={editData.address || ''}
                                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={handleSaveEdit}>
                                {t('Save Changes')}
                            </button>
                            <button className="btn btn-secondary" onClick={handleCancelEdit}>
                                {t('Cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>{t('Name')}</th>
                                <th>{t('Phone')}</th>
                                <th>{t('Email')}</th>
                                <th>{t('Monthly Amount')}</th>
                                <th>{t('Total Payments')}</th>
                                <th>{t('Actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                        {searchTerm ? t('No members found matching your search') : t('No members added yet')}
                                    </td>
                                </tr>
                            ) : (
                                filteredMembers.map((member) => {
                                    // Pass full member object now
                                    const memberPayments = getMemberPayments(member);
                                    const stats = getMemberMonthlyStats(member);
                                    const isExpanded = selectedMember === member.id;

                                    return (
                                        <React.Fragment key={member.id}>
                                            <tr className={isExpanded ? "selected-row" : ""}>
                                                <td>
                                                    <div className="member-name">{member.name}</div>
                                                </td>
                                                <td>{member.phone}</td>
                                                <td>{member.email || '-'}</td>
                                                <td>
                                                    <span className="amount-badge">₹{member.monthlyAmount}</span>
                                                </td>
                                                <td>
                                                    <span className="badge badge-primary">{memberPayments.length}</span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button 
                                                            className="action-btn view-btn" 
                                                            title={isExpanded ? t("Close Details") : t("View Details")}
                                                            onClick={() => handleViewDetails(member)}
                                                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }}
                                                        >
                                                            {isExpanded ? '🔼' : '🔽'}
                                                        </button>
                                                        {!isReadOnly && (
                                                            <>
                                                                <button 
                                                                    className="action-btn edit-btn" 
                                                                    onClick={() => handleEdit(member)}
                                                                    title={t("Edit Member")}
                                                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }}
                                                                >
                                                                    ✏️
                                                                </button>
                                                                <button 
                                                                    className="action-btn delete-btn" 
                                                                    onClick={() => handleDeleteMemberWrapper(member)}
                                                                    title={t("Delete Member")}
                                                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }}
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="member-details-row">
                                                    <td colSpan="6" style={{ padding: 0 }}>
                                                        <div className="member-details fade-in" style={{ padding: '20px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
                                                            
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                                <h3 style={{ margin: 0 }}>{t('Member Statistics')}</h3>
                                                                <button 
                                                                    onClick={() => setSelectedMember(null)}
                                                                    style={{ 
                                                                        background: 'rgba(255,255,255,0.1)', 
                                                                        border: 'none', 
                                                                        borderRadius: '50%', 
                                                                        width: '30px', 
                                                                        height: '30px', 
                                                                        cursor: 'pointer',
                                                                        color: 'var(--text-primary)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}
                                                                >✕</button>
                                                            </div>

                                                            <div style={{ marginBottom: '1.5rem' }}>
                                                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{member.name}</div>
                                                                <div style={{ color: 'var(--text-secondary)' }}>{member.phone}</div>
                                                            </div>

                                                            <div className="details-section">
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                                                    <div className="card p-3" style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                                                        <div className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>{t('Monthly Contribution')}</div>
                                                                        <div className="font-bold" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>₹{member.monthlyAmount}</div>
                                                                    </div>
                                                                    <div className="card p-3" style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                                                        <div className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>{t('Total Paid')}</div>
                                                                        <div className="font-bold text-success" style={{ fontSize: '1.5rem', color: '#10b981' }}>₹{stats.totalPaid}</div>
                                                                    </div>
                                                                    <div className="card p-3" style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                                                        <div className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>{t('Pending Amount')}</div>
                                                                        <div className="font-bold text-danger" style={{ fontSize: '1.5rem', color: '#ef4444' }}>₹{stats.remainingAmount}</div>
                                                                    </div>
                                                                    <div className="card p-3" style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                                                        <div className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>{t('Status')}</div>
                                                                        <div className="font-bold" style={{ fontSize: '1.1rem', color: stats.statusColor }}>{stats.status}</div>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div style={{ marginBottom: '2rem' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                                        <span>{t('Payment Progress')}</span>
                                                                        <span>{stats.monthsPaid} / {stats.expectedMonths} {t('months')}</span>
                                                                    </div>
                                                                    <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                                                                        <div style={{ 
                                                                            height: '100%', 
                                                                            width: `${stats.completionPercentage}%`, 
                                                                            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                                                            borderRadius: '4px',
                                                                            transition: 'width 0.5s ease-out'
                                                                        }}></div>
                                                                    </div>
                                                                </div>

                                                                <div className="grid md:grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                                                    {/* Recent Payments List */}
                                                                    <div>
                                                                        <h4 style={{ 
                                                                            fontSize: '1rem', 
                                                                            color: 'var(--text-secondary)', 
                                                                            borderBottom: '1px solid var(--border-color)', 
                                                                            paddingBottom: '0.5rem',
                                                                            marginBottom: '1rem'
                                                                        }}>{t('Recent Payments')}</h4>
                                                                        
                                                                        {memberPayments.length === 0 ? (
                                                                            <p className="text-muted" style={{ fontStyle: 'italic' }}>{t('No general donation records')}</p>
                                                                        ) : (
                                                                            <div className="payment-history" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                                                {memberPayments.map(payment => (
                                                                                    <div key={payment.id} className="payment-record" style={{ 
                                                                                        display: 'flex', 
                                                                                        justifyContent: 'space-between', 
                                                                                        padding: '0.75rem', 
                                                                                        background: 'var(--bg-tertiary)', 
                                                                                        marginBottom: '0.5rem', 
                                                                                        borderRadius: '6px',
                                                                                        alignItems: 'center'
                                                                                    }}>
                                                                                        <div>
                                                                                            <div className="payment-month" style={{ fontWeight: '500' }}>
                                                                                                {new Date(payment.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                                                            </div>
                                                                                            {payment.notes && <div className="payment-notes" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{payment.notes}</div>}
                                                                                        </div>
                                                                                        <div className="payment-record-actions">
                                                                                            <span className="payment-record-amount" style={{ fontWeight: 'bold', color: '#10b981' }}>₹{payment.amount}</span>
                                                                                            {!isReadOnly && (
                                                                                                <button 
                                                                                                    className="action-btn delete-btn-sm"
                                                                                                    onClick={() => handleDeletePaymentWrapper(payment, member)}
                                                                                                    title={t("Delete Payment")}
                                                                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7 }}
                                                                                                >
                                                                                                    🗑️
                                                                                                </button>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Imam Salary Payments List */}
                                                                    <div>
                                                                        <h4 style={{ 
                                                                            fontSize: '1rem', 
                                                                            color: 'var(--text-secondary)', 
                                                                            borderBottom: '1px solid var(--border-color)', 
                                                                            paddingBottom: '0.5rem',
                                                                            marginBottom: '1rem'
                                                                        }}>{t('Imam Salary Payments')}</h4>
                                                                        
                                                                        {getMemberImamSalaryPayments(member).length === 0 ? (
                                                                            <p className="text-muted" style={{ fontStyle: 'italic' }}>{t('No Imam salary records')}</p>
                                                                        ) : (
                                                                            <div className="payment-history" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                                                {getMemberImamSalaryPayments(member).map(payment => (
                                                                                    <div key={payment.id} className="payment-record" style={{ 
                                                                                        display: 'flex', 
                                                                                        justifyContent: 'space-between', 
                                                                                        padding: '0.75rem', 
                                                                                        background: 'var(--bg-tertiary)', 
                                                                                        marginBottom: '0.5rem', 
                                                                                        borderRadius: '6px',
                                                                                        alignItems: 'center'
                                                                                    }}>
                                                                                        <div>
                                                                                            <div className="payment-month" style={{ fontWeight: '500' }}>
                                                                                                {new Date(payment.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                                                            </div>
                                                                                            {payment.notes && <div className="payment-notes" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{payment.notes}</div>}
                                                                                        </div>
                                                                                        <div className="payment-record-actions">
                                                                                            <span className="payment-record-amount" style={{ fontWeight: 'bold', color: '#10b981' }}>₹{payment.amount}</span>
                                                                                            {!isReadOnly && (
                                                                                                <button 
                                                                                                    className="action-btn delete-btn-sm"
                                                                                                    onClick={() => handleDeleteImamSalaryPaymentWrapper(payment, member)}
                                                                                                    title={t("Delete Payment")}
                                                                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7 }}
                                                                                                >
                                                                                                    🗑️
                                                                                                </button>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="flex gap-2 justify-end" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                                                    <button 
                                                                        className="btn btn-secondary"
                                                                        onClick={() => handleDownloadSlip(member)}
                                                                        style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px' }}
                                                                    >
                                                                        <span>📄</span> {t('Download Slip')}
                                                                    </button>
                                                                    <button 
                                                                        className="btn btn-success"
                                                                        onClick={() => handleShareWhatsApp(member)}
                                                                        style={{ flex: 1, background: '#25D366', color: 'white', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px' }}
                                                                    >
                                                                        <span>📱</span> {t('Share on WhatsApp')}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


        </div>
    );
}

export default MemberList;
