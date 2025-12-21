// Utility functions for generating payment receipts and slips

/**
 * Generate a formatted payment receipt for WhatsApp
 */
export const generatePaymentReceipt = (member, payment) => {
    const paymentDate = new Date(payment.paymentDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const monthYear = new Date(payment.month + '-01').toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric'
    });

    const receipt = `━━━━━━━━━━━━━━━━━━━━━
🕌 *CHURAMAN CHAK BHATWALIYA MASJID*
━━━━━━━━━━━━━━━━━━━━━

📋 *PAYMENT RECEIPT*

*Member Details:*
Name: ${member.name}
Phone: ${member.phone}

*Payment Details:*
Month: ${monthYear}
Amount Paid: ₹${payment.amount}
Payment Date: ${paymentDate}
${payment.notes ? `Notes: ${payment.notes}` : ''}

*Receipt ID:* #${payment.id.slice(-8).toUpperCase()}
*Status:* ✅ PAID

━━━━━━━━━━━━━━━━━━━━━
JazakAllah Khair for your contribution!
May Allah accept your donation.
━━━━━━━━━━━━━━━━━━━━━`;

    return receipt;
};

/**
 * Generate a pending payment reminder slip for WhatsApp
 */
export const generatePendingSlip = (member, month, pendingMonths = []) => {
    const monthYear = new Date(month + '-01').toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric'
    });

    let slip = `━━━━━━━━━━━━━━━━━━━━━
🕌 *CHURAMAN CHAK BHATWALIYA MASJID*
━━━━━━━━━━━━━━━━━━━━━

📝 *PAYMENT REMINDER*

Assalamu Alaikum ${member.name},

*Your Details:*
Name: ${member.name}
Phone: ${member.phone}
Monthly Amount: ₹${member.monthlyAmount}

*Pending Payment:*`;

    if (pendingMonths && pendingMonths.length > 0) {
        slip += `\n\n*Pending Months:*\n`;
        pendingMonths.forEach((m, index) => {
            const mName = new Date(m + '-01').toLocaleDateString('en-IN', {
                month: 'long',
                year: 'numeric'
            });
            slip += `${index + 1}. ${mName} - ₹${member.monthlyAmount}\n`;
        });
        const totalPending = pendingMonths.length * parseFloat(member.monthlyAmount);
        slip += `\n*Total Pending:* ₹${totalPending}`;
    } else {
        slip += `\nMonth: ${monthYear}
Amount: ₹${member.monthlyAmount}`;
    }

    slip += `

━━━━━━━━━━━━━━━━━━━━━
This is a friendly reminder to submit your monthly donation at your earliest convenience.

JazakAllah Khair!
━━━━━━━━━━━━━━━━━━━━━`;

    return slip;
};

/**
 * Generate a detailed payment summary for a member
 */
export const generatePaymentSummary = (member, payments, allMonths) => {
    const paidMonths = payments.map(p => p.month);
    const pendingMonths = allMonths.filter(m => !paidMonths.includes(m));

    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const totalPending = pendingMonths.length * parseFloat(member.monthlyAmount);

    let summary = `━━━━━━━━━━━━━━━━━━━━━
🕌 *CHURAMAN CHAK BHATWALIYA MASJID*
━━━━━━━━━━━━━━━━━━━━━

📊 *PAYMENT SUMMARY*

*Member:* ${member.name}
*Phone:* ${member.phone}
*Monthly Amount:* ₹${member.monthlyAmount}

*Paid Months:* ${payments.length}
*Total Paid:* ₹${totalPaid}

*Pending Months:* ${pendingMonths.length}
*Total Pending:* ₹${totalPending}

━━━━━━━━━━━━━━━━━━━━━
JazakAllah Khair!
━━━━━━━━━━━━━━━━━━━━━`;

    return summary;
};

/**
 * Send WhatsApp message with receipt/slip
 */
export const sendWhatsAppMessage = (phoneNumber, message) => {
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
};

/**
 * Calculate pending months for a member (from September 2020 to current month)
 */
export const calculatePendingMonths = (generalPayments, imamSalaryPayments = []) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Generate all months from September 2020 to current month
    const allMonths = [];
    const startDate = new Date('2020-09-01');
    const startYear = 2020;
    const startMonthIndex = 8; // September (0-indexed)

    for (let year = startYear; year <= currentYear; year++) {
        const startM = year === startYear ? startMonthIndex : 0;
        const endM = year === currentYear ? currentMonth : 11;

        for (let month = startM; month <= endM; month++) {
            allMonths.push(`${year}-${String(month + 1).padStart(2, '0')}`);
        }
    }

    // Collect ALL paid months from both general payments AND Imam salary payments
    const generalPaidMonths = (generalPayments || []).map(p => p.month);
    const imamSalaryPaidMonths = (imamSalaryPayments || []).map(p => p.month);
    const allPaidMonths = [...new Set([...generalPaidMonths, ...imamSalaryPaidMonths])];

    // Return only months that haven't been paid
    return allMonths.filter(m => !allPaidMonths.includes(m));
};
