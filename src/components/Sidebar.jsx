import './Sidebar.css';

function Sidebar({ currentView, onNavigate, isOpen, onClose }) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', group: 'General' },

        // Member Management
        { id: 'members', label: 'Members', icon: '👥', group: 'Members' },
        { id: 'add-member', label: 'Add Member', icon: '➕', group: 'Members' },

        // General Donations
        { id: 'record-payment', label: 'Record Payment', icon: '💰', group: 'Donations' },
        { id: 'pending', label: 'Pending Payments', icon: '⏰', group: 'Donations' },

        // Imam Salary
        { id: 'imam-salary', label: 'Imam Salary', icon: '🕌', group: 'Imam Salary' },
        { id: 'record-imam-salary', label: 'Record Imam Salary', icon: '💵', group: 'Imam Salary' },

        // Mosque Income
        { id: 'mosque-income', label: 'Mosque Income', icon: '📊', group: 'Income' },
        { id: 'add-mosque-income', label: 'Add Income', icon: '➕', group: 'Income' },

        // Expenses
        { id: 'expenses', label: 'Expenses', icon: '💸', group: 'Expenses' },
        { id: 'add-expense', label: 'Add Expense', icon: '➖', group: 'Expenses' },

        // Admin
        { id: 'admin', label: 'Admin Panel', icon: '⚙️', group: 'Admin' },
    ];

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
            <aside className={`sidebar ${isOpen ? 'active' : ''}`}>
                <div className="sidebar-header-mobile">
                    <h3>Menu</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
                        onClick={() => onNavigate(item.id)}
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
        </>
    );
}

export default Sidebar;
