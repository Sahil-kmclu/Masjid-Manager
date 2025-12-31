import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./RecordPayment.css";

function AddMosqueIncome({ onAddIncome, onCancel }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    source: "",
    category: "Donation",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    donorName: "",
    mobileNumber: "",
    address: "",
  });

  const [errors, setErrors] = useState({});

  const categories = [
    "Donation",
    "Event",
    "Rent",
    "Zakat",
    "Sadaqah",
    "Fundraising",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.donorName.trim()) {
      newErrors.donorName = t("Name is required");
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = t("Mobile number is required");
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = t("Enter a valid 10-digit mobile number");
    }

    if (!formData.address.trim()) {
      newErrors.address = t("Address is required");
    }

    if (!formData.source.trim()) {
      newErrors.source = t("Income source is required");
    }

    if (!formData.category) {
      newErrors.category = t("Please select a category");
    }

    if (!formData.amount) {
      newErrors.amount = t("Amount is required");
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = t("Amount must be greater than 0");
    }

    if (!formData.date) {
      newErrors.date = t("Date is required");
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

    // Transform form data to match backend API field names
    const incomeData = {
      source: formData.source,
      amount: parseFloat(formData.amount),
      date: formData.date,
      incomeType: formData.category, // Backend expects 'incomeType', not 'category'
      donorName: formData.donorName || null,
      donorPhone: formData.mobileNumber || null, // Backend expects 'donorPhone', not 'mobileNumber'
      notes: formData.description || null, // Backend expects 'notes', not 'description'
      paymentMethod: null, // Optional field
    };

    onAddIncome(incomeData);

    // Reset form
    setFormData({
      source: "",
      category: "Donation",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      donorName: "",
      mobileNumber: "",
      address: "",
    });

    alert(t("Mosque income recorded successfully!"));
  };

  return (
    <div className="record-payment fade-in">
      <div className="page-header">
        <h2>➕ {t("Add Mosque Income")}</h2>
        <p className="text-muted">{t("Record income from various sources")}</p>
      </div>

      <div
        className="card form-card"
        style={{ maxWidth: "600px", margin: "0 auto" }}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="donorName">
              {t("Name")} *
            </label>
            <input
              type="text"
              id="donorName"
              name="donorName"
              className="form-input"
              value={formData.donorName}
              onChange={handleChange}
              placeholder={t("Enter name")}
            />
            {errors.donorName && (
              <span className="error-message">{errors.donorName}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="mobileNumber">
                {t("Mobile Number")} *
              </label>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                className="form-input"
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder={t("Enter 10-digit mobile number")}
                maxLength="10"
              />
              {errors.mobileNumber && (
                <span className="error-message">{errors.mobileNumber}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="address">
                {t("Address")} *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                className="form-input"
                value={formData.address}
                onChange={handleChange}
                placeholder={t("Enter address")}
              />
              {errors.address && (
                <span className="error-message">{errors.address}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="source">
              {t("Income Source")} *
            </label>
            <input
              type="text"
              id="source"
              name="source"
              className="form-input"
              value={formData.source}
              onChange={handleChange}
              placeholder={t("e.g., Wedding Hall Rent, Ramadan Fundraiser")}
            />
            {errors.source && (
              <span className="error-message">{errors.source}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="category">
                {t("Category")} *
              </label>
              <select
                id="category"
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {t(cat)}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span className="error-message">{errors.category}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="amount">
                {t("Amount (₹)")} *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                className="form-input"
                value={formData.amount}
                onChange={handleChange}
                placeholder={t("Enter amount")}
                min="0"
                step="1"
              />
              {errors.amount && (
                <span className="error-message">{errors.amount}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="date">
              {t("Date")} *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              className="form-input"
              value={formData.date}
              onChange={handleChange}
            />
            {errors.date && (
              <span className="error-message">{errors.date}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              {t("Description (Optional)")}
            </label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder={t("Add any additional details about this income")}
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              <span>💵</span>
              {t("Add Income")}
            </button>
            {onCancel && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                {t("Cancel")}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMosqueIncome;
