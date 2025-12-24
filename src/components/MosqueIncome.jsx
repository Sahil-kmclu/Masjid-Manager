import { useMemo, useState } from 'react';
import './MosqueIncome.css';

function MosqueIncome({ mosqueIncome, onDeleteIncome, isReadOnly }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Calculate statistics
    const stats = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const totalIncome = mosqueIncome.reduce(
            (sum, income) => sum + parseFloat(income.amount), 0
        );

        const currentMonthIncome = mosqueIncome.filter(income => {
            const incomeDate = new Date(income.date);
            return incomeDate.getMonth() === currentMonth &&
                incomeDate.getFullYear() === currentYear;
        });

        const monthlyTotal = currentMonthIncome.reduce(
            (sum, income) => sum + parseFloat(income.amount), 0
        );

        // Category breakdown
        const categoryStats = {};
        mosqueIncome.forEach(income => {
            const category = income.category || 'Other';
            if (!categoryStats[category]) {
                categoryStats[category] = {
                    category,
                    totalAmount: 0,
                    count: 0
                };
            }
            categoryStats[category].totalAmount += parseFloat(income.amount);
            categoryStats[category].count += 1;
        });

        const categoriesBreakdown = Object.values(categoryStats)
            .sort((a, b) => b.totalAmount - a.totalAmount);

        return {
            totalIncome,
            monthlyTotal,
            incomeCount: mosqueIncome.length,
            categoriesBreakdown
        };
    }, [mosqueIncome]);

    // Filter income records
    const filteredIncome = useMemo(() => {
        let filtered = mosqueIncome;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(income =>
                income.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                income.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(income => income.category === categoryFilter);
        }

        return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [mosqueIncome, searchTerm, categoryFilter]);

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set(mosqueIncome.map(income => income.category || 'Other'));
        return Array.from(cats).sort();
    }, [mosqueIncome]);

    return (
        <div className="mosque-income fade-in">
            <div className="page-header">
                <div>
                    <h2>📊 Mosque Income Management</h2>
                    <p className="text-muted">Track all other income sources for the mosque</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-3" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        💵
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Income</div>
                        <div className="stat-value">₹{stats.totalIncome.toLocaleString()}</div>
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
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        📈
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Records</div>
                        <div className="stat-value">{stats.incomeCount}</div>
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            {stats.categoriesBreakdown.length > 0 && (
                <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <h3>Income by Category</h3>
                    <div className="category-breakdown">
                        {stats.categoriesBreakdown.map((cat) => (
                            <div key={cat.category} className="category-item">
                                <div className="category-info">
                                    <div className="category-name">{cat.category}</div>
                                    <div className="category-count">{cat.count} entries</div>
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
                        placeholder="Search by source or description..."
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
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Income Records Table */}
            <div className="card">
                <h3>Income Records ({filteredIncome.length})</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Source</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredIncome.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                        {searchTerm || categoryFilter !== 'all'
                                            ? 'No income records found matching your filters'
                                            : 'No mosque income recorded yet'}
                                    </td>
                                </tr>
                            ) : (
                                filteredIncome.map((income) => (
                                    <tr key={income.id}>
                                        <td>
                                            <div className="income-source">{income.source}</div>
                                        </td>
                                        <td>
                                            <span className="badge badge-primary">{income.category || 'Other'}</span>
                                        </td>
                                        <td>
                                            <span className="amount-badge">₹{parseFloat(income.amount).toLocaleString()}</span>
                                        </td>
                                        <td>
                                            {new Date(income.date).toLocaleDateString()}
                                        </td>
                                        <td>{income.description || '-'}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => onDeleteIncome(income.id)}
                                                title="Delete Income Record"
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

export default MosqueIncome;
