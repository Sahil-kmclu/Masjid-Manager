import { useMemo } from 'react';
import './Dashboard.css';

function Dashboard({ members, payments, imamSalaryPayments, mosqueIncome, expenses }) {
    const stats = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const currentMonthPayments = payments.filter(p => {
            const paymentDate = new Date(p.month + '-01');
            return paymentDate.getMonth() === currentMonth &&
                paymentDate.getFullYear() === currentYear;
        });

        const totalCollected = currentMonthPayments.reduce(
            (sum, p) => sum + (parseFloat(p.amount) || 0), 0
        );

        const expectedAmount = members.reduce(
            (sum, m) => sum + (parseFloat(m.monthlyAmount) || 0), 0
        );

        const pendingAmount = expectedAmount - totalCollected;

        const paidMemberIds = new Set(currentMonthPayments.map(p => p.memberId));
        const pendingMembers = members.filter(m => !paidMemberIds.has(m.id));

        // Imam Salary stats
        const sep2020 = new Date('2020-09-01');
        const allImamSalary = (imamSalaryPayments || []).filter(p => {
            const paymentDate = new Date(p.month + '-01');
            return paymentDate >= sep2020;
        });

        const totalImamSalary = allImamSalary.reduce(
            (sum, p) => sum + (parseFloat(p.amount) || 0), 0
        );

        const currentMonthImamSalary = allImamSalary.filter(p => {
            const paymentDate = new Date(p.month + '-01');
            return paymentDate.getMonth() === currentMonth &&
                paymentDate.getFullYear() === currentYear;
        });

        const monthlyImamSalary = currentMonthImamSalary.reduce(
            (sum, p) => sum + (parseFloat(p.amount) || 0), 0
        );

        // Mosque Income stats
        const allMosqueIncome = mosqueIncome || [];
        const totalMosqueIncome = allMosqueIncome.reduce(
            (sum, income) => sum + (parseFloat(income.amount) || 0), 0
        );

        const currentMonthIncome = allMosqueIncome.filter(income => {
            const incomeDate = new Date(income.date);
            return incomeDate.getMonth() === currentMonth &&
                incomeDate.getFullYear() === currentYear;
        });

        const monthlyMosqueIncome = currentMonthIncome.reduce(
            (sum, income) => sum + (parseFloat(income.amount) || 0), 0
        );

        // Expense stats
        const allExpenses = expenses || [];
        const totalExpenses = allExpenses.reduce(
            (sum, expense) => sum + (parseFloat(expense.amount) || 0), 0
        );

        const currentMonthExpenses = allExpenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth &&
                expenseDate.getFullYear() === currentYear;
        });

        const monthlyExpenses = currentMonthExpenses.reduce(
            (sum, expense) => sum + (parseFloat(expense.amount) || 0), 0
        );

        // Calculate total income and remaining balance
        // Use all payments for all-time income, not just filtered ones if available
        const allTimeIncome = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        const totalIncome = allTimeIncome + totalImamSalary + totalMosqueIncome;
        const remainingBalance = totalIncome - totalExpenses;

        return {
            totalMembers: members.length,
            paidMembers: paidMemberIds.size,
            pendingMembers: pendingMembers.length,
            totalCollected,
            expectedAmount,
            pendingAmount,
            completionRate: expectedAmount > 0
                ? ((totalCollected / expectedAmount) * 100).toFixed(1)
                : 0,
            totalImamSalary,
            monthlyImamSalary,
            totalMosqueIncome,
            monthlyMosqueIncome,
            totalExpenses,
            monthlyExpenses,
            totalIncome,
            remainingBalance,
        };
    }, [members, payments, imamSalaryPayments, mosqueIncome, expenses]);

    const recentPayments = useMemo(() => {
        return [...payments]
            .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
            .slice(0, 5)
            .map(payment => ({
                ...payment,
                memberName: members.find(m => m.id === payment.memberId)?.name || 'Unknown',
            }));
    }, [payments, members]);

    return (
        <div className="dashboard fade-in">
            <div className="dashboard-header">
                <h2>Dashboard Overview</h2>
                <p className="text-muted">
                    {new Date().toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                    })}
                </p>
            </div>

            <div className="grid grid-cols-4">
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        👥
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Members</div>
                        <div className="stat-value">{stats.totalMembers}</div>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        ✓
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Paid This Month</div>
                        <div className="stat-value">{stats.paidMembers}</div>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        ⏰
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Pending Members</div>
                        <div className="stat-value">{stats.pendingMembers}</div>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        📊
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Completion Rate</div>
                        <div className="stat-value">{stats.completionRate}%</div>
                    </div>
                </div>
            </div>

            {/* Additional Income Stats */}
            <div className="grid grid-cols-2" style={{ marginTop: 'var(--spacing-lg)' }}>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        🕌
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Imam Salary (Total)</div>
                        <div className="stat-value">₹{stats.totalImamSalary.toLocaleString()}</div>
                        <div className="stat-meta" style={{ fontSize: '0.875rem', color: 'var(--color-text-light)', marginTop: '4px' }}>
                            This Month: ₹{stats.monthlyImamSalary.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                        📊
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Mosque Income (Total)</div>
                        <div className="stat-value">₹{stats.totalMosqueIncome.toLocaleString()}</div>
                        <div className="stat-meta" style={{ fontSize: '0.875rem', color: 'var(--color-text-light)', marginTop: '4px' }}>
                            This Month: ₹{stats.monthlyMosqueIncome.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Balance and Expenses Stats */}
            <div className="grid grid-cols-2" style={{ marginTop: 'var(--spacing-lg)' }}>
                <div className="stat-card card" style={{ borderLeft: `4px solid ${stats.remainingBalance >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}` }}>
                    <div className="stat-icon" style={{ background: stats.remainingBalance >= 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                        💰
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Remaining Balance</div>
                        <div className="stat-value" style={{ color: stats.remainingBalance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                            ₹{stats.remainingBalance.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
                            <div style={{ marginBottom: '4px' }}>
                                <strong>Total Income:</strong> ₹{stats.totalIncome.toLocaleString()}
                            </div>
                            <div>
                                <strong>Total Expenses:</strong> ₹{stats.totalExpenses.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        💸
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Expenses</div>
                        <div className="stat-value">₹{stats.totalExpenses.toLocaleString()}</div>
                        <div className="stat-meta" style={{ fontSize: '0.875rem', color: 'var(--color-text-light)', marginTop: '4px' }}>
                            This Month: ₹{stats.monthlyExpenses.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2" style={{ marginTop: 'var(--spacing-lg)' }}>
                <div className="card">
                    <h3>Monthly Collection</h3>
                    <div className="amount-display">
                        <div className="amount-item">
                            <span className="amount-label">Expected</span>
                            <span className="amount-value success">₹{stats.expectedAmount.toLocaleString()}</span>
                        </div>
                        <div className="amount-item">
                            <span className="amount-label">Collected</span>
                            <span className="amount-value primary">₹{stats.totalCollected.toLocaleString()}</span>
                        </div>
                        <div className="amount-item">
                            <span className="amount-label">Pending</span>
                            <span className="amount-value danger">₹{stats.pendingAmount.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${stats.completionRate}%` }}
                        />
                    </div>
                </div>

                <div className="card">
                    <h3>Recent Payments</h3>
                    <div className="recent-payments-list">
                        {recentPayments.length === 0 ? (
                            <p className="text-muted">No payments recorded yet</p>
                        ) : (
                            recentPayments.map((payment) => (
                                <div key={payment.id} className="recent-payment-item">
                                    <div>
                                        <div className="payment-member">{payment.memberName}</div>
                                        <div className="payment-date">
                                            {new Date(payment.month + '-01').toLocaleDateString('en-US', {
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                    <div className="payment-amount">₹{parseFloat(payment.amount).toLocaleString()}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
