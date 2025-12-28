# Masjid Manager Tracking System 🕌

A modern, responsive web application built with React to manage monthly donations for the masjid imam's salary. Track members, record payments, and send automated reminders for pending donations.

## ✨ Features

### Core Functionality
- **Member Management**: Add, edit, view, and delete member records
- **Payment Tracking**: Record monthly payments with date and notes
- **Dashboard Analytics**: View statistics, collection summaries, and payment completion rates
- **Pending Payments**: Automatically identify members with pending payments
- **Search & Filter**: Search members by name or phone, filter payments by month
- **Payment History**: View complete payment history for each member

### Notification System
- **WhatsApp Reminders**: Send individual or bulk WhatsApp messages to members with pending payments
- **SMS Alerts**: Send SMS reminders directly from the app
- **Pre-filled Messages**: Automated message templates for quick sending

### Technical Features
- **LocalStorage**: Data persists in browser (no server required for basic use)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Premium dark theme with glassmorphism effects and smooth animations
- **Real-time Updates**: Instant UI updates when data changes

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd "D:\sahil application\masjid app"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser and visit:**
   ```
   http://localhost:5173
   ```

## 📱 How to Use

### Adding Members
1. Navigate to "Add Member" from the sidebar
2. Fill in member details:
   - Name (required)
   - Phone number (required, 10 digits)
   - Email (optional)
   - Monthly contribution amount (required)
   - Address (optional)
3. Click "Add Member"

### Recording Payments
1. Go to "Record Payment" section
2. Select a member from the dropdown
3. Choose the payment month and date
4. Amount is auto-filled based on member's monthly contribution
5. Add optional notes
6. Click "Record Payment"

### Viewing Pending Payments
1. Go to "Pending Payments" section
2. Select the month you want to check
3. View list of members who haven't paid
4. Send individual WhatsApp/SMS reminders by clicking the buttons
5. Or use "Send WhatsApp Reminders to All" for bulk messaging

### Managing Members
1. Navigate to "Members" section
2. Search for members using the search box
3. Click the arrow (▼) to view member details and payment history
4. Use the edit (✏️) button to modify member information
5. Use the pending slip (📄) button to send payment reminders
6. Use the delete (🗑️) button to remove a member

### Admin Panel
1. Go to "Admin Panel" from the sidebar
2. View system statistics (members, payments, total collected)
3. Configure system settings:
   - Masjid name
   - Default monthly amount
   - Contact information
   - Admin password
4. Export data: Download complete backup as JSON file
5. Import data: Restore from backup file
6. Clear all data: Complete system reset (use with caution!)

## 📊 Dashboard Overview

The dashboard provides:
- **Total Members**: Count of all registered members
- **Paid This Month**: Members who have paid for the current month
- **Pending Members**: Members with pending payments
- **Completion Rate**: Percentage of expected donations received
- **Monthly Collection**: Expected vs collected vs pending amounts
- **Recent Payments**: Last 5 payment records

## 🔔 Setting Up Automated Notifications

Currently, the app uses WhatsApp Web/App and SMS app integration which requires manual sending. For fully automated alerts:

### Option 1: WhatsApp Business API (Recommended)
1. Sign up for WhatsApp Business API through providers like:
   - Twilio: https://www.twilio.com/whatsapp
   - MessageBird: https://www.messagebird.com/
   - Vonage: https://www.vonage.com/
   
2. Get your API credentials (Account SID, Auth Token, WhatsApp number)

3. Create a backend service (Node.js/PHP) to:
   - Schedule monthly reminders
   - Send messages automatically via API
   - Store message logs

### Option 2: SMS Gateway
1. Sign up for SMS service:
   - Twilio SMS: https://www.twilio.com/sms
   - MSG91: https://msg91.com/
   - Fast2SMS: https://www.fast2sms.com/

2. Get API credentials

3. Integrate with a backend service for automated sending

### Sample Backend Integration (Node.js + Twilio)
```javascript
// Example code for automated WhatsApp messages
const twilio = require('twilio');
const client = new twilio('YOUR_ACCOUNT_SID', 'YOUR_AUTH_TOKEN');

async function sendWhatsAppReminder(phoneNumber, name, amount, month) {
  await client.messages.create({
    from: 'whatsapp:+14155238886', // Twilio Sandbox number
    to: `whatsapp:+${phoneNumber}`,
    body: `Assalamu Alaikum ${name},\n\nThis is a friendly reminder about your monthly donation for ${month}.\n\nAmount: ₹${amount}\n\nJazakAllah Khair!`
  });
}
```

## 🛠️ Data Management

### Export Data
To export your data:
1. Open browser console (F12)
2. Run:
   ```javascript
   localStorage.getItem('masjid_members')
   localStorage.getItem('masjid_payments')
   ```
3. Copy and save the JSON data

### Import Data
To import data:
1. Open browser console (F12)
2. Run:
   ```javascript
   localStorage.setItem('masjid_members', 'YOUR_JSON_DATA')
   localStorage.setItem('masjid_payments', 'YOUR_JSON_DATA')
   ```
3. Refresh the page

### Backup Recommendations
- Regularly export your data and save to a file
- Consider setting up a backend database (MySQL/PostgreSQL) for production use
- Use cloud storage solutions for automatic backups

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
1. Push code to GitHub
2. Connect to Vercel
3. Deploy with one click

### Option 2: Netlify
1. Push code to GitHub
2. Connect to Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Option 3: GitHub Pages
```bash
npm run build
# Upload the 'dist' folder to GitHub Pages
```

### Option 4: Local Hosting
```bash
npm run build
# Serve the 'dist' folder with any web server
```

## 📁 Project Structure

```
masjid-app/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Top navigation bar
│   │   ├── Sidebar.jsx         # Side navigation menu
│   │   ├── Dashboard.jsx       # Analytics dashboard
│   │   ├── MemberList.jsx      # Member management table
│   │   ├── AddMember.jsx       # Add new member form
│   │   ├── RecordPayment.jsx   # Payment recording form
│   │   └── PendingPayments.jsx # Pending payments list
│   ├── App.jsx                  # Main app component
│   ├── App.css                  # App-specific styles
│   ├── index.css                # Global styles & design system
│   └── main.jsx                 # Entry point
├── index.html
├── package.json
└── README.md
```

## 🎨 Design Features

- **Premium Dark Theme**: Modern dark color scheme with purple/blue gradients
- **Glassmorphism**: Frosted glass effect on cards and overlays
- **Smooth Animations**: Micro-interactions and transitions
- **Responsive Layout**: Mobile-first design approach
- **Accessibility**: Semantic HTML and keyboard navigation support

## 🔒 Privacy & Security

- All data is stored locally in your browser
- No data is sent to external servers
- Clear your browser data to reset the application
- For production use, implement proper authentication and authorization
- Consider HTTPS for deployed versions

## 📞 Support & Contribution

For questions or improvements:
1. Review the code and submit pull requests
2. Report issues or bugs
3. Suggest new features
4. Share with other masjid committees

## 📝 License

This project is open source and available for free use by masjid committees and Islamic organizations.

## 🤲 Prayer

May Allah accept this effort and make it beneficial for the Muslim community. Ameen.

---

**Built with ❤️ for the Muslim Community**
