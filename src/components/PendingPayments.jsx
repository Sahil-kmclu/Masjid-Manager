import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './PendingPayments.css';
import { generatePendingSlip, sendWhatsAppMessage } from '../utils/receiptGenerator';

function PendingPayments({ members, payments, user }) {
    const { t } = useTranslation();
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const pendingData = useMemo(() => {
        const monthPayments = payments.filter(p => p.month === selectedMonth);
        const paidMemberIds = new Set(monthPayments.map(p => p.memberId));

        return members
            .filter(member => !paidMemberIds.has(member.id))
            .map(member => ({
                ...member,
                pendingAmount: parseFloat(member.monthlyAmount),
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [members, payments, selectedMonth]);

    const totalPending = useMemo(() => {
        return pendingData.reduce((sum, member) => sum + member.pendingAmount, 0);
    }, [pendingData]);

    const sendWhatsAppReminder = (member) => {
        const slip = generatePendingSlip(member, selectedMonth, [], user?.name);
        sendWhatsAppMessage(member.phone, slip);
    };

    const sendSMSReminder = (member) => {
        const monthName = new Date(selectedMonth + '-01').toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });

        const message = `Assalamu Alaikum ${member.name}, This is a friendly reminder about your monthly donation for ${monthName}. Amount: ₹${member.monthlyAmount}. JazakAllah Khair!`;

        const smsUrl = `sms:${member.phone}?body=${encodeURIComponent(message)}`;
        window.location.href = smsUrl;
    };

    const sendBulkReminders = () => {
        if (pendingData.length === 0) {
            alert('No pending payments for this month!');
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to send WhatsApp reminders to ${pendingData.length} members?`
        );

        if (confirmed) {
            alert('Opening WhatsApp for each member. Please send the messages individually.');
            pendingData.forEach((member, index) => {
                setTimeout(() => {
                    sendWhatsAppReminder(member);
                }, index * 1000); // Delay each by 1 second
            });
        }
    };

    return (
        <div className="pending-payments fade-in">
            <div className="page-header">
                <div>
                    <h2>{t('Pending Payments')}</h2>
                    <p className="text-muted">{t("Members who haven't paid for the selected month")}</p>
                </div>
                <div className="month-selector">
                    <label className="form-label">{t('Select Month:')}</label>
                    <input
                        type="month"
                        className="form-input"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                </div>
            </div>

            <div className="pending-stats">
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        ⏰
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('Pending Members')}</div>
                        <div className="stat-value">{pendingData.length}</div>
                    </div>
                </div>

                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                        💰
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('Pending Amount')}</div>
                        <div className="stat-value">₹{totalPending.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {pendingData.length > 0 && !isReadOnly && (
                <div className="bulk-actions">
                    <button className="btn btn-primary" onClick={sendBulkReminders}>
                        <span>📱</span>
                        {t('Send WhatsApp Reminders to All')}
                    </button>
                </div>
            )}

            <div className="card">
                {pendingData.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">✓</div>
                        <h3>{t('All Payments Received!')}</h3>
                        <p>{t('No pending payments for')} {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('Member Name')}</th>
                                    <th>{t('Phone')}</th>
                                    <th>{t('Email')}</th>
                                    <th>{t('Pending Amount')}</th>
                                    <th>{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingData.map((member) => (
                                    <tr key={member.id}>
                                        <td>
                                            <div className="member-name">{member.name}</div>
                                        </td>
                                        <td>{member.phone}</td>
                                        <td>{member.email || '-'}</td>
                                        <td>
                                            <span className="pending-amount">₹{member.pendingAmount.toLocaleString()}</span>
                                        </td>
                                        <td>
                                            {!isReadOnly && (
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => sendWhatsAppReminder(member)}
                                                        title={t("Send WhatsApp Reminder")}
                                                    >
                                                        📱 {t('WhatsApp')}
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        onClick={() => sendSMSReminder(member)}
                                                        title={t("Send SMS Reminder")}
                                                    >
                                                        💬 {t('SMS')}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="card info-card">
                <h3>📌 {t('Important Notes')}</h3>
                <ul>
                    <li>
                        <strong>{t('WhatsApp Reminders:')}</strong> {t("Clicking the WhatsApp button will open WhatsApp Web/App with a pre-filled message. You'll need to click send for each member.")}
                    </li>
                    <li>
                        <strong>{t('SMS Reminders:')}</strong> {t("Clicking the SMS button will open your default SMS app with a pre-filled message.")}
                    </li>
                    <li>
                        <strong>{t('Bulk Reminders:')}</strong> {t("Opens WhatsApp for all pending members with 1-second intervals. You'll need to send each message manually.")}
                    </li>
                    <li>
                        <strong>{t('Automation:')}</strong> {t("For fully automated alerts, you'll need to integrate with WhatsApp Business API or an SMS gateway service (see README for instructions).")}
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default PendingPayments;
