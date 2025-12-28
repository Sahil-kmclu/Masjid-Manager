import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Expenses.css';

function Expenses({ expenses, onDeleteExpense, isReadOnly }) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Calculate statistics
    const stats = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const totalExpenses = (expenses || []).reduce(
            (sum, expense) => sum + parseFloat(expense.amount), 0
        );

        const currentMonthExpenses = (expenses || []).filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth &&
                expenseDate.getFullYear() === currentYear;
        });

        const monthlyTotal = currentMonthExpenses.reduce(
            (sum, expense) => sum + parseFloat(expense.amount), 0
        );

        // Category breakdown
        const categoryStats = {};
        (expenses || []).forEach(expense => {
            const category = expense.category || 'Other';
            if (!categoryStats[category]) {
                categoryStats[category] = {
                    category,
                    totalAmount: 0,
                    count: 0
                };
            }
            categoryStats[category].totalAmount += parseFloat(expense.amount);
            categoryStats[category].count += 1;
        });

        const categoriesBreakdown = Object.values(categoryStats)
            .sort((a, b) => b.totalAmount - a.totalAmount);

        return {
            totalExpenses,
            monthlyTotal,
            expenseCount: (expenses || []).length,
            categoriesBreakdown
        };
    }, [expenses]);

    // Filter expenses
    const filteredExpenses = useMemo(() => {
        let filtered = expenses || [];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(expense =>
                expense.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                expense.paidTo?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(expense => expense.category === categoryFilter);
        }

        return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [expenses, searchTerm, categoryFilter]);

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set((expenses || []).map(expense => expense.category || 'Other'));
        return Array.from(cats).sort();
    }, [expenses]);

    return (
        <div className="expenses fade-in">
            <div className="page-header">
                <div>
                    <h2>💸 {t('Expense Management')}</h2>
                    <p className="text-muted">{t('Track all mosque expenditures')}</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-3" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        💸
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('Total Expenses')}</div>
                        <div className="stat-value">₹{stats.totalExpenses.toLocaleString()}</div>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                        📅
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('This Month')}</div>
                        <div className="stat-value">₹{stats.monthlyTotal.toLocaleString()}</div>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        📊
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('Total Records')}</div>
                        <div className="stat-value">{stats.expenseCount}</div>
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            {stats.categoriesBreakdown.length > 0 && (
                <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <h3>{t('Expense Breakdown by Category')}</h3>
                    <div className="category-breakdown">
                        {stats.categoriesBreakdown.map((cat) => (
                            <div key={cat.category} className="category-item">
                                <div className="category-info">
                                    <div className="category-name">{t(cat.category)}</div>
                                    <div className="category-count">{cat.count} {t('expenses')}</div>
                                </div>
                                <div className="category-amount">₹{cat.totalAmount.toLocaleString()}</div>
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
                        placeholder={t('Search by purpose or paid to...')}
                        className="form-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <select
                        className="form-select filter-select"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">{t('All Categories')}</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{t(cat)}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Expense Records Table */}
            <div className="card">
                <h3>{t('Expense Records')} ({filteredExpenses.length})</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>{t('Purpose')}</th>
                                <th>{t('Category')}</th>
                                <th>{t('Amount')}</th>
                                <th>{t('Date')}</th>
                                <th>{t('Paid To')}</th>
                                <th>{t('Payment Method')}</th>
                                <th>{t('Actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                                        {searchTerm || categoryFilter !== 'all'
                                            ? t('No expenses found matching your filters')
                                            : t('No expenses recorded yet')}
                                    </td>
                                </tr>
                            ) : (
                                filteredExpenses.map((expense) => (
                                    <tr key={expense.id}>
                                        <td>
                                            <div className="expense-purpose">{expense.purpose}</div>
                                            {expense.notes && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                                                    {expense.notes}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span className="badge badge-primary">{t(expense.category || 'Other')}</span>
                                        </td>
                                        <td>
                                            <span className="amount-badge" style={{ background: 'var(--color-danger)', color: 'white' }}>
                                                ₹{parseFloat(expense.amount).toLocaleString()}
                                            </span>
                                        </td>
                                        <td>
                                            {new Date(expense.date).toLocaleDateString()}
                                        </td>
                                        <td>{expense.paidTo || '-'}</td>
                                        <td>{t(expense.paymentMethod) || '-'}</td>
                                        <td>
                                            {!isReadOnly && (
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => onDeleteExpense(expense.id)}
                                                    title={t('Delete Expense')}
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

export default Expenses;
