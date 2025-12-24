import React, { useState, useMemo } from 'react';
import './MemberList.css';
import { generatePaymentReceipt, generatePendingSlip, sendWhatsAppMessage, calculatePendingMonths, generatePendingSlipPDF } from '../utils/receiptGenerator';

function MemberList({ members = [], payments = [], imamSalaryPayments = [], onUpdateMember, onDeleteMember, onDeletePayment, onDeleteImamSalaryPayment, isReadOnly }) {
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
        return (payments || []).filter(p => p && p.memberId === memberId)
            .sort((a, b) => new Date(b.month) - new Date(a.month));
    };

    const getMemberImamSalaryPayments = (memberId) => {
        const sep2020 = new Date('2020-09-01');
        return (imamSalaryPayments || []).filter(p => {
            if (!p || !p.month) return false;
            const paymentDate = new Date(p.month + '-01');
            return p.memberId === memberId && paymentDate >= sep2020;
        }).sort((a, b) => new Date(b.month) - new Date(a.month));
    };

    const getMemberMonthlyStats = (member) => {
        const memberPaymentsList = getMemberPayments(member.id);
        const memberImamSalaryList = getMemberImamSalaryPayments(member.id);

        // Calculate total paid from BOTH general payments AND Imam salary payments
        const totalFromGeneralPayments = memberPaymentsList.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const totalFromImamSalary = memberImamSalaryList.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
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

    const handleDownloadSlip = (member) => {
        try {
            const memberPayments = getMemberPayments(member.id);
            const memberImamSalary = getMemberImamSalaryPayments(member.id);
            const pendingMonthsList = calculatePendingMonths(memberPayments, memberImamSalary);
            
            // Generate PDF
            generatePendingSlipPDF(member, pendingMonthsList);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert(`Failed to generate PDF: ${error.message || error}`);
        }
    };

    const handleShareWhatsApp = (member) => {
        const memberPayments = getMemberPayments(member.id);
        const memberImamSalary = getMemberImamSalaryPayments(member.id);
        const pendingMonthsList = calculatePendingMonths(memberPayments, memberImamSalary);
        
        const currentMonthStr = new Date().toISOString().slice(0, 7);
        const slipText = generatePendingSlip(member, currentMonthStr, pendingMonthsList);

        sendWhatsAppMessage(member.phone, slipText);
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
                                                            className="action-btn view-btn" 
                                                            title="View Slip / Stats"
                                                            onClick={() => setSelectedMember(member)}
                                                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }}
                                                        >
                                                            📄
                                                        </button>
                                                        {!isReadOnly && (
                                                            <>
                                                                <button 
                                                                    className="action-btn edit-btn" 
                                                                    onClick={() => handleEdit(member)}
                                                                    title="Edit Member"
                                                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }}
                                                                >
                                                                    ✏️
                                                                </button>
                                                                <button 
                                                                    className="action-btn delete-btn" 
                                                                    onClick={() => onDeleteMember(member.id)}
                                                                    title="Delete Member"
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
                <div className="modal-overlay" onClick={() => setSelectedMember(null)}>
                    <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Member Statistics</h3>
                            <button className="close-btn" onClick={() => setSelectedMember(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            {(() => {
                                const stats = getMemberMonthlyStats(selectedMember);
                                const paymentsList = getMemberPayments(selectedMember.id);
                                const imamSalaryList = getMemberImamSalaryPayments(selectedMember.id);
                                
                                return (
                                    <div className="member-slip">
                                        <div className="slip-header">
                                            <h4>{selectedMember.name}</h4>
                                            <p>{selectedMember.phone}</p>
                                        </div>

                                        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '20px' }}>
                                            <div className="stat-box" style={{ background: '#334155', padding: '10px', borderRadius: '8px', border: '1px solid #475569' }}>
                                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem' }}>Monthly Contribution</label>
                                                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f8fafc' }}>₹{selectedMember.monthlyAmount}</span>
                                            </div>
                                            <div className="stat-box" style={{ background: '#334155', padding: '10px', borderRadius: '8px', border: '1px solid #475569' }}>
                                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem' }}>Total Paid</label>
                                                <span className="success-text" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#4ade80' }}>₹{stats.totalPaid}</span>
                                            </div>
                                            <div className="stat-box" style={{ background: '#334155', padding: '10px', borderRadius: '8px', border: '1px solid #475569' }}>
                                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem' }}>Pending Amount</label>
                                                <span className="danger-text" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f87171' }}>₹{stats.remainingAmount}</span>
                                            </div>
                                            <div className="stat-box" style={{ background: '#334155', padding: '10px', borderRadius: '8px', border: '1px solid #475569' }}>
                                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem' }}>Status</label>
                                                <span style={{ color: stats.statusColor, fontWeight: 'bold' }}>
                                                    {stats.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="progress-section" style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '5px' }}>Payment Progress ({stats.monthsPaid} / {stats.expectedMonths} months)</label>
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
                                                        <div key={p.id} className="history-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                                            <span>{new Date(p.month + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}</span>
                                                            <span className="amount" style={{ fontWeight: '600' }}>₹{p.amount}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="no-data" style={{ color: '#94a3b8', fontStyle: 'italic' }}>No general donation records</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="payment-history-section" style={{ marginTop: '20px' }}>
                                            <h5 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '5px', marginBottom: '10px' }}>Imam Salary Payments</h5>
                                            <div className="history-list" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                                {imamSalaryList.length > 0 ? (
                                                    imamSalaryList.slice(0, 5).map(p => (
                                                        <div key={p.id} className="history-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                                            <span>{new Date(p.month + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}</span>
                                                            <span className="amount" style={{ fontWeight: '600' }}>₹{p.amount}</span>
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
