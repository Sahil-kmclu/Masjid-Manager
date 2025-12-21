import './Header.css';

function Header({ onToggleSidebar }) {
    return (
        <header className="header">
            <div className="container header-container">
                <div className="header-left">
                    <button className="mobile-menu-btn" onClick={onToggleSidebar} aria-label="Toggle Menu">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <div className="logo">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="12" fill="url(#gradient)" />
                            <path d="M20 10L12 18V30H16V24H24V30H28V18L20 10Z" fill="white" />
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#667eea" />
                                    <stop offset="1" stopColor="#764ba2" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div>
                            <h1 className="logo-text">Churaman Chak Bhatwaliya Masjid</h1>
                            <p className="logo-subtitle">Donation Management System</p>
                        </div>
                    </div>
                </div>
                <div className="header-right">
                    <div className="header-info">
                        <span className="header-label">Today</span>
                        <span className="header-value">{new Date().toLocaleDateString('en-GB')}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
