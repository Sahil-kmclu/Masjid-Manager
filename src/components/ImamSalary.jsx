import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import { verifyOTP } from '../utils/otp';
import './ImamSalary.css';

function ImamSalary({ members, imamSalaryPayments, onDeletePayment, isReadOnly }) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all');

    // Calculate statistics
    const stats = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        // Filter from September 2020
        const sep2020 = new Date('2020-09-01');
        const validPayments = imamSalaryPayments.filter(p => {
            const paymentDate = new Date(p.month + '-01');
            return paymentDate >= sep2020;
        });

        const totalCollected = validPayments.reduce(
            (sum, p) => sum + parseFloat(p.amount), 0
        );

        const currentMonthPayments = validPayments.filter(p => {
            const paymentDate = new Date(p.month + '-01');
            return paymentDate.getMonth() === currentMonth &&
                paymentDate.getFullYear() === currentYear;
        });

        const monthlyTotal = currentMonthPayments.reduce(
            (sum, p) => sum + parseFloat(p.amount), 0
        );

        // Get unique contributing members
        const contributingMembers = new Set(validPayments.map(p => p.memberId));

        // Calculate top contributors
        const contributorStats = {};
        validPayments.forEach(payment => {
            if (!contributorStats[payment.memberId]) {
                contributorStats[payment.memberId] = {
                    memberId: payment.memberId,
                    totalAmount: 0,
                    paymentCount: 0
                };
            }
            contributorStats[payment.memberId].totalAmount += parseFloat(payment.amount);
            contributorStats[payment.memberId].paymentCount += 1;
        });

        const topContributors = Object.values(contributorStats)
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, 5)
            .map(stat => ({
                ...stat,
                memberName: members.find(m => m.id === stat.memberId)?.name || 'Unknown'
            }));

        return {
            totalCollected,
            monthlyTotal,
            contributingMembers: contributingMembers.size,
            totalMembers: members.length,
            paymentCount: validPayments.length,
            topContributors
        };
    }, [imamSalaryPayments, members]);

    // Filter payments
    const filteredPayments = useMemo(() => {
        const sep2020 = new Date('2020-09-01');
        let filtered = imamSalaryPayments.filter(p => {
            const paymentDate = new Date(p.month + '-01');
            return paymentDate >= sep2020;
        });

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(payment => {
                const member = members.find(m => m.id === payment.memberId);
                return member?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    member?.phone.includes(searchTerm);
            });
        }

        // Apply date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            filtered = filtered.filter(payment => {
                const paymentDate = new Date(payment.month + '-01');
                if (dateFilter === 'thisMonth') {
                    return paymentDate.getMonth() === now.getMonth() &&
                        paymentDate.getFullYear() === now.getFullYear();
                } else if (dateFilter === 'thisYear') {
                    return paymentDate.getFullYear() === now.getFullYear();
                }
                return true;
            });
        }

        return filtered
            .sort((a, b) => new Date(b.month) - new Date(a.month))
            .map(payment => ({
                ...payment,
                memberName: members.find(m => m.id === payment.memberId)?.name || 'Unknown',
                memberPhone: members.find(m => m.id === payment.memberId)?.phone || '-'
            }));
    }, [imamSalaryPayments, members, searchTerm, dateFilter]);

    const generateReceipt = (payment) => {
        const doc = new jsPDF();
        const currentUser = JSON.parse(localStorage.getItem('masjid_current_user') || '{}');
        const mosqueName = currentUser.name || 'Mosque Receipt';
        
        // Header
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text(mosqueName, 105, 20, { align: 'center' });
        
        // Date
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
        
        // Line
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);
        
        // Details
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        
        let y = 50;
        const addLine = (label, value) => {
            doc.setFont('helvetica', 'bold');
            doc.text(`${label}:`, 20, y);
            doc.setFont('helvetica', 'normal');
            doc.text(String(value || '-'), 70, y);
            y += 10;
        };
        
        const memberName = members.find(m => m.id === payment.memberId)?.name || 'Unknown';
        
        addLine('Receipt No', payment.id.slice(-6).toUpperCase());
        addLine('Date', new Date(payment.paymentDate).toLocaleDateString());
        addLine('Member Name', memberName);
        
        // Format month to "Month YYYY" (e.g., December 2025)
        const [year, month] = payment.month.split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1);
        const formattedMonth = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        addLine('Payment Month', formattedMonth);
        addLine('Amount', `Rs. ${parseFloat(payment.amount).toLocaleString()}`);
        if (payment.notes) {
            addLine('Notes', payment.notes);
        }
        
        // Footer
        doc.setLineWidth(0.5);
        doc.line(20, y + 10, 190, y + 10);
        
        doc.setFontSize(10);
        doc.text('Thank you for your contribution!', 105, y + 25, { align: 'center' });
        
        doc.save(`ImamSalary_Receipt_${memberName}_${payment.month}.pdf`);
    };

    const shareViaWhatsApp = (payment) => {
        const currentUser = JSON.parse(localStorage.getItem('masjid_current_user') || '{}');
        const mosqueName = currentUser.name || t('Mosque Receipt');
        const memberName = members.find(m => m.id === payment.memberId)?.name || 'Unknown';
        
        // Format month
        const [year, month] = payment.month.split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1);
        const formattedMonth = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const message = encodeURIComponent(
            `*${mosqueName}*\n\n` +
            `${t('Date')}: ${new Date(payment.paymentDate).toLocaleDateString()}\n` +
            `${t('Receipt No')}: ${payment.id.slice(-6).toUpperCase()}\n` +
            `${t('Member Name')}: ${memberName}\n` +
            `${t('Payment Month')}: ${formattedMonth}\n` +
            `${t('Amount')}: Rs. ${parseFloat(payment.amount).toLocaleString()}\n\n` +
            `${t('Thank you for your contribution!')}`
        );
        
        const member = members.find(m => m.id === payment.memberId);
        const url = member?.phone 
            ? `https://wa.me/${member.phone.length === 10 ? '91' + member.phone : member.phone}?text=${message}`
            : `https://wa.me/?text=${message}`;
            
        window.open(url, '_blank');
    };

    const handleDelete = async (payment) => {
        const currentUser = JSON.parse(localStorage.getItem('masjid_current_user') || '{}');
        // Use member phone if available, otherwise admin phone
        const phoneToVerify = (payment.memberPhone && payment.memberPhone !== '-') 
            ? payment.memberPhone 
            : currentUser.phone;
        
        const isVerified = await verifyOTP(phoneToVerify, 'delete this salary payment');
        if (isVerified) {
            onDeletePayment(payment.id);
        }
    };

    return (
        <div className="imam-salary fade-in">
            <div className="page-header">
                <div>
                    <h2>🕌 {t('Total Imam Salary Collected')}</h2>
                    <p className="text-muted">{t('Track salary contributions from September 2020 onwards')}</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        💰
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('Total Imam Salary Collected')}</div>
                        <div className="stat-value" title={`₹${stats.totalCollected.toLocaleString()}`}>₹{stats.totalCollected.toLocaleString()}</div>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        📅
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('This Month')}</div>
                        <div className="stat-value">₹{stats.monthlyTotal.toLocaleString()}</div>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        👥
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('Total Contributing Members')}</div>
                        <div className="stat-value">{stats.contributingMembers}/{stats.totalMembers}</div>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        📊
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('Total Payments')}</div>
                        <div className="stat-value">{stats.paymentCount}</div>
                    </div>
                </div>
            </div>

            {/* Top Contributors */}
            {stats.topContributors.length > 0 && (
                <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <h3>{t('Top Contributors')}</h3>
                    <div className="top-contributors">
                        {stats.topContributors.map((contributor, index) => (
                            <div key={contributor.memberId} className="contributor-item">
                                <div className="contributor-rank">#{index + 1}</div>
                                <div className="contributor-info">
                                    <div className="contributor-name">{contributor.memberName}</div>
                                    <div className="contributor-stats">
                                        {contributor.paymentCount} {t('payments')}
                                    </div>
                                </div>
                                <div className="contributor-amount">₹{contributor.totalAmount.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
                <div className="filters-row">
                    <input
                        type="text"
                        placeholder={t('Search by member name or phone...')}
                        className="form-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <select
                        className="form-select"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        style={{ width: '200px' }}
                    >
                        <option value="all">{t('All Time')}</option>
                        <option value="thisMonth">{t('This Month')}</option>
                        <option value="thisYear">{t('This Year')}</option>
                    </select>
                </div>
            </div>

            {/* Payment Records Table */}
            <div className="card">
                <h3>{t('Salary Payments')} ({filteredPayments.length})</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>{t('Member Name')}</th>
                                <th>{t('Phone')}</th>
                                <th>{t('Month')}</th>
                                <th>{t('Amount')}</th>
                                <th>{t('Payment Date')}</th>
                                <th>{t('Notes')}</th>
                                <th>{t('Actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                                        {searchTerm || dateFilter !== 'all'
                                            ? t('No payments found matching your filters')
                                            : t('No Imam salary payments recorded yet')}
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td>
                                            <div className="member-name">{payment.memberName}</div>
                                        </td>
                                        <td>{payment.memberPhone}</td>
                                        <td>
                                            {new Date(payment.month + '-01').toLocaleDateString('en-US', {
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td>
                                            <span className="amount-badge">₹{parseFloat(payment.amount).toLocaleString()}</span>
                                        </td>
                                        <td>
                                            {new Date(payment.paymentDate).toLocaleDateString()}
                                        </td>
                                        <td>{payment.notes || '-'}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => generateReceipt(payment)}
                                                title={t('Download Slip')}
                                                style={{ marginRight: '5px' }}
                                            >
                                                📄
                                            </button>
                                            <button
                                                className="btn btn-sm btn-success"
                                                onClick={() => shareViaWhatsApp(payment)}
                                                title={t('Share via WhatsApp')}
                                                style={{ marginRight: '5px', backgroundColor: '#25D366', borderColor: '#25D366', color: 'white' }}
                                            >
                                                📱
                                            </button>
                                            {!isReadOnly && (
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(payment)}
                                                    title={t('Delete Payment')}
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
    );
}

export default ImamSalary;
