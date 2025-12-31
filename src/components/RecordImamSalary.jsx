import { useState } from "react";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import "./RecordPayment.css";

function RecordImamSalary({
  members,
  imamSalaryPayments = [],
  onAddPayment,
  onCancel,
}) {
  const { t } = useTranslation();
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}`;

  const [minMonth, setMinMonth] = useState("2020-09");

  const [formData, setFormData] = useState({
    memberId: "",
    month: currentMonth,
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-fill amount and set min month when member is selected
    if (name === "memberId" && value) {
      const member = members.find((m) => m.id === value);
      if (member) {
        setFormData((prev) => ({
          ...prev,
          amount: member.monthlyAmount,
        }));

        // Set min month based on joining date
        if (member.joiningDate) {
          setMinMonth(member.joiningDate.slice(0, 7));
        } else {
          setMinMonth("2020-09"); // Fallback for legacy
        }
      }
    } else if (name === "memberId" && !value) {
      setMinMonth("2020-09");
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.memberId) {
      newErrors.memberId = t("Please select a member");
    }

    if (!formData.month) {
      newErrors.month = t("Please select a month");
    } else {
      // Validate month is not before Joining Date (or Sept 2020)
      const selectedMonth = new Date(formData.month + "-01");
      const minDateObj = new Date(minMonth + "-01");

      if (selectedMonth < minDateObj) {
        newErrors.month = t("Payment cannot be before joining date");
      } else if (formData.memberId) {
        // Check for duplicate payment
        const isDuplicate = imamSalaryPayments.some(
          (p) => p.memberId === formData.memberId && p.month === formData.month
        );

        if (isDuplicate) {
          newErrors.month = t(
            "Payment already done this month for this member"
          );
        }
      }
    }

    if (!formData.amount) {
      newErrors.amount = t("Amount is required");
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = t("Amount must be greater than 0");
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = t("Payment date is required");
    }

    return newErrors;
  };

  const generateReceipt = (payment, memberName) => {
    const doc = new jsPDF();
    const currentUser = JSON.parse(
      localStorage.getItem("masjid_current_user") || "{}"
    );
    const mosqueName = currentUser.name || "Mosque Receipt";

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text(mosqueName, 105, 20, { align: "center" });

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 30, {
      align: "center",
    });

    // Line
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    // Details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    let y = 50;
    const addLine = (label, value) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value || "-"), 70, y);
      y += 10;
    };

    addLine("Receipt No", payment.id.slice(-6).toUpperCase());
    addLine("Date", new Date(payment.paymentDate).toLocaleDateString());
    addLine("Member Name", memberName);

    // Format month to "Month YYYY" (e.g., December 2025)
    const [year, month] = payment.month.split("-");
    const dateObj = new Date(parseInt(year), parseInt(month) - 1);
    const formattedMonth = dateObj.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    addLine("Payment Month", formattedMonth);
    addLine("Amount", `Rs. ${parseFloat(payment.amount).toLocaleString()}`);
    if (payment.notes) {
      addLine("Notes", payment.notes);
    }

    // Footer
    doc.setLineWidth(0.5);
    doc.line(20, y + 10, 190, y + 10);

    doc.setFontSize(10);
    doc.text("Thank you for your contribution!", 105, y + 25, {
      align: "center",
    });

    doc.save(`ImamSalary_Receipt_${memberName}_${payment.month}.pdf`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Get member details
    const member = members.find((m) => m.id === formData.memberId);
    if (!member) {
      alert(t("Member not found"));
      return;
    }

    // Build payment data with memberName and memberPhone (as expected by backend)
    const paymentData = {
      memberName: member.name,
      memberPhone: member.phone || null,
      memberId: formData.memberId, // Keep for local duplicate check
      month: formData.month,
      amount: parseFloat(formData.amount),
      paymentDate: formData.paymentDate,
      notes: formData.notes || null,
    };

    // Generate PDF with temporary ID for receipt display
    const tempId = Date.now().toString();
    generateReceipt({ ...paymentData, id: tempId }, member.name);

    onAddPayment(paymentData);

    // Reset form but keep the current month
    setFormData({
      memberId: "",
      month: currentMonth,
      amount: "",
      paymentDate: new Date().toISOString().split("T")[0],
      notes: "",
    });

    alert(t("Imam salary payment recorded successfully!"));
  };

  const selectedMember = members.find((m) => m.id === formData.memberId);

  return (
    <div className="record-payment fade-in">
      <div className="page-header">
        <h2>💰 {t("Record Imam Salary Payment")}</h2>
        <p className="text-muted">
          {t("Record monthly Imam salary contribution from a member")}
        </p>
      </div>

      <div className="grid grid-cols-2">
        <div className="card form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="memberId">
                {t("Select Member")} *
              </label>
              <select
                id="memberId"
                name="memberId"
                className="form-select"
                value={formData.memberId}
                onChange={handleChange}
              >
                <option value="">{t("-- Choose a member --")}</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} - ₹{member.monthlyAmount}
                    {t("/month")}
                  </option>
                ))}
              </select>
              {errors.memberId && (
                <span className="error-message">{errors.memberId}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="month">
                  {t("Payment Month")} *
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
                {errors.month && (
                  <span className="error-message">{errors.month}</span>
                )}
                <small className="form-hint">
                  {minMonth === "2020-09"
                    ? t("From September 2020 onwards")
                    : t("From Joining Date onwards")}
                </small>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="paymentDate">
                  {t("Payment Date")} *
                </label>
                <input
                  type="date"
                  id="paymentDate"
                  name="paymentDate"
                  className="form-input"
                  value={formData.paymentDate}
                  onChange={handleChange}
                />
                {errors.paymentDate && (
                  <span className="error-message">{errors.paymentDate}</span>
                )}
              </div>
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
                placeholder={t("Enter payment amount")}
                min="0"
                step="1"
              />
              {errors.amount && (
                <span className="error-message">{errors.amount}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="notes">
                {t("Notes (Optional)")}
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
                {t("Record Salary Payment")}
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

        {selectedMember && (
          <div className="card member-info-card">
            <h3>{t("Member Details")}</h3>
            <div className="member-info">
              <div className="info-item">
                <span className="info-label">{t("Name")}</span>
                <span className="info-value">{selectedMember.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t("Phone")}</span>
                <span className="info-value">{selectedMember.phone}</span>
              </div>
              {selectedMember.email && (
                <div className="info-item">
                  <span className="info-label">{t("Email")}</span>
                  <span className="info-value">{selectedMember.email}</span>
                </div>
              )}
              <div className="info-item">
                <span className="info-label">{t("Monthly Amount")}</span>
                <span className="info-value highlight">
                  ₹{selectedMember.monthlyAmount}
                </span>
              </div>
              {selectedMember.address && (
                <div className="info-item">
                  <span className="info-label">{t("Address")}</span>
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
