import { useState } from 'react';
import './RecordPayment.css';

function RecordImamSalary({ members, onAddPayment }) {
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const minDate = '2020-09';

    const [formData, setFormData] = useState({
        memberId: '',
        month: currentMonth,
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Auto-fill amount when member is selected
        if (name === 'memberId' && value) {
            const member = members.find(m => m.id === value);
            if (member) {
                setFormData(prev => ({
                    ...prev,
                    amount: member.monthlyAmount
                }));
            }
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.memberId) {
            newErrors.memberId = 'Please select a member';
        }

        if (!formData.month) {
            newErrors.month = 'Please select a month';
        } else {
            // Validate month is not before September 2020
            const selectedMonth = new Date(formData.month + '-01');
            const sep2020 = new Date('2020-09-01');
            if (selectedMonth < sep2020) {
                newErrors.month = 'Imam salary tracking starts from September 2020';
            }
        }

        if (!formData.amount) {
            newErrors.amount = 'Amount is required';
        } else if (parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        }

        if (!formData.paymentDate) {
            newErrors.paymentDate = 'Payment date is required';
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

        alert('Imam salary payment recorded successfully!');
    };

    const selectedMember = members.find(m => m.id === formData.memberId);

    return (
        <div className="record-payment fade-in">
            <div className="page-header">
                <h2>💰 Record Imam Salary Payment</h2>
                <p className="text-muted">Record monthly Imam salary contribution from a member</p>
            </div>

            <div className="grid grid-cols-2">
                <div className="card form-card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="memberId">
                                Select Member *
                            </label>
                            <select
                                id="memberId"
                                name="memberId"
                                className="form-select"
                                value={formData.memberId}
                                onChange={handleChange}
                            >
                                <option value="">-- Choose a member --</option>
                                {members.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {member.name} - ₹{member.monthlyAmount}/month
                                    </option>
                                ))}
                            </select>
                            {errors.memberId && <span className="error-message">{errors.memberId}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="month">
                                    Payment Month *
                                </label>
                                <input
                                    type="month"
                                    id="month"
                                    name="month"
                                    className="form-input"
                                    value={formData.month}
                                    onChange={handleChange}
                                    min={minDate}
                                />
                                {errors.month && <span className="error-message">{errors.month}</span>}
                                <small className="form-hint">From September 2020 onwards</small>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="paymentDate">
                                    Payment Date *
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
                                Amount (₹) *
                            </label>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                className="form-input"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="Enter payment amount"
                                min="0"
                                step="1"
                            />
                            {errors.amount && <span className="error-message">{errors.amount}</span>}
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
                                placeholder="Add any notes about this payment"
                                rows="3"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                <span>💰</span>
                                Record Salary Payment
                            </button>
                        </div>
                    </form>
                </div>

                {selectedMember && (
                    <div className="card member-info-card">
                        <h3>Member Details</h3>
                        <div className="member-info">
                            <div className="info-item">
                                <span className="info-label">Name</span>
                                <span className="info-value">{selectedMember.name}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Phone</span>
                                <span className="info-value">{selectedMember.phone}</span>
                            </div>
                            {selectedMember.email && (
                                <div className="info-item">
                                    <span className="info-label">Email</span>
                                    <span className="info-value">{selectedMember.email}</span>
                                </div>
                            )}
                            <div className="info-item">
                                <span className="info-label">Monthly Amount</span>
                                <span className="info-value highlight">₹{selectedMember.monthlyAmount}</span>
                            </div>
                            {selectedMember.address && (
                                <div className="info-item">
                                    <span className="info-label">Address</span>
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

export default RecordImamSalary;
