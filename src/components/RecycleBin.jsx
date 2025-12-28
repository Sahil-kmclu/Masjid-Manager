import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './RecycleBin.css';

const RecycleBin = ({ deletedItems = [], onRestore, onPermanentDelete, onEmptyBin, isReadOnly }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const filteredItems = deletedItems.filter(item => {
        const matchesSearch = JSON.stringify(item.originalData).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || item.type === filterType;
        return matchesSearch && matchesType;
    }).sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));

    const getTypeLabel = (type) => {
        switch (type) {
            case 'member': return t('Member');
            case 'payment': return t('Payment');
            case 'imam_salary_payment': return t('Imam Salary Payment');
            case 'imam_payout': return t('Imam Payout');
            case 'mosque_income': return t('Mosque Income');
            case 'expense': return t('Expense');
            default: return type;
        }
    };

    const getSummary = (item) => {
        const data = item.originalData;
        switch (item.type) {
            case 'member':
                return `${data.name} (${data.phone || t('No Phone')})`;
            case 'payment':
                return `${t('Payment')}: ${data.amount} (${t('Member ID')}: ${data.memberId})`;
            case 'imam_salary_payment':
                return `${t('Imam Salary')}: ${data.amount} (${t('Member ID')}: ${data.memberId})`;
            case 'imam_payout':
                return `${t('Payout')}: ${data.amount} ${t('for')} ${data.month}/${data.year}`;
            case 'mosque_income':
                return `${t('Income')}: ${data.amount} - ${data.source}`;
            case 'expense':
                return `${t('Expense')}: ${data.amount} - ${data.description}`;
            default:
                return t('Unknown Item');
        }
    };

    if (isReadOnly) {
        return <div className="recycle-bin-empty">{t('Access Denied')}</div>;
    }

    return (
        <div className="recycle-bin">
            <div className="page-header">
                <h2>♻️ {t('Recycle Bin')}</h2>
                {deletedItems.length > 0 && (
                    <button 
                        className="btn btn-danger"
                        onClick={() => {
                            if (window.confirm(t('Are you sure you want to permanently delete ALL items? This cannot be undone.'))) {
                                onEmptyBin();
                            }
                        }}
                    >
                        {t('Empty Bin')}
                    </button>
                )}
            </div>

            <div className="filters-row">
                <input
                    type="text"
                    placeholder={t('Search deleted items...')}
                    className="form-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select 
                    className="form-input"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="all">{t('All Types')}</option>
                    <option value="member">{t('Members')}</option>
                    <option value="payment">{t('Payments')}</option>
                    <option value="imam_salary_payment">{t('Imam Salary Payments')}</option>
                    <option value="imam_payout">{t('Imam Payouts')}</option>
                    <option value="mosque_income">{t('Income')}</option>
                    <option value="expense">{t('Expenses')}</option>
                </select>
            </div>

            {filteredItems.length === 0 ? (
                <div className="empty-state">
                    <p>{t('No items in the recycle bin.')}</p>
                </div>
            ) : (
                <div className="deleted-items-list">
                    {filteredItems.map(item => (
                        <div key={item.id} className="deleted-item-card">
                            <div className="item-info">
                                <span className={`item-type type-${item.type}`}>
                                    {getTypeLabel(item.type)}
                                </span>
                                <h3 className="item-summary">{getSummary(item)}</h3>
                                <div className="item-meta">
                                    <span>{t('Deleted')}: {new Date(item.deletedAt).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="item-actions">
                                <button 
                                    className="btn btn-success btn-sm"
                                    onClick={() => onRestore(item.id)}
                                    title={t('Restore')}
                                >
                                    ↩️ {t('Restore')}
                                </button>
                                <button 
                                    className="btn btn-danger btn-sm"
                                    onClick={() => {
                                        if (window.confirm(t('Permanently delete this item?'))) {
                                            onPermanentDelete(item.id);
                                        }
                                    }}
                                    title={t('Permanently Delete')}
                                >
                                    🗑️ {t('Delete')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecycleBin;
