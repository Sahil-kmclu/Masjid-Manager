import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Utility functions for generating payment receipts and slips

/**
 * Generate a formatted payment receipt for WhatsApp
 */
export const generatePaymentReceipt = (member, payment, mosqueName) => {
    const paymentDate = new Date(payment.paymentDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const monthYear = new Date(payment.month + '-01').toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric'
    });

    const name = mosqueName || "CHURAMAN CHAK BHATWALIYA MASJID";

    const receipt = `━━━━━━━━━━━━━━━━━━━━━
🕌 *${name.toUpperCase()}*
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
export const generatePendingSlip = (member, month, pendingMonths = [], mosqueName) => {
    const monthYear = new Date(month + '-01').toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric'
    });

    const name = mosqueName || "CHURAMAN CHAK BHATWALIYA MASJID";

    let slip = `━━━━━━━━━━━━━━━━━━━━━
🕌 *${name.toUpperCase()}*
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
export const generatePaymentSummary = (member, payments, allMonths, mosqueName) => {
    const paidMonths = payments.map(p => p.month);
    const pendingMonths = allMonths.filter(m => !paidMonths.includes(m));

    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const totalPending = pendingMonths.length * parseFloat(member.monthlyAmount);

    const name = mosqueName || "CHURAMAN CHAK BHATWALIYA MASJID";

    let summary = `━━━━━━━━━━━━━━━━━━━━━
🕌 *${name.toUpperCase()}*
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
 * Calculate pending months for a member (from Joining Date or default Sept 2020 to current month)
 */
export const calculatePendingMonths = (generalPayments, imamSalaryPayments = [], memberJoiningDate = '2020-09-01') => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Determine start date
    const startDate = new Date(memberJoiningDate || '2020-09-01');
    const startYear = startDate.getFullYear();
    const startMonthIndex = startDate.getMonth();

    // Generate all months from Start Date to current month
    const allMonths = [];

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

/**
 * Generate and download a PDF pending slip
 */
export const generatePendingSlipPDF = (member, pendingMonths = [], mosqueName) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(22, 163, 74); // Green color
    const name = mosqueName || "CHURAMAN CHAK BHATWALIYA MASJID";
    doc.text(name.toUpperCase(), 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Donation Management System", 105, 28, { align: "center" });
    
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    // Title
    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text("Payment Reminder Slip", 105, 50, { align: "center" });

    // Member Details
    doc.setFontSize(12);
    doc.text(`Member Name: ${member.name}`, 20, 70);
    doc.text(`Phone: ${member.phone}`, 20, 80);
    doc.text(`Monthly Contribution: ₹${member.monthlyAmount}`, 20, 90);
    
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 140, 70);

    // Table
    const tableColumn = ["#", "Month", "Amount"];
    const tableRows = [];
    let totalPending = 0;

    pendingMonths.forEach((month, index) => {
        const monthName = new Date(month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        const amount = parseFloat(member.monthlyAmount);
        totalPending += amount;
        tableRows.push([index + 1, monthName, `Rs ${amount.toFixed(2)}`]);
    });

    // Add Total Row
    tableRows.push(['', 'Total Pending Amount', `Rs ${totalPending.toFixed(2)}`]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 100,
        theme: 'grid',
        headStyles: { fillColor: [22, 163, 74] },
        columnStyles: {
            0: { cellWidth: 20 },
            2: { cellWidth: 40, halign: 'right' }
        },
        didParseCell: function (data) {
            // Bold the last row (Total)
            if (data.row.raw[1] === 'Total Pending Amount') {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [240, 240, 240];
            }
        }
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("This is a computer-generated slip and does not require a signature.", 105, finalY, { align: "center" });
    doc.text("Please submit your dues at your earliest convenience. JazakAllah Khair!", 105, finalY + 7, { align: "center" });

    // Save
    doc.save(`${member.name}_Pending_Slip_${new Date().toISOString().slice(0, 10)}.pdf`);
};
