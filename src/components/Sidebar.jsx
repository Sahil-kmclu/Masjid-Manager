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

    // Group menu items
    const groupedItems = menuItems.reduce((acc, item) => {
        if (!acc[item.group]) {
            acc[item.group] = [];
        }
        acc[item.group].push(item);
        return acc;
    }, {});

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
            <aside className={`sidebar ${isOpen ? 'active' : ''}`}>
                <div className="sidebar-header-mobile">
                    <h3>Menu</h3>
                    <button className="close-btn" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <nav className="sidebar-nav">
                    {Object.entries(groupedItems).map(([group, items]) => (
                        <div key={group} className="sidebar-group">
                            <div className="sidebar-group-title">{group}</div>
                            {items.map((item) => (
                                <button
                                    key={item.id}
                                    className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
                                    onClick={() => onNavigate(item.id)}
                                >
                                    <span className="sidebar-icon">{item.icon}</span>
                                    <span className="sidebar-label">{item.label}</span>
                                    {currentView === item.id && (
                                        <div className="active-indicator" />
                                    )}
                                </button>
                            ))}
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
}

export default Sidebar;
