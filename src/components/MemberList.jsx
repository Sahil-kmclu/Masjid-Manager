import React, { useState, useMemo } from 'react';
import './MemberList.css';
import { generatePaymentReceipt, generatePendingSlip, sendWhatsAppMessage, calculatePendingMonths } from '../utils/receiptGenerator';

function MemberList({ members, payments, imamSalaryPayments, onUpdateMember, onDeleteMember, onDeletePayment, onDeleteImamSalaryPayment }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({});

    const filteredMembers = useMemo(() => {
        return members.filter(member =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.phone.includes(searchTerm)
        );
    }, [members, searchTerm]);

    const getMemberPayments = (memberId) => {
        return payments.filter(p => p.memberId === memberId)
            .sort((a, b) => new Date(b.month) - new Date(a.month));
    };

    const getMemberImamSalaryPayments = (memberId) => {
        const sep2020 = new Date('2020-09-01');
        return (imamSalaryPayments || []).filter(p => {
            const paymentDate = new Date(p.month + '-01');
            return p.memberId === memberId && paymentDate >= sep2020;
        }).sort((a, b) => new Date(b.month) - new Date(a.month));
    };

    const getMemberMonthlyStats = (member) => {
        const memberPaymentsList = getMemberPayments(member.id);
        const memberImamSalaryList = getMemberImamSalaryPayments(member.id);

        // Calculate total paid from BOTH general payments AND Imam salary payments
        const totalFromGeneralPayments = memberPaymentsList.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const totalFromImamSalary = memberImamSalaryList.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const totalPaid = totalFromGeneralPayments + totalFromImamSalary;

        // Monthly contribution
        const monthlyAmount = parseFloat(member.monthlyAmount) || 0;

        // Months paid = Total ÷ Monthly Amount
        const monthsPaid = monthlyAmount > 0 ? Math.floor(totalPaid / monthlyAmount) : 0;

        // Calculate expected months from September 2020 to current month
        const sep2020 = new Date('2020-09-01');
        const currentDate = new Date();

        const yearsDiff = currentDate.getFullYear() - sep2020.getFullYear();
        const monthsDiff = currentDate.getMonth() - sep2020.getMonth();
        const expectedMonths = (yearsDiff * 12) + monthsDiff + 1;


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
        let status = 'No Payments';
        let statusColor = '#ef4444'; // red
        if (monthsPaid >= expectedMonths) {
            status = 'Fully Paid';
            statusColor = '#10b981'; // green
            if (monthsPaid > expectedMonths) {
                status = `Fully Paid (+${monthsPaid - expectedMonths} months advance)`;
            }
        } else if (monthsPaid > 0) {
            status = `${pendingMonths} Months Pending`;
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

    const handleEdit = (member) => {
        setEditMode(true);
        setEditData(member);
    };

    const handleSaveEdit = () => {
        onUpdateMember(editData.id, editData);
        setEditMode(false);
        setEditData({});
        setSelectedMember(null);
        alert('Member updated successfully!');
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setEditData({});
    };

    const handleSendPendingSlip = (member) => {
        const memberPayments = getMemberPayments(member.id);
        const memberImamSalary = getMemberImamSalaryPayments(member.id);
        const pendingMonths = calculatePendingMonths(memberPayments, memberImamSalary);

        if (pendingMonths.length === 0) {
            alert('This member has no pending payments!');
            return;
        }

        const slip = generatePendingSlip(member, pendingMonths[0], pendingMonths);
        sendWhatsAppMessage(member.phone, slip);
    };


    return (
        <div className="member-list fade-in">
            <div className="page-header">
                <div>
                    <h2>Member Management</h2>
                    <p className="text-muted">View and manage all registered members</p>
                </div>
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
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
                            <h3>Edit Member</h3>
                            <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={editData.phone}
                                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={editData.email || ''}
                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Monthly Amount (₹)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={editData.monthlyAmount}
                                    onChange={(e) => setEditData({ ...editData, monthlyAmount: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Address</label>
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
                                Save Changes
                            </button>
                            <button className="btn btn-secondary" onClick={handleCancelEdit}>
                                Cancel
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
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Monthly Amount</th>
                                <th>Total Payments</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                        {searchTerm ? 'No members found matching your search' : 'No members added yet'}
                                    </td>
                                </tr>
                            ) : (
                                filteredMembers.map((member) => {
                                    const memberPayments = getMemberPayments(member.id);
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
                                                            className="btn btn-sm btn-secondary"
                                                            onClick={() => setSelectedMember(isExpanded ? null : member.id)}
                                                            title="View Details"
                                                        >
                                                            {isExpanded ? '▲' : '▼'}
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            onClick={() => handleEdit(member)}
                                                            title="Edit Member"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-warning"
                                                            onClick={() => handleSendPendingSlip(member)}
                                                            title="Send Pending Payment Slip"
                                                        >
                                                            📄 Slip
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => onDeleteMember(member.id)}
                                                            title="Delete Member"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="member-details-row">
                                                    <td colSpan="6">
                                                        <div className="member-details">
                                                            <div className="details-section">
                                                                <h4>Member Information</h4>
                                                                <div className="details-grid">
                                                                    {member.address && (
                                                                        <div className="detail-item">
                                                                            <span className="detail-label">Address:</span>
                                                                            <span className="detail-value">{member.address}</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="detail-item">
                                                                        <span className="detail-label">Joined:</span>
                                                                        <span className="detail-value">
                                                                            {new Date(member.createdAt).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Monthly Payment Status */}
                                                            <div className="details-section" style={{ background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)', border: '2px solid var(--color-primary)' }}>
                                                                <h4>📅 Monthly Payment Status</h4>
                                                                {(() => {
                                                                    const monthlyStats = getMemberMonthlyStats(member);

                                                                    return (
                                                                        <>
                                                                            <div className="detail-item">
                                                                                <span className="detail-label">Monthly Contribution:</span>
                                                                                <span className="detail-value" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>₹{member.monthlyAmount}</span>
                                                                            </div>
                                                                            <div className="detail-item">
                                                                                <span className="detail-label">Total Amount Paid:</span>
                                                                                <span className="detail-value" style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>₹{monthlyStats.totalPaid.toLocaleString()}</span>
                                                                            </div>
                                                                            <div className="detail-item" style={{ background: '#fef3c7', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)', border: '2px solid #f59e0b' }}>
                                                                                <span className="detail-label" style={{ fontWeight: 'bold' }}>💰 Remaining Amount (Current Month तक):</span>
                                                                                <span className="detail-value" style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#d97706' }}>₹{monthlyStats.remainingAmount.toLocaleString()}</span>
                                                                            </div>

                                                                            <div style={{ margin: 'var(--spacing-md) 0', padding: 'var(--spacing-md)', background: 'white', borderRadius: 'var(--radius-md)' }}>
                                                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                                                                                    <div style={{ textAlign: 'center', padding: 'var(--spacing-sm)', background: '#10b98110', borderRadius: 'var(--radius-md)' }}>
                                                                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>✅ {monthlyStats.monthsPaid}</div>
                                                                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>Months Paid</div>
                                                                                    </div>
                                                                                    <div style={{ textAlign: 'center', padding: 'var(--spacing-sm)', background: '#f59e0b10', borderRadius: 'var(--radius-md)' }}>
                                                                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>⏰ {monthlyStats.pendingMonths}</div>
                                                                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>Months Pending</div>
                                                                                    </div>
                                                                                    <div style={{ textAlign: 'center', padding: 'var(--spacing-sm)', background: '#667eea10', borderRadius: 'var(--radius-md)' }}>
                                                                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>📊 {monthlyStats.expectedMonths}</div>
                                                                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>Expected (to date)</div>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Progress Bar */}
                                                                                <div style={{ marginTop: 'var(--spacing-md)' }}>
                                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.875rem' }}>
                                                                                        <span style={{ fontWeight: '600' }}>Payment Progress</span>
                                                                                        <span style={{ fontWeight: 'bold', color: monthlyStats.statusColor }}>{monthlyStats.completionPercentage}%</span>
                                                                                    </div>
                                                                                    <div style={{
                                                                                        width: '100%',
                                                                                        height: '24px',
                                                                                        background: '#e5e7eb',
                                                                                        borderRadius: '12px',
                                                                                        overflow: 'hidden',
                                                                                        position: 'relative'
                                                                                    }}>
                                                                                        <div style={{
                                                                                            width: `${monthlyStats.completionPercentage}%`,
                                                                                            height: '100%',
                                                                                            background: `linear-gradient(90deg, ${monthlyStats.statusColor} 0%, ${monthlyStats.statusColor}dd 100%)`,
                                                                                            transition: 'width 0.3s ease',
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            justifyContent: 'flex-end',
                                                                                            paddingRight: '8px'
                                                                                        }}>
                                                                                            {monthlyStats.completionPercentage > 10 && (
                                                                                                <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                                                                    {monthlyStats.monthsPaid} / {monthlyStats.expectedMonths}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Status Badge */}
                                                                                <div style={{
                                                                                    marginTop: 'var(--spacing-md)',
                                                                                    padding: 'var(--spacing-sm)',
                                                                                    background: `${monthlyStats.statusColor}15`,
                                                                                    border: `2px solid ${monthlyStats.statusColor}`,
                                                                                    borderRadius: 'var(--radius-md)',
                                                                                    textAlign: 'center',
                                                                                    fontWeight: 'bold',
                                                                                    color: monthlyStats.statusColor,
                                                                                    fontSize: '1rem'
                                                                                }}>
                                                                                    {monthlyStats.status}
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    );
                                                                })()}
                                                            </div>

                                                            <div className="details-section">
                                                                <h4>Payment History ({memberPayments.length})</h4>
                                                                {memberPayments.length === 0 ? (
                                                                    <p className="text-muted">No payments recorded yet</p>
                                                                ) : (
                                                                    <div className="payment-history">
                                                                        {memberPayments.map((payment) => (
                                                                            <div key={payment.id} className="payment-record">
                                                                                <div>
                                                                                    <div className="payment-month">
                                                                                        {new Date(payment.month + '-01').toLocaleDateString('en-US', {
                                                                                            month: 'long',
                                                                                            year: 'numeric'
                                                                                        })}
                                                                                    </div>
                                                                                    <div className="payment-meta">
                                                                                        Paid on: {new Date(payment.paymentDate).toLocaleDateString()}
                                                                                    </div>
                                                                                    {payment.notes && (
                                                                                        <div className="payment-notes">Note: {payment.notes}</div>
                                                                                    )}
                                                                                </div>
                                                                                <div className="payment-record-actions">
                                                                                    <span className="payment-record-amount">₹{payment.amount}</span>
                                                                                    <button
                                                                                        className="btn btn-sm btn-success"
                                                                                        onClick={() => {
                                                                                            const receipt = generatePaymentReceipt(member, payment);
                                                                                            sendWhatsAppMessage(member.phone, receipt);
                                                                                        }}
                                                                                        title="Send Receipt via WhatsApp"
                                                                                    >
                                                                                        📱 Receipt
                                                                                    </button>
                                                                                    <button
                                                                                        className="btn btn-sm btn-danger"
                                                                                        onClick={() => onDeletePayment(payment.id)}
                                                                                        title="Delete Payment"
                                                                                    >
                                                                                        ✕
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="details-section">
                                                                <h4>🕌 Imam Salary History (From Sep 2020)</h4>
                                                                {(() => {
                                                                    const memberImamSalary = getMemberImamSalaryPayments(member.id);
                                                                    const totalImamSalary = memberImamSalary.reduce((sum, p) => sum + parseFloat(p.amount), 0);

                                                                    return (
                                                                        <>
                                                                            {memberImamSalary.length > 0 && (
                                                                                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                                                                    <div className="detail-item" style={{ background: 'var(--color-background)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-sm)' }}>
                                                                                        <span className="detail-label">Total Payments:</span>
                                                                                        <span className="detail-value" style={{ fontWeight: 'bold' }}>{memberImamSalary.length}</span>
                                                                                    </div>
                                                                                    <div className="detail-item" style={{ background: 'var(--color-background)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}>
                                                                                        <span className="detail-label">Total Amount Contributed:</span>
                                                                                        <span className="detail-value" style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>₹{totalImamSalary.toLocaleString()}</span>
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {memberImamSalary.length === 0 ? (
                                                                                <p className="text-muted">No Imam salary payments recorded yet</p>
                                                                            ) : (
                                                                                <div className="payment-history">
                                                                                    {memberImamSalary.map((payment) => (
                                                                                        <div key={payment.id} className="payment-record" style={{ borderLeft: '3px solid var(--color-primary)' }}>
                                                                                            <div>
                                                                                                <div className="payment-month">
                                                                                                    {new Date(payment.month + '-01').toLocaleDateString('en-US', {
                                                                                                        month: 'long',
                                                                                                        year: 'numeric'
                                                                                                    })}
                                                                                                </div>
                                                                                                <div className="payment-meta">
                                                                                                    Paid on: {new Date(payment.paymentDate).toLocaleDateString()}
                                                                                                </div>
                                                                                                {payment.notes && (
                                                                                                    <div className="payment-notes">Note: {payment.notes}</div>
                                                                                                )}
                                                                                            </div>
                                                                                            <div className="payment-record-actions">
                                                                                                <span className="payment-record-amount">₹{payment.amount}</span>
                                                                                                <button
                                                                                                    className="btn btn-sm btn-danger"
                                                                                                    onClick={() => onDeleteImamSalaryPayment(payment.id)}
                                                                                                    title="Delete Imam Salary Payment"
                                                                                                >
                                                                                                    ✕
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </>
                                                                    );
                                                                })()}
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
