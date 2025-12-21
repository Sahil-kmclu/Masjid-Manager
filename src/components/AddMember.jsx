import { useState } from 'react';
import './AddMember.css';

function AddMember({ onAddMember, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        monthlyAmount: '',
        address: '',
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
            newErrors.name = 'Name is required';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.monthlyAmount) {
            newErrors.monthlyAmount = 'Monthly amount is required';
        } else if (parseFloat(formData.monthlyAmount) <= 0) {
            newErrors.monthlyAmount = 'Amount must be greater than 0';
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
        alert('Member added successfully!');
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <div className="add-member fade-in">
            <div className="page-header">
                <h2>Add New Member</h2>
                <p className="text-muted">Add a new member to the donation tracking system</p>
            </div>

            <div className="card form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter member's full name"
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="phone">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                className="form-input"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="10-digit mobile number"
                            />
                            {errors.phone && <span className="error-message">{errors.phone}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="email@example.com"
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="monthlyAmount">
                            Monthly Contribution Amount (₹) *
                        </label>
                        <input
                            type="number"
                            id="monthlyAmount"
                            name="monthlyAmount"
                            className="form-input"
                            value={formData.monthlyAmount}
                            onChange={handleChange}
                            placeholder="Enter monthly amount"
                            min="0"
                            step="1"
                        />
                        {errors.monthlyAmount && <span className="error-message">{errors.monthlyAmount}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="address">
                            Address
                        </label>
                        <textarea
                            id="address"
                            name="address"
                            className="form-textarea"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter member's address"
                            rows="3"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            <span>✓</span>
                            Add Member
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

export default AddMember;
