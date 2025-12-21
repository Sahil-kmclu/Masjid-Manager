# 🔧 Admin Panel Guide

## Overview
The Admin Panel is your control center for managing the entire Masjid Donation Tracker system. Access it from the sidebar menu (⚙️ Admin Panel).

---

## 📊 System Statistics

At the top of the Admin Panel, you'll see four key metrics:

| Metric | Description |
|--------|-------------|
| **Total Members** | Number of registered members |
| **Total Payments** | Number of payment records |
| **Total Collected** | Sum of all payments received (₹) |
| **Data Size** | Amount of storage used (KB) |

---

## ⚙️ System Settings

Configure your masjid's information and preferences:

### Settings Available:

1. **Masjid Name**
   - Appears on all receipts and slips
   - Default: "Churaman Chak Bhatwaliya Masjid"
   - Can be customized to your masjid's name

2. **Default Monthly Amount (₹)**
   - Pre-filled amount when adding new members
   - Default: 500
   - Adjust based on your masjid's standard donation

3. **Contact Phone**
   - Masjid's contact number
   - For member inquiries

4. **Contact Email**
   - Masjid's email address
   - For official communication

5. **Admin Password**
   - Set a password for future protection
   - Currently stored for reference
   - Plan: Will be used for login authentication

### How to Save Settings:
1. Edit any field
2. Click **💾 Save Settings**
3. Confirmation message appears
4. Settings are saved to browser storage

---

## 💾 Data Management

### Export Data (Backup)

**Purpose**: Create a backup file of all your data

**How to Export**:
1. Click **⬇️ Export Backup** button
2. A JSON file downloads automatically
3. Filename format: `masjid-backup-YYYY-MM-DD.json`

**What Gets Exported**:
- All members
- All payment records
- System settings
- Export timestamp

**Best Practices**:
- ✅ Export weekly backups
- ✅ Store backups in multiple locations (USB, Cloud, Email)
- ✅ Before making major changes
- ✅ Before clearing data

### Import Data (Restore)

**Purpose**: Restore data from a backup file

**How to Import**:
1. Click **⬆️ Import Backup** button
2. Select your backup JSON file
3. Confirm the replacement warning
4. Page refreshes with restored data

**⚠️ Important Notes**:
- This REPLACES all current data
- Make a backup before importing
- Only use valid backup files from this system
- Invalid files will show an error

**When to Import**:
- Moving to a new computer
- Recovering from data loss
- Syncing data between devices
- Restoring from backup

---

## ⚠️ Danger Zone

### Clear All Data

**WARNING**: This is a destructive action that cannot be undone!

**What Gets Deleted**:
- ❌ All members
- ❌ All payment records
- ❌ All system settings
- ❌ Everything!

**How to Clear Data**:
1. Click **🗑️ Clear All Data** button
2. Confirm the first warning
3. Type "DELETE ALL" exactly
4. Click OK
5. Page refreshes with empty system

**When to Use**:
- Starting fresh with new data
- Testing purposes
- Switching to different masjid
- Complete system reset

**🛡️ Protection**:
- Two-step confirmation required
- Must type "DELETE ALL" exactly
- Cannot be easily done by accident

---

## 🚀 Quick Actions

Four utility buttons for quick operations:

### 1. 🔍 View Members Data
- Opens browser console (F12)
- Displays all member data in JSON format
- Useful for debugging

### 2. 🔍 View Payments Data
- Opens browser console (F12)
- Displays all payment records in JSON format
- Useful for checking data structure

### 3. 🔄 Refresh Application
- Reloads the entire page
- Refreshes all data from storage
- Useful after imports

### 4. 📈 Storage Info
- Shows data usage summary:
  - Members count
  - Payments count
  - Storage used
  - Last update time

---

## 📋 Common Admin Tasks

### Task 1: Regular Backup
**Frequency**: Weekly
**Steps**:
1. Go to Admin Panel
2. Click Export Backup
3. Save file to safe location
4. Test import once a month

### Task 2: Change Masjid Name
**Steps**:
1. Go to Admin Panel
2. Edit "Masjid Name" field
3. Click Save Settings
4. New name appears on all receipts

### Task 3: Adjust Monthly Amount
**Steps**:
1. Go to Admin Panel
2. Change "Default Monthly Amount"
3. Click Save Settings
4. New members will have this amount

### Task 4: Move to New Computer
**Steps**:
1. On old computer: Export Backup
2. Transfer file (email/USB)
3. On new computer: Open app
4. Go to Admin Panel
5. Import Backup
6. Verify data

### Task 5: End of Year Reset
**Steps**:
1. Export final backup
2. Archive the backup with year name
3. (Optional) Clear all data
4. Start fresh for new year

---

## 🔐 Security Best Practices

1. **Set Admin Password**
   - Use strong password
   - Don't share with everyone
   - Change periodically

2. **Regular Backups**
   - Weekly minimum
   - Before major changes
   - Multiple copies

3. **Data Protection**
   - Don't use on public computers
   - Clear browser when done on shared PC
   - Use HTTPS when deployed

4. **Access Control**
   - Limit who can access Admin Panel
   - Train authorized users
   - Log important changes

---

## 💡 Pro Tips

1. **Before Importing**:
   - Always check file date
   - Verify it's from this system
   - Export current data first

2. **Storage Monitoring**:
   - Check "Data Size" regularly
   - Browser storage has limits
   - Export if size grows too large

3. **Testing Features**:
   - Export backup first
   - Test new features
   - Import backup if needed

4. **Data Integrity**:
   - Use View Data buttons to verify
   - Check stats make sense
   - Regular data audits

---

## ❓ Troubleshooting

### Problem: Export button doesn't work
**Solution**: 
- Check browser permissions
- Try different browser
- Disable popup blocker

### Problem: Import fails
**Solution**:
- Verify file is valid JSON
- Check file not corrupted
- Try older backup

### Problem: Settings not saving
**Solution**:
- Check browser storage not full
- Allow localStorage
- Try private/incognito mode

### Problem: Data disappeared
**Solution**:
- Check browser cleared cache
- Import from latest backup
- Check correct browser/profile

---

## 🎯 Admin Dashboard Layout

```
┌─────────────────────────────────────────────┐
│         📊 System Statistics                │
│  [Members] [Payments] [Amount] [Size]       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│         ⚙️ System Settings                  │
│  Name, Amount, Phone, Email, Password       │
│              [Save Settings]                │
└─────────────────────────────────────────────┘

┌──────────────┬──────────────────────────────┐
│ Export Data  │    Import Data               │
│ [Export]     │    [Import]                  │
└──────────────┴──────────────────────────────┘

┌─────────────────────────────────────────────┐
│         ⚠️ Danger Zone                      │
│         [Clear All Data]                    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│         🚀 Quick Actions                    │
│  [View Members] [View Payments]             │
│  [Refresh] [Storage Info]                   │
└─────────────────────────────────────────────┘
```

---

## 📞 Need Help?

If you encounter any issues with the Admin Panel:
1. Export your data first (backup!)
2. Check this guide
3. Try refreshing the application
4. Import backup if needed

---

**Remember**: The Admin Panel is powerful - use it wisely! Always backup before making major changes.
