import { useMemo, useState } from 'react';
import './ImamSalary.css';

function ImamSalary({ members, imamSalaryPayments, onDeletePayment }) {
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

    return (
        <div className="imam-salary fade-in">
            <div className="page-header">
                <div>
                    <h2>🕌 Imam Sahab Salary Tracking</h2>
                    <p className="text-muted">Track salary contributions from September 2020 onwards</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        💰
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Salary Collected</div>
                        <div className="stat-value">₹{stats.totalCollected.toLocaleString()}</div>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        📅
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">This Month</div>
                        <div className="stat-value">₹{stats.monthlyTotal.toLocaleString()}</div>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        👥
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Contributing Members</div>
                        <div className="stat-value">{stats.contributingMembers}/{stats.totalMembers}</div>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        📊
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Payments</div>
                        <div className="stat-value">{stats.paymentCount}</div>
                    </div>
                </div>
            </div>

            {/* Top Contributors */}
            {stats.topContributors.length > 0 && (
                <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <h3>Top Contributors</h3>
                    <div className="top-contributors">
                        {stats.topContributors.map((contributor, index) => (
                            <div key={contributor.memberId} className="contributor-item">
                                <div className="contributor-rank">#{index + 1}</div>
                                <div className="contributor-info">
                                    <div className="contributor-name">{contributor.memberName}</div>
                                    <div className="contributor-stats">
                                        {contributor.paymentCount} payments
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
                        placeholder="Search by member name or phone..."
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
                        <option value="all">All Time</option>
                        <option value="thisMonth">This Month</option>
                        <option value="thisYear">This Year</option>
                    </select>
                </div>
            </div>

            {/* Payment Records Table */}
            <div className="card">
                <h3>Salary Payments ({filteredPayments.length})</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Member Name</th>
                                <th>Phone</th>
                                <th>Month</th>
                                <th>Amount</th>
                                <th>Payment Date</th>
                                <th>Notes</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                                        {searchTerm || dateFilter !== 'all'
                                            ? 'No payments found matching your filters'
                                            : 'No Imam salary payments recorded yet'}
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
                                                className="btn btn-sm btn-danger"
                                                onClick={() => onDeletePayment(payment.id)}
                                                title="Delete Payment"
                                            >
                                                🗑️
                                            </button>
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
