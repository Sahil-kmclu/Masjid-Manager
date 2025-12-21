import { useState } from 'react';
import './RecordPayment.css';

function AddExpense({ onAddExpense, onCancel }) {
    const [formData, setFormData] = useState({
        purpose: '',
        category: 'Electricity Bill',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paidTo: '',
        paymentMethod: 'Cash',
        notes: '',
    });

    const [errors, setErrors] = useState({});

    const categories = [
        'Electricity Bill',
        'Water Bill',
        'Maintenance & Repairs',
        'Cleaning Supplies',
        'Imam Salary Payment',
        'Events & Programs',
        'Construction',
        'Miscellaneous'
    ];

    const paymentMethods = [
        'Cash',
        'Bank Transfer',
        'UPI',
        'Cheque',
        'Other'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.purpose.trim()) {
            newErrors.purpose = 'Expense purpose is required';
        }

        if (!formData.category) {
            newErrors.category = 'Please select a category';
        }

        if (!formData.amount) {
            newErrors.amount = 'Amount is required';
        } else if (parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        }

        if (!formData.date) {
            newErrors.date = 'Date is required';
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

        onAddExpense(formData);

        // Reset form
        setFormData({
            purpose: '',
            category: 'Electricity Bill',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            paidTo: '',
            paymentMethod: 'Cash',
            notes: '',
        });

        alert('Expense recorded successfully!');
    };

    return (
        <div className="record-payment fade-in">
            <div className="page-header">
                <h2>➖ Add Expense</h2>
                <p className="text-muted">Record mosque expenditure</p>
            </div>

            <div className="card form-card" style={{ maxWidth: '700px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="purpose">
                            Expense Purpose *
                        </label>
                        <input
                            type="text"
                            id="purpose"
                            name="purpose"
                            className="form-input"
                            value={formData.purpose}
                            onChange={handleChange}
                            placeholder="e.g., Monthly electricity bill, Mosque renovation"
                        />
                        {errors.purpose && <span className="error-message">{errors.purpose}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="category">
                                Category *
                            </label>
                            <select
                                id="category"
                                name="category"
                                className="form-select"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            {errors.category && <span className="error-message">{errors.category}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="amount">
                                Amount (₹) *
                            </label>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                className="form-input"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="Enter amount"
                                min="0"
                                step="1"
                            />
                            {errors.amount && <span className="error-message">{errors.amount}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="date">
                                Date *
                            </label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                className="form-input"
                                value={formData.date}
                                onChange={handleChange}
                            />
                            {errors.date && <span className="error-message">{errors.date}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="paymentMethod">
                                Payment Method
                            </label>
                            <select
                                id="paymentMethod"
                                name="paymentMethod"
                                className="form-select"
                                value={formData.paymentMethod}
                                onChange={handleChange}
                            >
                                {paymentMethods.map(method => (
                                    <option key={method} value={method}>{method}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="paidTo">
                            Paid To (Vendor/Person)
                        </label>
                        <input
                            type="text"
                            id="paidTo"
                            name="paidTo"
                            className="form-input"
                            value={formData.paidTo}
                            onChange={handleChange}
                            placeholder="Enter vendor or person name"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="notes">
                            Notes (Optional)
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            className="form-textarea"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Add any additional details about this expense"
                            rows="3"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            <span>💸</span>
                            Record Expense
                        </button>
                        {onCancel && (
                            <button type="button" className="btn btn-secondary" onClick={onCancel}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddExpense;
