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
import MosqueProfile from './components/MosqueProfile';
import SuperAdminPanel from './components/SuperAdminPanel';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [imamSalaryPayments, setImamSalaryPayments] = useState([]);
  const [mosqueIncome, setMosqueIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check for logged in user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('masjid_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
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
    const incomeKey = getStorageKey('mosque_income');
    const expenseKey = getStorageKey('expenses');

    const savedMembers = localStorage.getItem(memberKey);
    const savedPayments = localStorage.getItem(paymentKey);
    const savedImamSalary = localStorage.getItem(salaryKey);
    const savedMosqueIncome = localStorage.getItem(incomeKey);
    const savedExpenses = localStorage.getItem(expenseKey);

    // Migration Logic: If no data for this user, and it's the first login/register, 
    // try to copy from legacy global keys (for backward compatibility)
    if (!savedMembers && localStorage.getItem('masjid_members')) {
        // Only migrate if we are admin
        if (user.role === 'admin') {
            setMembers(JSON.parse(localStorage.getItem('masjid_members')));
            setPayments(JSON.parse(localStorage.getItem('masjid_payments') || '[]'));
            setImamSalaryPayments(JSON.parse(localStorage.getItem('masjid_imam_salary_payments') || '[]'));
            setMosqueIncome(JSON.parse(localStorage.getItem('masjid_mosque_income') || '[]'));
            setExpenses(JSON.parse(localStorage.getItem('masjid_expenses') || '[]'));
            
            // Optional: Clear legacy data after migration to prevent confusion? 
            // Better keep it for safety for now.
            return; 
        }
    }

    if (savedMembers) setMembers(JSON.parse(savedMembers));
    else setMembers([]);

    if (savedPayments) setPayments(JSON.parse(savedPayments));
    else setPayments([]);

    if (savedImamSalary) setImamSalaryPayments(JSON.parse(savedImamSalary));
    else setImamSalaryPayments([]);

    if (savedMosqueIncome) setMosqueIncome(JSON.parse(savedMosqueIncome));
    else setMosqueIncome([]);

    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    else setExpenses([]);

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
    return <Auth onLogin={setUser} />;
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
      setImamSalaryPayments(imamSalaryPayments.filter(payment => payment.id !== id));
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
      setExpenses(expenses.filter(expense => expense.id !== id));
    }
  };

  const updateMosqueProfile = (updatedData) => {
    if (user.role !== 'admin') return;
    
    // Update local state
    setUser(updatedData);

    // Update registered mosques list in local storage
    const mosques = JSON.parse(localStorage.getItem('registered_mosques') || '[]');
    
    // Filter out ANY record that matches the current user's ID or Email
    // This removes the old version AND any potential duplicates effectively
    const otherMosques = mosques.filter(m => m.id !== updatedData.id && m.email !== updatedData.email);
    
    // Add the updated record
    const updatedMosques = [...otherMosques, updatedData];
    
    localStorage.setItem('registered_mosques', JSON.stringify(updatedMosques));
    
    // Also update current user in storage to match
    localStorage.setItem('masjid_current_user', JSON.stringify(updatedData));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard members={members} payments={payments} imamSalaryPayments={imamSalaryPayments} mosqueIncome={mosqueIncome} expenses={expenses} isReadOnly={isReadOnly} />;
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
          />
        );
      case 'add-member':
        return <AddMember onAddMember={addMember} onCancel={() => setCurrentView('members')} />;
      case 'record-payment':
        return <RecordPayment members={members} onAddPayment={addPayment} />;
      case 'pending':
        return <PendingPayments members={members} payments={payments} isReadOnly={isReadOnly} />;
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
        return <RecordImamSalary members={members} onAddPayment={addImamSalaryPayment} />;
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
      default:
        return <Dashboard members={members} payments={payments} imamSalaryPayments={imamSalaryPayments} mosqueIncome={mosqueIncome} expenses={expenses} isReadOnly={isReadOnly} />;
    }
  };

  return (
    <div className="app">
      <Header onToggleSidebar={toggleSidebar} mosqueName={user.name} />
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
