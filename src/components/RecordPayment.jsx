import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './RecordPayment.css';

function RecordPayment({ members, payments = [], onAddPayment }) {
    const { t } = useTranslation();
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    const [formData, setFormData] = useState({
        memberId: '',
        month: currentMonth,
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const [minMonth, setMinMonth] = useState('');

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Auto-fill amount and set min month when member is selected
        if (name === 'memberId' && value) {
            const member = members.find(m => m.id === value);
            if (member) {
                setFormData(prev => ({
                    ...prev,
                    amount: member.monthlyAmount
                }));
                // Set min month based on joining date
                if (member.joiningDate) {
                    setMinMonth(member.joiningDate.slice(0, 7));
                } else {
                    setMinMonth('2020-09'); // Fallback for legacy
                }
            }
        } else if (name === 'memberId' && !value) {
             setMinMonth('');
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.memberId) {
            newErrors.memberId = t('Please select a member');
        }

        if (!formData.month) {
            newErrors.month = t('Please select a month');
        } else if (formData.memberId) {
            // Check for duplicate payment
            const isDuplicate = payments.some(p => 
                p.memberId === formData.memberId && 
                p.month === formData.month
            );

            if (isDuplicate) {
                newErrors.month = t('Payment already done this month for this member');
            }
        }

        if (!formData.amount) {
            newErrors.amount = t('Amount is required');
        } else if (parseFloat(formData.amount) <= 0) {
            newErrors.amount = t('Amount must be greater than 0');
        }

        if (!formData.paymentDate) {
            newErrors.paymentDate = t('Payment date is required');
        }

        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onAddPayment(formData);

        // Reset form but keep the current month
        setFormData({
            memberId: '',
            month: currentMonth,
            amount: '',
            paymentDate: new Date().toISOString().split('T')[0],
            notes: '',
        });

        alert(t('Payment recorded successfully!'));
    };

    const selectedMember = members.find(m => m.id === formData.memberId);

    return (
        <div className="record-payment fade-in">
            <div className="page-header">
                <h2>{t('Record Payment')}</h2>
                <p className="text-muted">{t('Record a monthly donation payment')}</p>
            </div>

            <div className="grid grid-cols-2">
                <div className="card form-card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="memberId">
                                {t('Select Member')} *
                            </label>
                            <select
                                id="memberId"
                                name="memberId"
                                className="form-select"
                                value={formData.memberId}
                                onChange={handleChange}
                            >
                                <option value="">{t('-- Choose a member --')}</option>
                                {members.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {member.name} - ₹{member.monthlyAmount}{t('/month')}
                                    </option>
                                ))}
                            </select>
                            {errors.memberId && <span className="error-message">{errors.memberId}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="month">
                                    {t('Payment Month')} *
                                </label>
                                <input
                                    type="month"
                                    id="month"
                                    name="month"
                                    className="form-input"
                                    value={formData.month}
                                    onChange={handleChange}
                                    min={minMonth}
                                />
                                {errors.month && <span className="error-message">{errors.month}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="paymentDate">
                                    {t('Payment Date')} *
                                </label>
                                <input
                                    type="date"
                                    id="paymentDate"
                                    name="paymentDate"
                                    className="form-input"
                                    value={formData.paymentDate}
                                    onChange={handleChange}
                                />
                                {errors.paymentDate && <span className="error-message">{errors.paymentDate}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="amount">
                                {t('Amount (₹)')} *
                            </label>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                className="form-input"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder={t("Enter payment amount")}
                                min="0"
                                step="1"
                            />
                            {errors.amount && <span className="error-message">{errors.amount}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="notes">
                                {t('Notes (Optional)')}
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                className="form-textarea"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder={t("Add any notes about this payment")}
                                rows="3"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                <span>💰</span>
                                {t('Record Payment')}
                            </button>
                        </div>
                    </form>
                </div>

                {selectedMember && (
                    <div className="card member-info-card">
                        <h3>{t('Member Details')}</h3>
                        <div className="member-info">
                            <div className="info-item">
                                <span className="info-label">{t('Name')}</span>
                                <span className="info-value">{selectedMember.name}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">{t('Phone')}</span>
                                <span className="info-value">{selectedMember.phone}</span>
                            </div>
                            {selectedMember.email && (
                                <div className="info-item">
                                    <span className="info-label">{t('Email')}</span>
                                    <span className="info-value">{selectedMember.email}</span>
                                </div>
                            )}
                            <div className="info-item">
                                <span className="info-label">{t('Monthly Amount')}</span>
                                <span className="info-value highlight">₹{selectedMember.monthlyAmount}</span>
                            </div>
                            {selectedMember.address && (
                                <div className="info-item">
                                    <span className="info-label">{t('Address')}</span>
                                    <span className="info-value">{selectedMember.address}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecordPayment;
