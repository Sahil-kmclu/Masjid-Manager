import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './AddMember.css';

function AddMember({ onAddMember, onCancel }) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        monthlyAmount: '',
        address: '',
        joiningDate: new Date().toISOString().split('T')[0], // Default to today
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = t('Name is required');
        }

        if (!formData.phone.trim()) {
            newErrors.phone = t('Phone number is required');
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = t('Please enter a valid 10-digit phone number');
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t('Please enter a valid email address');
        }

        if (!formData.monthlyAmount) {
            newErrors.monthlyAmount = t('Monthly amount is required');
        } else if (parseFloat(formData.monthlyAmount) <= 0) {
            newErrors.monthlyAmount = t('Amount must be greater than 0');
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

        onAddMember(formData);

        // Reset form
        setFormData({
            name: '',
            phone: '',
            email: '',
            monthlyAmount: '',
            address: '',
        });

        // Show success message or navigate back
        alert(t('Member added successfully!'));
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <div className="add-member fade-in">
            <div className="page-header">
                <h2>{t('Add New Member')}</h2>
                <p className="text-muted">{t('Add a new member to the donation tracking system')}</p>
            </div>

            <div className="card form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">
                            {t('Full Name')} *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={t("Enter member's full name")}
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="phone">
                                {t('Phone Number')} *
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                className="form-input"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder={t("10-digit mobile number")}
                            />
                            {errors.phone && <span className="error-message">{errors.phone}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="email">
                                {t('Email Address')}
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={t("email@example.com")}
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="monthlyAmount">
                            {t('Monthly Contribution Amount (₹)')} *
                        </label>
                        <input
                            type="number"
                            id="monthlyAmount"
                            name="monthlyAmount"
                            className="form-input"
                            value={formData.monthlyAmount}
                            onChange={handleChange}
                            placeholder={t("Enter monthly amount")}
                            min="0"
                            step="1"
                        />
                        {errors.monthlyAmount && <span className="error-message">{errors.monthlyAmount}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="joiningDate">
                            {t('Joining Date / Start Month')} *
                        </label>
                        <input
                            type="date"
                            id="joiningDate"
                            name="joiningDate"
                            className="form-input"
                            value={formData.joiningDate}
                            onChange={handleChange}
                            required
                        />
                        {errors.joiningDate && <span className="error-message">{errors.joiningDate}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="address">
                            {t('Address')}
                        </label>
                        <textarea
                            id="address"
                            name="address"
                            className="form-textarea"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder={t("Enter member's address")}
                            rows="3"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            <span>✓</span>
                            {t('Add Member')}
                        </button>
                        {onCancel && (
                            <button type="button" className="btn btn-secondary" onClick={onCancel}>
                                {t('Cancel')}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddMember;
