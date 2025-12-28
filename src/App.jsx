import { useState, useEffect } from 'react';
import './App.css';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import MemberList from './components/MemberList';
import AddMember from './components/AddMember';
import RecordPayment from './components/RecordPayment';
import PendingPayments from './components/PendingPayments';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ImamSalary from './components/ImamSalary';
import RecordImamSalary from './components/RecordImamSalary';
import MosqueIncome from './components/MosqueIncome';
import AddMosqueIncome from './components/AddMosqueIncome';
import Expenses from './components/Expenses';
import AddExpense from './components/AddExpense';
import PayImam from './components/PayImam';
import RecycleBin from './components/RecycleBin';
import MosqueProfile from './components/MosqueProfile';
import SuperAdminPanel from './components/SuperAdminPanel';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [imamSalaryPayments, setImamSalaryPayments] = useState([]);
  const [imamPayouts, setImamPayouts] = useState([]);
  const [mosqueIncome, setMosqueIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [imams, setImams] = useState([]);
  const [recycleBin, setRecycleBin] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Theme Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Check for logged in user on mount
  useEffect(() => {
    try {
        const savedUser = localStorage.getItem('masjid_current_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
    } catch (error) {
        console.error("Failed to load user:", error);
        localStorage.removeItem('masjid_current_user'); // Clear corrupted data
    }
  }, []);

  // Save current user
  useEffect(() => {
    if (user) {
      localStorage.setItem('masjid_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('masjid_current_user');
    }
  }, [user]);

  // Cleanup duplicate mosques (Self-healing)
  useEffect(() => {
      const mosques = JSON.parse(localStorage.getItem('registered_mosques') || '[]');
      const uniqueMosques = [];
      const seenEmails = new Set();
      let hasDuplicates = false;

      // Keep the most recent ones (assuming later in array is newer, or check createdAt)
      // We process in reverse to keep the latest one for each email
      for (let i = mosques.length - 1; i >= 0; i--) {
          const m = mosques[i];
          if (!seenEmails.has(m.email)) {
              seenEmails.add(m.email);
              uniqueMosques.unshift(m);
          } else {
              hasDuplicates = true;
          }
      }

      if (hasDuplicates) {
          console.log('Cleaning up duplicate mosques...');
          localStorage.setItem('registered_mosques', JSON.stringify(uniqueMosques));
      }
  }, []);

  // Helper to get scoped storage keys
  const getStorageKey = (key) => {
    if (!user) return null;
    return `mosque_${user.id}_${key}`;
  };

  // Load data when user changes
  useEffect(() => {
    if (!user) return;

    const memberKey = getStorageKey('members');
    const paymentKey = getStorageKey('payments');
    const salaryKey = getStorageKey('imam_salary_payments');
    const payoutKey = getStorageKey('imam_payouts');
    const incomeKey = getStorageKey('mosque_income');
    const expenseKey = getStorageKey('expenses');
    const imamKey = getStorageKey('imams');
    const recycleBinKey = getStorageKey('recycle_bin');

    const savedMembers = localStorage.getItem(memberKey);
    const savedPayments = localStorage.getItem(paymentKey);
    const savedImamSalary = localStorage.getItem(salaryKey);
    const savedImamPayouts = localStorage.getItem(payoutKey);
    const savedMosqueIncome = localStorage.getItem(incomeKey);
    const savedExpenses = localStorage.getItem(expenseKey);
    const savedImams = localStorage.getItem(imamKey);
    const savedRecycleBin = localStorage.getItem(recycleBinKey);

    // Migration Logic: If no data for this user, and it's the first login/register, 
    // try to copy from legacy global keys (for backward compatibility)
    if (!savedMembers && localStorage.getItem('masjid_members')) {
        // Only migrate if we are admin
        if (user.role === 'admin') {
            try {
                const legacyMembers = JSON.parse(localStorage.getItem('masjid_members') || '[]');
                setMembers(Array.isArray(legacyMembers) ? legacyMembers : []);
                
                const legacyPayments = JSON.parse(localStorage.getItem('masjid_payments') || '[]');
                setPayments(Array.isArray(legacyPayments) ? legacyPayments : []);
                
                const legacySalaries = JSON.parse(localStorage.getItem('masjid_imam_salary_payments') || '[]');
                setImamSalaryPayments(Array.isArray(legacySalaries) ? legacySalaries : []);
                
                const legacyIncome = JSON.parse(localStorage.getItem('masjid_mosque_income') || '[]');
                setMosqueIncome(Array.isArray(legacyIncome) ? legacyIncome : []);
                
                const legacyExpenses = JSON.parse(localStorage.getItem('masjid_expenses') || '[]');
                setExpenses(Array.isArray(legacyExpenses) ? legacyExpenses : []);
            } catch (e) {
                console.error("Migration error:", e);
                // Fallback to empty arrays on error
                setMembers([]);
                setPayments([]);
                setImamSalaryPayments([]);
                setMosqueIncome([]);
                setExpenses([]);
            }
            
            // Optional: Clear legacy data after migration to prevent confusion? 
            // Better keep it for safety for now.
            return; 
        }
    }

    try {
        if (savedMembers) {
          const parsed = JSON.parse(savedMembers);
          setMembers(Array.isArray(parsed) ? parsed : []);
        } else setMembers([]);
    } catch (e) { setMembers([]); }

    try {
        if (savedPayments) {
          const parsed = JSON.parse(savedPayments);
          setPayments(Array.isArray(parsed) ? parsed : []);
        } else setPayments([]);
    } catch (e) { setPayments([]); }

    try {
        if (savedImamSalary) {
          const parsed = JSON.parse(savedImamSalary);
          setImamSalaryPayments(Array.isArray(parsed) ? parsed : []);
        } else setImamSalaryPayments([]);
    } catch (e) { setImamSalaryPayments([]); }

    try {
        if (savedImamPayouts) {
          const parsed = JSON.parse(savedImamPayouts);
          setImamPayouts(Array.isArray(parsed) ? parsed : []);
        } else setImamPayouts([]);
    } catch (e) { setImamPayouts([]); }

    try {
        if (savedMosqueIncome) {
          const parsed = JSON.parse(savedMosqueIncome);
          setMosqueIncome(Array.isArray(parsed) ? parsed : []);
        } else setMosqueIncome([]);
    } catch (e) { setMosqueIncome([]); }

    try {
        if (savedExpenses) {
          const parsed = JSON.parse(savedExpenses);
          setExpenses(Array.isArray(parsed) ? parsed : []);
        } else setExpenses([]);
    } catch (e) { setExpenses([]); }

    try {
        if (savedImams) {
          const parsed = JSON.parse(savedImams);
          setImams(Array.isArray(parsed) ? parsed : []);
        } else setImams([]);
    } catch (e) { setImams([]); }

    try {
        if (savedRecycleBin) {
          const parsed = JSON.parse(savedRecycleBin);
          setRecycleBin(Array.isArray(parsed) ? parsed : []);
        } else setRecycleBin([]);
    } catch (e) { setRecycleBin([]); }

  }, [user]);

  // Save members
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    localStorage.setItem(getStorageKey('members'), JSON.stringify(members));
  }, [members, user]);

  // Save payments
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    localStorage.setItem(getStorageKey('payments'), JSON.stringify(payments));
  }, [payments, user]);

  // Save imam salary
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    localStorage.setItem(getStorageKey('imam_salary_payments'), JSON.stringify(imamSalaryPayments));
  }, [imamSalaryPayments, user]);

  // Save imam payouts
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    localStorage.setItem(getStorageKey('imam_payouts'), JSON.stringify(imamPayouts));
  }, [imamPayouts, user]);

  // Save mosque income
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    localStorage.setItem(getStorageKey('mosque_income'), JSON.stringify(mosqueIncome));
  }, [mosqueIncome, user]);

  // Save expenses
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    localStorage.setItem(getStorageKey('expenses'), JSON.stringify(expenses));
  }, [expenses, user]);

  // Save imams
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    localStorage.setItem(getStorageKey('imams'), JSON.stringify(imams));
  }, [imams, user]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    localStorage.setItem(getStorageKey('recycle_bin'), JSON.stringify(recycleBin));
  }, [recycleBin, user]);

  const addToRecycleBin = (items) => {
    if (user.role !== 'admin') return;
    const itemsArray = Array.isArray(items) ? items : [items];
    const newDeletedItems = itemsArray.map(item => ({
        id: item.data.id,
        originalData: item.data,
        type: item.type,
        deletedAt: new Date().toISOString()
    }));
    setRecycleBin(prev => [...newDeletedItems, ...prev]);
  };

  const restoreFromBin = (id) => {
    if (user.role !== 'admin') return;
    const itemToRestore = recycleBin.find(item => item.id === id);
    if (!itemToRestore) return;

    const { type, originalData } = itemToRestore;

    switch (type) {
        case 'member':
            setMembers(prev => {
                // Check if already exists to prevent duplicates
                if (prev.find(m => m.id === originalData.id)) return prev;
                return [...prev, originalData];
            });
            break;
        case 'payment':
            setPayments(prev => {
                if (prev.find(p => p.id === originalData.id)) return prev;
                return [...prev, originalData];
            });
            break;
        case 'imam_salary_payment':
            setImamSalaryPayments(prev => {
                if (prev.find(p => p.id === originalData.id)) return prev;
                return [...prev, originalData];
            });
            break;
        case 'imam_payout':
            setImamPayouts(prev => {
                if (prev.find(p => p.id === originalData.id)) return prev;
                return [...prev, originalData];
            });
            break;
        case 'mosque_income':
            setMosqueIncome(prev => {
                if (prev.find(p => p.id === originalData.id)) return prev;
                return [...prev, originalData];
            });
            break;
        case 'expense':
            setExpenses(prev => {
                if (prev.find(p => p.id === originalData.id)) return prev;
                return [...prev, originalData];
            });
            break;
        case 'imam':
            setImams(prev => {
                if (prev.find(i => i.id === originalData.id)) return prev;
                return [...prev, originalData];
            });
            break;
    }
    
    setRecycleBin(prev => prev.filter(item => item.id !== id));
  };

  const deleteFromBin = (id) => {
    if (user.role !== 'admin') return;
    setRecycleBin(prev => prev.filter(item => item.id !== id));
  };

  const emptyBin = () => {
    if (user.role !== 'admin') return;
    setRecycleBin([]);
  };

  const addMember = (member) => {
    const newMember = {
      ...member,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setMembers([...members, newMember]);
  };

  const updateMember = (id, updatedData) => {
    setMembers(members.map(member =>
      member.id === id ? { ...member, ...updatedData } : member
    ));
  };

  const deleteMember = (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      const memberToDelete = members.find(m => m.id === id);
      const paymentsToDelete = payments.filter(p => p.memberId === id);
      
      const itemsToBin = [];
      if (memberToDelete) itemsToBin.push({ data: memberToDelete, type: 'member' });
      paymentsToDelete.forEach(p => itemsToBin.push({ data: p, type: 'payment' }));
      
      addToRecycleBin(itemsToBin);

      setMembers(members.filter(member => member.id !== id));
      setPayments(payments.filter(payment => payment.memberId !== id));
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
        setUser(null);
        setCurrentView('dashboard');
        setIsSidebarOpen(false);
    }
  };

  if (!user) {
    return <Auth onLogin={setUser} currentTheme={theme} onToggleTheme={toggleTheme} />;
  }

  if (user.role === 'super_admin') {
      return <SuperAdminPanel onLogout={() => setUser(null)} />;
  }

  const isReadOnly = user.role === 'guest';


  const addPayment = (payment) => {
    if (user.role !== 'admin') return;
    const newPayment = {
      ...payment,
      id: Date.now().toString(),
      recordedAt: new Date().toISOString(),
    };
    setPayments([...payments, newPayment]);
  };

  const deletePayment = (id) => {
    if (user.role !== 'admin') return;
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      const paymentToDelete = payments.find(p => p.id === id);
      if (paymentToDelete) addToRecycleBin({ data: paymentToDelete, type: 'payment' });
      setPayments(payments.filter(payment => payment.id !== id));
    }
  };

  const addImamSalaryPayment = (payment) => {
    if (user.role !== 'admin') return;
    const newPayment = {
      ...payment,
      id: Date.now().toString(),
      paymentType: 'imam_salary',
      recordedAt: new Date().toISOString(),
    };
    setImamSalaryPayments([...imamSalaryPayments, newPayment]);
  };

  const deleteImamSalaryPayment = (id) => {
    if (user.role !== 'admin') return;
    if (window.confirm('Are you sure you want to delete this Imam salary payment?')) {
      const paymentToDelete = imamSalaryPayments.find(p => p.id === id);
      if (paymentToDelete) addToRecycleBin({ data: paymentToDelete, type: 'imam_salary_payment' });
      setImamSalaryPayments(imamSalaryPayments.filter(payment => payment.id !== id));
    }
  };

  const addImamPayout = (payout) => {
    if (user.role !== 'admin') return;
    const newPayout = {
      ...payout,
      id: Date.now().toString(),
      recordedAt: new Date().toISOString(),
    };
    setImamPayouts([...imamPayouts, newPayout]);
  };

  const deleteImamPayout = (id) => {
    if (user.role !== 'admin') return;
    if (window.confirm('Are you sure you want to delete this payout?')) {
        const payoutToDelete = imamPayouts.find(p => p.id === id);
        if (payoutToDelete) addToRecycleBin({ data: payoutToDelete, type: 'imam_payout' });
        setImamPayouts(imamPayouts.filter(p => p.id !== id));
    }
  };

  const addMosqueIncome = (income) => {
    if (user.role !== 'admin') return;
    const newIncome = {
      ...income,
      id: Date.now().toString(),
      recordedAt: new Date().toISOString(),
    };
    setMosqueIncome([...mosqueIncome, newIncome]);
  };

  const deleteMosqueIncome = (id) => {
    if (user.role !== 'admin') return;
    if (window.confirm('Are you sure you want to delete this income record?')) {
      const incomeToDelete = mosqueIncome.find(i => i.id === id);
      if (incomeToDelete) addToRecycleBin({ data: incomeToDelete, type: 'mosque_income' });
      setMosqueIncome(mosqueIncome.filter(income => income.id !== id));
    }
  };

  const addExpense = (expense) => {
    if (user.role !== 'admin') return;
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
      recordedAt: new Date().toISOString(),
    };
    setExpenses([...expenses, newExpense]);
  };

  const deleteExpense = (id) => {
    if (user.role !== 'admin') return;
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      const expenseToDelete = expenses.find(e => e.id === id);
      if (expenseToDelete) addToRecycleBin({ data: expenseToDelete, type: 'expense' });
      setExpenses(expenses.filter(expense => expense.id !== id));
    }
  };

  const addImam = (imam) => {
    if (user.role !== 'admin') return;
    const newImam = {
        ...imam,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
    };
    setImams([...imams, newImam]);
  };

  const updateImam = (id, updatedData) => {
    if (user.role !== 'admin') return;
    setImams(imams.map(imam => 
        imam.id === id ? { ...imam, ...updatedData } : imam
    ));
  };

  const deleteImam = (id) => {
    if (user.role !== 'admin') return;
    if (window.confirm('Are you sure you want to delete this Imam profile?')) {
        const imamToDelete = imams.find(i => i.id === id);
        // Also delete payouts associated with this Imam? 
        // For now, let's keep payouts but maybe flag them? 
        // Or better, just delete the profile. Payouts might be needed for history.
        // Actually, user might want to restore everything.
        // Let's add payouts to bin too if we implement linking later.
        
        if (imamToDelete) addToRecycleBin({ data: imamToDelete, type: 'imam' });
        setImams(imams.filter(i => i.id !== id));
    }
  };

  const updateMosqueProfile = (updatedData) => {
    if (user.role !== 'admin') return;
    
    console.log('Updating Mosque Profile:', updatedData);

    // Safeguard: Ensure name is not lost during update
    const finalData = {
        ...updatedData,
        name: updatedData.name || user.name // Fallback to existing name if new name is empty
    };

    if (!finalData.name) {
        console.error('Critical: Mosque name is missing in update!', finalData);
    }

    // Update local state
    setUser(finalData);

    // Update registered mosques list in local storage
    const mosques = JSON.parse(localStorage.getItem('registered_mosques') || '[]');
    
    // Filter out ANY record that matches the current user's ID or Email
    // This removes the old version AND any potential duplicates effectively
    const otherMosques = mosques.filter(m => m.id !== finalData.id && m.email !== finalData.email);
    
    // Add the updated record
    const updatedMosques = [...otherMosques, finalData];
    
    localStorage.setItem('registered_mosques', JSON.stringify(updatedMosques));
    
    // Also update current user in storage to match
    localStorage.setItem('masjid_current_user', JSON.stringify(finalData));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard members={members} payments={payments} imamSalaryPayments={imamSalaryPayments} imamPayouts={imamPayouts} mosqueIncome={mosqueIncome} expenses={expenses} isReadOnly={isReadOnly} />;
      case 'mosque-profile':
        return <MosqueProfile user={user} onUpdateProfile={updateMosqueProfile} />;
      case 'members':
        return (
          <MemberList
            members={members}
            payments={payments}
            imamSalaryPayments={imamSalaryPayments}
            onUpdateMember={updateMember}
            onDeleteMember={deleteMember}
            onDeletePayment={deletePayment}
            onDeleteImamSalaryPayment={deleteImamSalaryPayment}
            isReadOnly={isReadOnly}
            user={user}
          />
        );
      case 'add-member':
        return <AddMember onAddMember={addMember} onCancel={() => setCurrentView('members')} />;
      case 'record-payment':
        return <RecordPayment members={members} payments={payments} onAddPayment={addPayment} />;
      case 'pending':
        return <PendingPayments members={members} payments={payments} isReadOnly={isReadOnly} user={user} />;
      case 'imam-salary':
        return (
          <ImamSalary
            members={members}
            imamSalaryPayments={imamSalaryPayments}
            onDeletePayment={deleteImamSalaryPayment}
            isReadOnly={isReadOnly}
          />
        );
      case 'record-imam-salary':
        return <RecordImamSalary members={members} imamSalaryPayments={imamSalaryPayments} onAddPayment={addImamSalaryPayment} />;
      case 'pay-imam':
        return (
          <PayImam
            imams={imams}
            imamPayouts={imamPayouts}
            onAddImam={addImam}
            onUpdateImam={updateImam}
            onDeleteImam={deleteImam}
            onAddPayout={addImamPayout}
            onDeletePayout={deleteImamPayout}
            isReadOnly={isReadOnly}
          />
        );
      case 'mosque-income':
        return (
          <MosqueIncome
            mosqueIncome={mosqueIncome}
            onDeleteIncome={deleteMosqueIncome}
            isReadOnly={isReadOnly}
          />
        );
      case 'add-mosque-income':
        return <AddMosqueIncome onAddIncome={addMosqueIncome} onCancel={() => setCurrentView('mosque-income')} />;
      case 'expenses':
        return (
          <Expenses
            expenses={expenses}
            onDeleteExpense={deleteExpense}
            isReadOnly={isReadOnly}
          />
        );
      case 'add-expense':
        return <AddExpense onAddExpense={addExpense} onCancel={() => setCurrentView('expenses')} />;
      case 'recycle-bin':
        return (
          <RecycleBin 
            deletedItems={recycleBin}
            onRestore={restoreFromBin}
            onPermanentDelete={deleteFromBin}
            onEmptyBin={emptyBin}
            isReadOnly={isReadOnly}
          />
        );
      default:
        return <Dashboard members={members} payments={payments} imamSalaryPayments={imamSalaryPayments} mosqueIncome={mosqueIncome} expenses={expenses} isReadOnly={isReadOnly} />;
    }
  };

  return (
    <div className="app">
      <Header 
        onToggleSidebar={toggleSidebar} 
        mosqueName={user.role === 'super_admin' ? 'Super Admin Panel' : user.name}
        onToggleTheme={toggleTheme} 
        currentTheme={theme} 
      />
      <div className="app-container">
        <Sidebar 
          currentView={currentView} 
          onNavigate={(view) => {
            setCurrentView(view);
            closeSidebar();
          }} 
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          isReadOnly={isReadOnly}
          onLogout={handleLogout}
          currentTheme={theme}
          onToggleTheme={toggleTheme}
        />
        <main className="main-content">
          <div className="container">
            {isReadOnly && (
                <div style={{
                    background: '#e0f2fe',
                    color: '#0369a1',
                    padding: '10px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    textAlign: 'center',
                    border: '1px solid #bae6fd'
                }}>
                    👁️ You are viewing as a Guest (Read Only)
                </div>
            )}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
