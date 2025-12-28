import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './Dashboard.css';

function Dashboard({ members = [], payments = [], imamSalaryPayments = [], imamPayouts = [], mosqueIncome = [], expenses = [], isReadOnly }) {
    const { t } = useTranslation();
    const stats = useMemo(() => {
        // Ensure all inputs are arrays to prevent crashes
        const safeMembers = Array.isArray(members) ? members : [];
        const safePayments = Array.isArray(payments) ? payments : [];
        const safeImamSalary = Array.isArray(imamSalaryPayments) ? imamSalaryPayments : [];
        const safeImamPayouts = Array.isArray(imamPayouts) ? imamPayouts : [];
        const safeMosqueIncome = Array.isArray(mosqueIncome) ? mosqueIncome : [];
        const safeExpenses = Array.isArray(expenses) ? expenses : [];

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const currentMonthPayments = safePayments.filter(p => {
            if (!p || !p.month) return false;
            const paymentDate = new Date(p.month + '-01');
            return paymentDate.getMonth() === currentMonth &&
                paymentDate.getFullYear() === currentYear;
        });

        const totalCollected = currentMonthPayments.reduce(
            (sum, p) => sum + (parseFloat(p?.amount) || 0), 0
        );

        const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

        // Filter members who have joined by this month
        const activeMembers = safeMembers.filter(m => {
            if (!m.joiningDate) return true; // Legacy members assumed active
            return m.joiningDate.slice(0, 7) <= currentMonthKey;
        });

        const expectedAmount = activeMembers.reduce(
            (sum, m) => sum + (parseFloat(m?.monthlyAmount) || 0), 0
        );

        // Imam Salary stats
        const sep2020 = new Date('2020-09-01');
        const allImamSalary = safeImamSalary.filter(p => {
            if (!p || !p.month) return false;
            const paymentDate = new Date(p.month + '-01');
            return paymentDate >= sep2020;
        });

        const totalImamSalary = allImamSalary.reduce(
            (sum, p) => sum + (parseFloat(p?.amount) || 0), 0
        );

        const currentMonthImamSalaryList = allImamSalary.filter(p => {
            const paymentDate = new Date(p.month + '-01');
            return paymentDate.getMonth() === currentMonth &&
                paymentDate.getFullYear() === currentYear;
        });

        const monthlyImamSalary = currentMonthImamSalaryList.reduce(
            (sum, p) => sum + (parseFloat(p?.amount) || 0), 0
        );

        // Combined Stats (General + Imam Salary) for Main Dashboard Cards
        // A member is considered "Paid" if they have made ANY payment (General or Imam Salary) this month
        const allCurrentMonthPayments = [...currentMonthPayments, ...currentMonthImamSalaryList];
        
        const totalCollectedCombined = allCurrentMonthPayments.reduce(
            (sum, p) => sum + (parseFloat(p?.amount) || 0), 0
        );

        const paidMemberIds = new Set(allCurrentMonthPayments.map(p => p?.memberId).filter(Boolean));
        const pendingMembers = activeMembers.filter(m => m && !paidMemberIds.has(m.id));
        const pendingAmount = expectedAmount - totalCollectedCombined;

        // Mosque Income stats
        const totalMosqueIncome = safeMosqueIncome.reduce(
            (sum, income) => sum + (parseFloat(income?.amount) || 0), 0
        );

        const currentMonthIncome = safeMosqueIncome.filter(income => {
            if (!income || !income.date) return false;
            const incomeDate = new Date(income.date);
            return incomeDate.getMonth() === currentMonth &&
                incomeDate.getFullYear() === currentYear;
        });

        const monthlyMosqueIncome = currentMonthIncome.reduce(
            (sum, income) => sum + (parseFloat(income?.amount) || 0), 0
        );

        // Expense stats
        const totalExpenses = safeExpenses.reduce(
            (sum, expense) => sum + (parseFloat(expense?.amount) || 0), 0
        );

        const currentMonthExpenses = safeExpenses.filter(expense => {
            if (!expense || !expense.date) return false;
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth &&
                expenseDate.getFullYear() === currentYear;
        });

        const monthlyExpenses = currentMonthExpenses.reduce(
            (sum, expense) => sum + (parseFloat(expense?.amount) || 0), 0
        );

        // Calculate Imam Payouts (Expenses for Imam Salary)
        const totalImamPayouts = safeImamPayouts.reduce(
            (sum, p) => sum + (parseFloat(p?.amount) || 0), 0
        );

        // Calculate Net Imam Salary Fund (Collected - Paid)
        const netImamSalary = totalImamSalary - totalImamPayouts;

        // Calculate total income and remaining balance
        // Use all payments for all-time income, not just filtered ones if available
        const allTimeIncome = safePayments.reduce((sum, p) => sum + parseFloat(p?.amount || 0), 0);
        const totalIncome = allTimeIncome + totalImamSalary + totalMosqueIncome;
        
        // Remaining Balance = Total Income - General Expenses - Imam Payouts
        const remainingBalance = totalIncome - totalExpenses - totalImamPayouts;

        return {
            totalMembers: safeMembers.length,
            paidMembers: paidMemberIds.size,
            pendingMembers: pendingMembers.length,
            totalCollected: totalCollectedCombined,
            expectedAmount,
            pendingAmount,
            completionRate: expectedAmount > 0
                ? ((totalCollectedCombined / expectedAmount) * 100).toFixed(1)
                : 0,
            totalImamSalary,
            netImamSalary,
            monthlyImamSalary,
            totalMosqueIncome,
            monthlyMosqueIncome,
            totalExpenses,
            monthlyExpenses,
            totalIncome,
            remainingBalance,
        };
    }, [members, payments, imamSalaryPayments, imamPayouts, mosqueIncome, expenses]);

    const yearlyAnalytics = useMemo(() => {
        const safePayments = Array.isArray(payments) ? payments : [];
        const safeImamSalary = Array.isArray(imamSalaryPayments) ? imamSalaryPayments : [];
        const safeImamPayouts = Array.isArray(imamPayouts) ? imamPayouts : [];
        const safeMosqueIncome = Array.isArray(mosqueIncome) ? mosqueIncome : [];
        const safeExpenses = Array.isArray(expenses) ? expenses : [];

        const last12Months = [];
        const today = new Date();

        for (let i = 11; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const month = d.getMonth();
            const year = d.getFullYear();
            const label = d.toLocaleDateString('en-US', { month: 'short' });

            // Calculate Income for this month
            const monthlyPayments = safePayments.filter(p => {
                if (!p || !p.month) return false;
                const pDate = new Date(p.month + '-01');
                return pDate.getMonth() === month && pDate.getFullYear() === year;
            }).reduce((sum, p) => sum + (parseFloat(p?.amount) || 0), 0);

            const monthlyImamSalary = safeImamSalary.filter(p => {
                if (!p || !p.month) return false;
                const pDate = new Date(p.month + '-01');
                return pDate.getMonth() === month && pDate.getFullYear() === year;
            }).reduce((sum, p) => sum + (parseFloat(p?.amount) || 0), 0);

            const monthlyMosqueIncome = safeMosqueIncome.filter(i => {
                if (!i || !i.date) return false;
                const iDate = new Date(i.date);
                return iDate.getMonth() === month && iDate.getFullYear() === year;
            }).reduce((sum, i) => sum + (parseFloat(i?.amount) || 0), 0);

            const totalIncome = monthlyPayments + monthlyImamSalary + monthlyMosqueIncome;

            // Calculate Expense for this month
            const monthlyGeneralExpenses = safeExpenses.filter(e => {
                if (!e || !e.date) return false;
                const eDate = new Date(e.date);
                return eDate.getMonth() === month && eDate.getFullYear() === year;
            }).reduce((sum, e) => sum + (parseFloat(e?.amount) || 0), 0);

            const monthlyImamPayouts = safeImamPayouts.filter(p => {
                if (!p || !p.month) return false;
                const pDate = new Date(p.month + '-01');
                return pDate.getMonth() === month && pDate.getFullYear() === year;
            }).reduce((sum, p) => sum + (parseFloat(p?.amount) || 0), 0);

            const monthlyExpenses = monthlyGeneralExpenses + monthlyImamPayouts;

            last12Months.push({
                label,
                income: totalIncome,
                expense: monthlyExpenses
            });
        }
        return last12Months;
    }, [payments, imamSalaryPayments, imamPayouts, mosqueIncome, expenses]);

    const maxVal = Math.max(...yearlyAnalytics.map(d => Math.max(d.income, d.expense)), 100); // Avoid divide by zero

    return (
        <div className="dashboard fade-in">
            <div className="dashboard-header">
                <h2>{t('Dashboard Overview')}</h2>
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
                        <div className="stat-label">{t('Total Members')}</div>
                        <div className="stat-value">{stats.totalMembers}</div>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        ✓
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('Paid This Month')}</div>
                        <div className="stat-value">{stats.paidMembers}</div>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        ⏰
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('Pending Members')}</div>
                        <div className="stat-value">{stats.pendingMembers}</div>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        📊
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('Completion Rate')}</div>
                        <div className="stat-value">{stats.completionRate}%</div>
                    </div>
                </div>
            </div>

            {/* Additional Income Stats */}
            <div className="grid grid-cols-3" style={{ marginTop: 'var(--spacing-lg)' }}>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        🕌
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('Total Imam Salary Collected')}</div>
                        <div className="stat-value">₹{stats.totalImamSalary.toLocaleString()}</div>
                        <div className="stat-meta" style={{ fontSize: '0.875rem', color: 'var(--color-text-light)', marginTop: '4px' }}>
                            {t('This Month')}: ₹{stats.monthlyImamSalary.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)' }}>
                        ⚖️
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('Imam Salary Fund Balance')}</div>
                        <div className="stat-value">₹{stats.netImamSalary.toLocaleString()}</div>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                        📊
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('Total Mosque Income')}</div>
                        <div className="stat-value">₹{stats.totalMosqueIncome.toLocaleString()}</div>
                        <div className="stat-meta" style={{ fontSize: '0.875rem', color: 'var(--color-text-light)', marginTop: '4px' }}>
                            {t('This Month')}: ₹{stats.monthlyMosqueIncome.toLocaleString()}
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
                        <div className="stat-label">{t('Remaining Balance')}</div>
                        <div className="stat-value" style={{ color: stats.remainingBalance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                            ₹{stats.remainingBalance.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
                            <div style={{ marginBottom: '4px' }}>
                                <strong>{t('Total Income')}:</strong> ₹{stats.totalIncome.toLocaleString()}
                            </div>
                            <div>
                                <strong>{t('Total Expenses')}:</strong> ₹{stats.totalExpenses.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        💸
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('Total Expenses')}</div>
                        <div className="stat-value">₹{stats.totalExpenses.toLocaleString()}</div>
                        <div className="stat-meta" style={{ fontSize: '0.875rem', color: 'var(--color-text-light)', marginTop: '4px' }}>
                            {t('This Month')}: ₹{stats.monthlyExpenses.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2" style={{ marginTop: 'var(--spacing-lg)' }}>
                <div className="card">
                    <h3>{t('Monthly Collection')}</h3>
                    <div className="amount-display">
                        <div className="amount-item">
                            <span className="amount-label">{t('Expected')}</span>
                            <span className="amount-value success">₹{stats.expectedAmount.toLocaleString()}</span>
                        </div>
                        <div className="amount-item">
                            <span className="amount-label">{t('Collected')}</span>
                            <span className="amount-value primary">₹{stats.totalCollected.toLocaleString()}</span>
                        </div>
                        <div className="amount-item">
                            <span className="amount-label">{t('Pending')}</span>
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
                    <div className="chart-header">
                        <h3>{t('Yearly Analytics')}</h3>
                        <div className="chart-legend">
                            <div className="legend-item">
                                <div className="legend-color income"></div>
                                <span>{t('Income')}</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color expense"></div>
                                <span>{t('Expense')}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="analytics-chart-container">
                        {yearlyAnalytics.map((item, index) => (
                            <div key={index} className="analytics-chart-item">
                                <div className="analytics-bars-wrapper">
                                    {/* Income Bar */}
                                    <div 
                                        className="analytics-bar income"
                                        title={`Income: ₹${item.income}`}
                                        style={{ 
                                            height: `${(item.income / maxVal) * 100}%`,
                                        }}
                                    ></div>
                                    {/* Expense Bar */}
                                    <div 
                                        className="analytics-bar expense"
                                        title={`Expense: ₹${item.expense}`}
                                        style={{ 
                                            height: `${(item.expense / maxVal) * 100}%`,
                                        }}
                                    ></div>
                                </div>
                                <span className="analytics-label">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
