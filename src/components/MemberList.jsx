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
            const memberPayments = getMemberPayments(member.id);
            const memberImamSalary = getMemberImamSalaryPayments(member.id);
            const pendingMonthsList = calculatePendingMonths(memberPayments, memberImamSalary, member.joiningDate);
            
            // Generate PDF
            generatePendingSlipPDF(member, pendingMonthsList, user?.name);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert(t('Failed to generate PDF') + `: ${error.message || error}`);
        }
    };

    const handleShareWhatsApp = (member) => {
        const memberPayments = getMemberPayments(member.id);
        const memberImamSalary = getMemberImamSalaryPayments(member.id);
        const pendingMonthsList = calculatePendingMonths(memberPayments, memberImamSalary, member.joiningDate);
        
        const currentMonthStr = new Date().toISOString().slice(0, 7);
        const slipText = generatePendingSlip(member, currentMonthStr, pendingMonthsList, user?.name);

        sendWhatsAppMessage(member.phone, slipText);
    };

    const handleEdit = (member) => {
        setEditMode(true);
        setEditData(member);
        window.history.pushState({ modal: 'edit-member' }, '', '');
    };

    const handleViewDetails = (member) => {
        setSelectedMember(member);
        window.history.pushState({ modal: 'view-member' }, '', '');
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
        const memberPayments = getMemberPayments(member.id);
        const memberImamSalary = getMemberImamSalaryPayments(member.id);
        const pendingMonths = calculatePendingMonths(memberPayments, memberImamSalary, member.joiningDate);

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
                                    const isExpanded = selectedMember === member.id;

                                    return (
                                        <React.Fragment key={member.id}>
                                            <tr>
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
                                                            title={t("View Slip / Stats")}
                                                            onClick={() => handleViewDetails(member)}
                                                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }}
                                                        >
                                                            📄
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
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedMember && !editMode && (
                <div className="modal-overlay" onClick={() => window.history.back()}>
                    <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{t('Member Statistics')}</h3>
                            <button className="close-btn" onClick={() => window.history.back()}>×</button>
                        </div>
                        <div className="modal-body">
                            {(() => {
                                const stats = getMemberMonthlyStats(selectedMember);
                                // Pass full member object to enable fallback matching by Name/Phone
                                const paymentsList = getMemberPayments(selectedMember);
                                const imamSalaryList = getMemberImamSalaryPayments(selectedMember);
                                
                                return (
                                    <div className="member-slip">
                                        <div className="slip-header">
                                            <h4>{selectedMember.name}</h4>
                                            <p>{selectedMember.phone}</p>
                                        </div>

                                        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '20px' }}>
                                            <div className="stat-box" style={{ background: '#334155', padding: '10px', borderRadius: '8px', border: '1px solid #475569' }}>
                                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem' }}>{t('Monthly Contribution')}</label>
                                                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f8fafc' }}>₹{selectedMember.monthlyAmount}</span>
                                            </div>
                                            <div className="stat-box" style={{ background: '#334155', padding: '10px', borderRadius: '8px', border: '1px solid #475569' }}>
                                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem' }}>{t('Total Paid')}</label>
                                                <span className="success-text" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#4ade80' }}>₹{stats.totalPaid}</span>
                                            </div>
                                            <div className="stat-box" style={{ background: '#334155', padding: '10px', borderRadius: '8px', border: '1px solid #475569' }}>
                                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem' }}>{t('Pending Amount')}</label>
                                                <span className="danger-text" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f87171' }}>₹{stats.remainingAmount}</span>
                                            </div>
                                            <div className="stat-box" style={{ background: '#334155', padding: '10px', borderRadius: '8px', border: '1px solid #475569' }}>
                                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem' }}>{t('Status')}</label>
                                                <span style={{ color: stats.statusColor, fontWeight: 'bold' }}>
                                                    {stats.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="progress-section" style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '5px' }}>{t('Payment Progress')} ({stats.monthsPaid} / {stats.expectedMonths} {t('months')})</label>
                                            <div className="progress-bar" style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div 
                                                    className="progress-fill" 
                                                    style={{ 
                                                        width: `${stats.completionPercentage}%`,
                                                        backgroundColor: stats.statusColor,
                                                        height: '100%'
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="payment-history-section">
                                            <h5 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '5px', marginBottom: '10px' }}>Recent Payments</h5>
                                            <div className="history-list" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                                {paymentsList.length > 0 ? (
                                                    paymentsList.slice(0, 5).map(p => (
                                                        <div key={p.id} className="history-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                                            <span>{new Date(p.month + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}</span>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <span className="amount" style={{ fontWeight: '600' }}>₹{p.amount}</span>
                                                                {!isReadOnly && (
                                                                    <button 
                                                                        onClick={() => handleDeletePaymentWrapper(p, selectedMember)}
                                                                        style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem' }}
                                                                        title={t('Delete Payment')}
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="no-data" style={{ color: '#94a3b8', fontStyle: 'italic' }}>No general donation records</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="payment-history-section" style={{ marginTop: '20px' }}>
                                            <h5 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '5px', marginBottom: '10px' }}>Imam Salary Payments</h5>
                                            <div className="history-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                {imamSalaryList.length > 0 ? (
                                                    imamSalaryList.map(p => (
                                                        <div key={p.id} className="history-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                                            <span>{new Date(p.month + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}</span>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <span className="amount" style={{ fontWeight: '600' }}>₹{p.amount}</span>
                                                                {!isReadOnly && (
                                                                    <button 
                                                                        onClick={() => handleDeleteImamSalaryPaymentWrapper(p, selectedMember)}
                                                                        style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem' }}
                                                                        title={t('Delete Payment')}
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="no-data" style={{ color: '#94a3b8', fontStyle: 'italic' }}>No imam salary records</p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="slip-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                            <button 
                                                className="btn btn-secondary"
                                                onClick={() => handleDownloadSlip(selectedMember)}
                                                style={{ flex: 1 }}
                                            >
                                                Download Slip 📄
                                            </button>
                                            <button 
                                                className="btn btn-success"
                                                onClick={() => handleShareWhatsApp(selectedMember)}
                                                style={{ flex: 1, background: '#25D366', color: 'white', border: 'none' }}
                                            >
                                                Share on WhatsApp 📱
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MemberList;
