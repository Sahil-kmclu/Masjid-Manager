import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import './MosqueIncome.css';

function MosqueIncome({ mosqueIncome, onDeleteIncome, isReadOnly }) {
    const { t } = useTranslation();
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

    const generateReceipt = (income) => {
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
        
        addLine('Receipt No', income.id.slice(-6).toUpperCase());
        addLine('Date', new Date(income.date).toLocaleDateString());
        addLine('Name', income.donorName);
        addLine('Mobile Number', income.mobileNumber);
        addLine('Address', income.address);
        addLine('Category', income.category);
        addLine('Source', income.source);
        addLine('Amount', `Rs. ${parseFloat(income.amount).toLocaleString()}`);
        if (income.description) {
            addLine('Description', income.description);
        }
        
        // Footer
        doc.setLineWidth(0.5);
        doc.line(20, y + 10, 190, y + 10);
        
        doc.setFontSize(10);
        doc.text('Thank you for your contribution!', 105, y + 25, { align: 'center' });
        
        doc.save(`Receipt_${income.donorName || 'Donor'}_${income.date}.pdf`);
    };

    const shareViaWhatsApp = (income) => {
        const currentUser = JSON.parse(localStorage.getItem('masjid_current_user') || '{}');
        const mosqueName = currentUser.name || t('Mosque Receipt');
        
        const message = encodeURIComponent(
            `*${mosqueName}*\n\n` +
            `${t('Date')}: ${new Date(income.date).toLocaleDateString()}\n` +
            `${t('Receipt No')}: ${income.id.slice(-6).toUpperCase()}\n` +
            `${t('Name')}: ${income.donorName || '-'}\n` +
            `${t('Amount')}: Rs. ${parseFloat(income.amount).toLocaleString()}\n` +
            `${t('Category')}: ${t(income.category)}\n\n` +
            `${t('Thank you for your contribution!')}`
        );
        
        const url = income.mobileNumber 
            ? `https://wa.me/${income.mobileNumber.length === 10 ? '91' + income.mobileNumber : income.mobileNumber}?text=${message}`
            : `https://wa.me/?text=${message}`;
            
        window.open(url, '_blank');
    };

    return (
        <div className="mosque-income fade-in">
            <div className="page-header">
                <div>
                    <h2>📊 {t('Mosque Income Management')}</h2>
                    <p className="text-muted">{t('Track all other income sources for the mosque')}</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-3" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        💵
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('Total Income')}</div>
                        <div className="stat-value">₹{stats.totalIncome.toLocaleString()}</div>
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
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        📈
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('Total Records')}</div>
                        <div className="stat-value">{stats.incomeCount}</div>
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            {stats.categoriesBreakdown.length > 0 && (
                <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <h3>{t('Income by Category')}</h3>
                    <div className="category-breakdown">
                        {stats.categoriesBreakdown.map((cat) => (
                            <div key={cat.category} className="category-item">
                                <div className="category-info">
                                    <div className="category-name">{t(cat.category)}</div>
                                    <div className="category-count">{cat.count} {t('entries')}</div>
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
                        placeholder={t('Search by source or description...')}
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

            {/* Income Records Table */}
            <div className="card">
                <h3>{t('Income Records')} ({filteredIncome.length})</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>{t('Donor')}</th>
                                <th>{t('Source')}</th>
                                <th>{t('Category')}</th>
                                <th>{t('Amount')}</th>
                                <th>{t('Date')}</th>
                                <th>{t('Actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredIncome.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                        {searchTerm || categoryFilter !== 'all'
                                            ? t('No income records found matching your filters')
                                            : t('No mosque income recorded yet')}
                                    </td>
                                </tr>
                            ) : (
                                filteredIncome.map((income) => (
                                    <tr key={income.id}>
                                        <td>
                                            <div className="donor-name">{income.donorName || '-'}</div>
                                            {income.mobileNumber && <div className="text-muted text-sm">{income.mobileNumber}</div>}
                                        </td>
                                        <td>
                                            <div className="income-source">{income.source}</div>
                                            {income.description && <div className="text-muted text-sm">{income.description}</div>}
                                        </td>
                                        <td>
                                            <span className="badge badge-primary">{t(income.category || 'Other')}</span>
                                        </td>
                                        <td>
                                            <span className="amount-badge">₹{parseFloat(income.amount).toLocaleString()}</span>
                                        </td>
                                        <td>
                                            {new Date(income.date).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => generateReceipt(income)}
                                                    title={t('Download Receipt')}
                                                >
                                                    🖨️
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => shareViaWhatsApp(income)}
                                                    title={t('Share via WhatsApp')}
                                                    style={{ backgroundColor: '#25D366', borderColor: '#25D366', color: 'white' }}
                                                >
                                                    💬
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => onDeleteIncome(income.id)}
                                                    title={t('Delete Income Record')}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
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
