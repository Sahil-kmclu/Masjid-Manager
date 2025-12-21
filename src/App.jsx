import { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import MemberList from './components/MemberList';
import AddMember from './components/AddMember';
import RecordPayment from './components/RecordPayment';
import PendingPayments from './components/PendingPayments';
import AdminPanel from './components/AdminPanel';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ImamSalary from './components/ImamSalary';
import RecordImamSalary from './components/RecordImamSalary';
import MosqueIncome from './components/MosqueIncome';
import AddMosqueIncome from './components/AddMosqueIncome';
import Expenses from './components/Expenses';
import AddExpense from './components/AddExpense';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [imamSalaryPayments, setImamSalaryPayments] = useState([]);
  const [mosqueIncome, setMosqueIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedMembers = localStorage.getItem('masjid_members');
    const savedPayments = localStorage.getItem('masjid_payments');
    const savedImamSalary = localStorage.getItem('masjid_imam_salary_payments');
    const savedMosqueIncome = localStorage.getItem('masjid_mosque_income');
    const savedExpenses = localStorage.getItem('masjid_expenses');

    if (savedMembers) {
      setMembers(JSON.parse(savedMembers));
    }

    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    }

    if (savedImamSalary) {
      setImamSalaryPayments(JSON.parse(savedImamSalary));
    }

    if (savedMosqueIncome) {
      setMosqueIncome(JSON.parse(savedMosqueIncome));
    }

    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  // Save members to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('masjid_members', JSON.stringify(members));
  }, [members]);

  // Save payments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('masjid_payments', JSON.stringify(payments));
  }, [payments]);

  // Save imam salary payments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('masjid_imam_salary_payments', JSON.stringify(imamSalaryPayments));
  }, [imamSalaryPayments]);

  // Save mosque income to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('masjid_mosque_income', JSON.stringify(mosqueIncome));
  }, [mosqueIncome]);

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('masjid_expenses', JSON.stringify(expenses));
  }, [expenses]);

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


  const addPayment = (payment) => {
    const newPayment = {
      ...payment,
      id: Date.now().toString(),
      recordedAt: new Date().toISOString(),
    };
    setPayments([...payments, newPayment]);
  };

  const deletePayment = (id) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      setPayments(payments.filter(payment => payment.id !== id));
    }
  };

  const addImamSalaryPayment = (payment) => {
    const newPayment = {
      ...payment,
      id: Date.now().toString(),
      paymentType: 'imam_salary',
      recordedAt: new Date().toISOString(),
    };
    setImamSalaryPayments([...imamSalaryPayments, newPayment]);
  };

  const deleteImamSalaryPayment = (id) => {
    if (window.confirm('Are you sure you want to delete this Imam salary payment?')) {
      setImamSalaryPayments(imamSalaryPayments.filter(payment => payment.id !== id));
    }
  };

  const addMosqueIncome = (income) => {
    const newIncome = {
      ...income,
      id: Date.now().toString(),
      recordedAt: new Date().toISOString(),
    };
    setMosqueIncome([...mosqueIncome, newIncome]);
  };

  const deleteMosqueIncome = (id) => {
    if (window.confirm('Are you sure you want to delete this income record?')) {
      setMosqueIncome(mosqueIncome.filter(income => income.id !== id));
    }
  };

  const addExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
      recordedAt: new Date().toISOString(),
    };
    setExpenses([...expenses, newExpense]);
  };

  const deleteExpense = (id) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      setExpenses(expenses.filter(expense => expense.id !== id));
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard members={members} payments={payments} imamSalaryPayments={imamSalaryPayments} mosqueIncome={mosqueIncome} expenses={expenses} />;
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
          />
        );
      case 'add-member':
        return <AddMember onAddMember={addMember} onCancel={() => setCurrentView('members')} />;
      case 'record-payment':
        return <RecordPayment members={members} onAddPayment={addPayment} />;
      case 'pending':
        return <PendingPayments members={members} payments={payments} />;
      case 'imam-salary':
        return (
          <ImamSalary
            members={members}
            imamSalaryPayments={imamSalaryPayments}
            onDeletePayment={deleteImamSalaryPayment}
          />
        );
      case 'record-imam-salary':
        return <RecordImamSalary members={members} onAddPayment={addImamSalaryPayment} />;
      case 'mosque-income':
        return (
          <MosqueIncome
            mosqueIncome={mosqueIncome}
            onDeleteIncome={deleteMosqueIncome}
          />
        );
      case 'add-mosque-income':
        return <AddMosqueIncome onAddIncome={addMosqueIncome} onCancel={() => setCurrentView('mosque-income')} />;
      case 'expenses':
        return (
          <Expenses
            expenses={expenses}
            onDeleteExpense={deleteExpense}
          />
        );
      case 'add-expense':
        return <AddExpense onAddExpense={addExpense} onCancel={() => setCurrentView('expenses')} />;
      case 'admin':
        return <AdminPanel members={members} payments={payments} />;
      default:
        return <Dashboard members={members} payments={payments} imamSalaryPayments={imamSalaryPayments} mosqueIncome={mosqueIncome} expenses={expenses} />;
    }
  };

  return (
    <div className="app">
      <Header onToggleSidebar={toggleSidebar} />
      <div className="app-container">
        <Sidebar 
          currentView={currentView} 
          onNavigate={(view) => {
            setCurrentView(view);
            closeSidebar();
          }} 
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />
        <main className="main-content">
          <div className="container">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
