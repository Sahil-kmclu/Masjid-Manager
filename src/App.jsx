import { useState, useEffect, useCallback } from "react";
import "./App.css";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import MemberList from "./components/MemberList";
import AddMember from "./components/AddMember";
import RecordPayment from "./components/RecordPayment";
import PendingPayments from "./components/PendingPayments";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ImamSalary from "./components/ImamSalary";
import RecordImamSalary from "./components/RecordImamSalary";
import MosqueIncome from "./components/MosqueIncome";
import AddMosqueIncome from "./components/AddMosqueIncome";
import Expenses from "./components/Expenses";
import AddExpense from "./components/AddExpense";
import PayImam from "./components/PayImam";
import RecycleBin from "./components/RecycleBin";
import MosqueProfile from "./components/MosqueProfile";
import SuperAdminPanel from "./components/SuperAdminPanel";

// API imports
import * as membersApi from "./api/members";
import * as paymentsApi from "./api/payments";
import * as imamsApi from "./api/imams";
import * as financesApi from "./api/finances";
import * as recycleBinApi from "./api/recycleBin";
import * as authApi from "./api/auth";

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [imamSalaryPayments, setImamSalaryPayments] = useState([]);
  const [imamPayouts, setImamPayouts] = useState([]);
  const [mosqueIncome, setMosqueIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [imams, setImams] = useState([]);
  const [recycleBin, setRecycleBin] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  // Theme Effect
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Load all data from API
  const fetchAllData = useCallback(async () => {
    if (!user || user.role === "super_admin") return;

    setLoading(true);
    setError(null);

    try {
      const [
        membersData,
        paymentsData,
        imamsData,
        imamSalaryData,
        imamPayoutsData,
        incomeData,
        expensesData,
        recycleBinData,
      ] = await Promise.all([
        membersApi.getMembers(),
        paymentsApi.getPayments(),
        imamsApi.getImams(),
        imamsApi.getImamSalaryPayments(),
        imamsApi.getImamPayouts(),
        financesApi.getIncome(),
        financesApi.getExpenses(),
        user.role === "admin"
          ? recycleBinApi.getRecycleBin()
          : Promise.resolve([]),
      ]);

      setMembers(membersData || []);
      setPayments(paymentsData || []);
      setImams(imamsData || []);
      setImamSalaryPayments(imamSalaryData || []);
      setImamPayouts(imamPayoutsData || []);
      setMosqueIncome(incomeData || []);
      setExpenses(expensesData || []);
      setRecycleBin(recycleBinData || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check for logged in user on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("masjid_auth_token");
      if (token) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
        } catch (err) {
          console.error("Token expired or invalid:", err);
          authApi.logout();
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Load data when user changes
  useEffect(() => {
    if (user && user.role !== "super_admin") {
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, [user, fetchAllData]);

  // Handle navigation history
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialView = params.get("view") || "dashboard";

    if (!window.history.state) {
      window.history.replaceState(
        { view: initialView },
        "",
        `?view=${initialView}`
      );
      if (initialView !== "dashboard") {
        setCurrentView(initialView);
      }
    } else if (
      window.history.state.view &&
      window.history.state.view !== currentView
    ) {
      setCurrentView(window.history.state.view);
    }

    const handlePopState = (event) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view);
      } else {
        const params = new URLSearchParams(window.location.search);
        const view = params.get("view") || "dashboard";
        setCurrentView(view);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleNavigate = (view) => {
    setCurrentView(view);
    const newUrl = view === "dashboard" ? "/" : `?view=${view}`;
    window.history.pushState({ view }, "", newUrl);
    window.scrollTo(0, 0);
    closeSidebar();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      authApi.logout();
      setUser(null);
      setMembers([]);
      setPayments([]);
      setImamSalaryPayments([]);
      setImamPayouts([]);
      setMosqueIncome([]);
      setExpenses([]);
      setImams([]);
      setRecycleBin([]);
      setCurrentView("dashboard");
      setIsSidebarOpen(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    // Save user to localStorage for session persistence
    localStorage.setItem("masjid_current_user", JSON.stringify(userData));
  };

  // Show loading state
  if (loading && !user) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🕌</div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Auth
        onLogin={handleLogin}
        currentTheme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (user.role === "super_admin") {
    return <SuperAdminPanel onLogout={() => setUser(null)} />;
  }

  const isReadOnly = user.role === "guest";

  // ===== API-based CRUD operations =====

  const addMember = async (memberData) => {
    if (isReadOnly) return;
    try {
      const newMember = await membersApi.createMember(memberData);
      setMembers((prev) => [...prev, newMember]);
      handleNavigate("members");
    } catch (err) {
      alert("Failed to add member: " + err.message);
    }
  };

  const updateMember = async (id, updatedData) => {
    if (isReadOnly) return;
    try {
      const updated = await membersApi.updateMember(id, updatedData);
      setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
    } catch (err) {
      alert("Failed to update member: " + err.message);
    }
  };

  const deleteMember = async (id) => {
    if (isReadOnly) return;
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        await membersApi.deleteMember(id);
        setMembers((prev) => prev.filter((m) => m.id !== id));
        setPayments((prev) => prev.filter((p) => p.memberId !== id));
        // Refresh recycle bin
        const binData = await recycleBinApi.getRecycleBin();
        setRecycleBin(binData || []);
      } catch (err) {
        alert("Failed to delete member: " + err.message);
      }
    }
  };

  const addPayment = async (paymentData) => {
    if (isReadOnly) return;
    try {
      const newPayment = await paymentsApi.createPayment(paymentData);
      setPayments((prev) => [...prev, newPayment]);
      handleNavigate("members");
    } catch (err) {
      alert("Failed to record payment: " + err.message);
    }
  };

  const deletePayment = async (id) => {
    if (isReadOnly) return;
    if (
      window.confirm("Are you sure you want to delete this payment record?")
    ) {
      try {
        await paymentsApi.deletePayment(id);
        setPayments((prev) => prev.filter((p) => p.id !== id));
        const binData = await recycleBinApi.getRecycleBin();
        setRecycleBin(binData || []);
      } catch (err) {
        alert("Failed to delete payment: " + err.message);
      }
    }
  };

  const addImamSalaryPayment = async (paymentData) => {
    if (isReadOnly) return;
    try {
      const newPayment = await imamsApi.createImamSalaryPayment(paymentData);
      setImamSalaryPayments((prev) => [...prev, newPayment]);
    } catch (err) {
      alert("Failed to add salary payment: " + err.message);
    }
  };

  const deleteImamSalaryPayment = async (id) => {
    if (isReadOnly) return;
    if (
      window.confirm(
        "Are you sure you want to delete this Imam salary payment?"
      )
    ) {
      try {
        await imamsApi.deleteImamSalaryPayment(id);
        setImamSalaryPayments((prev) => prev.filter((p) => p.id !== id));
        const binData = await recycleBinApi.getRecycleBin();
        setRecycleBin(binData || []);
      } catch (err) {
        alert("Failed to delete salary payment: " + err.message);
      }
    }
  };

  const addImam = async (imamData) => {
    if (isReadOnly) return;
    try {
      const newImam = await imamsApi.createImam(imamData);
      setImams((prev) => [...prev, newImam]);
    } catch (err) {
      alert("Failed to add imam: " + err.message);
    }
  };

  const updateImam = async (id, updatedData) => {
    if (isReadOnly) return;
    try {
      const updated = await imamsApi.updateImam(id, updatedData);
      setImams((prev) => prev.map((i) => (i.id === id ? updated : i)));
    } catch (err) {
      alert("Failed to update imam: " + err.message);
    }
  };

  const deleteImam = async (id) => {
    if (isReadOnly) return;
    if (window.confirm("Are you sure you want to delete this Imam profile?")) {
      try {
        await imamsApi.deleteImam(id);
        setImams((prev) => prev.filter((i) => i.id !== id));
        const binData = await recycleBinApi.getRecycleBin();
        setRecycleBin(binData || []);
      } catch (err) {
        alert("Failed to delete imam: " + err.message);
      }
    }
  };

  const addImamPayout = async (payoutData) => {
    if (isReadOnly) return;
    try {
      const newPayout = await imamsApi.createImamPayout(payoutData);
      setImamPayouts((prev) => [...prev, newPayout]);
    } catch (err) {
      alert("Failed to add payout: " + err.message);
    }
  };

  const deleteImamPayout = async (id) => {
    if (isReadOnly) return;
    if (window.confirm("Are you sure you want to delete this payout?")) {
      try {
        await imamsApi.deleteImamPayout(id);
        setImamPayouts((prev) => prev.filter((p) => p.id !== id));
        const binData = await recycleBinApi.getRecycleBin();
        setRecycleBin(binData || []);
      } catch (err) {
        alert("Failed to delete payout: " + err.message);
      }
    }
  };

  const addMosqueIncome = async (incomeData) => {
    if (isReadOnly) return;
    try {
      const newIncome = await financesApi.createIncome(incomeData);
      setMosqueIncome((prev) => [...prev, newIncome]);
      handleNavigate("mosque-income");
    } catch (err) {
      alert("Failed to add income: " + err.message);
    }
  };

  const deleteMosqueIncome = async (id) => {
    if (isReadOnly) return;
    if (window.confirm("Are you sure you want to delete this income record?")) {
      try {
        await financesApi.deleteIncome(id);
        setMosqueIncome((prev) => prev.filter((i) => i.id !== id));
        const binData = await recycleBinApi.getRecycleBin();
        setRecycleBin(binData || []);
      } catch (err) {
        alert("Failed to delete income: " + err.message);
      }
    }
  };

  const addExpense = async (expenseData) => {
    if (isReadOnly) return;
    try {
      const newExpense = await financesApi.createExpense(expenseData);
      setExpenses((prev) => [...prev, newExpense]);
      handleNavigate("mosque-expenses");
    } catch (err) {
      alert("Failed to add expense: " + err.message);
    }
  };

  const deleteExpense = async (id) => {
    if (isReadOnly) return;
    if (
      window.confirm("Are you sure you want to delete this expense record?")
    ) {
      try {
        await financesApi.deleteExpense(id);
        setExpenses((prev) => prev.filter((e) => e.id !== id));
        const binData = await recycleBinApi.getRecycleBin();
        setRecycleBin(binData || []);
      } catch (err) {
        alert("Failed to delete expense: " + err.message);
      }
    }
  };

  const restoreFromBin = async (id) => {
    if (isReadOnly) return;
    try {
      await recycleBinApi.restoreItem(id);
      // Refresh all data after restore
      await fetchAllData();
    } catch (err) {
      alert("Failed to restore item: " + err.message);
    }
  };

  const deleteFromBin = async (id) => {
    if (isReadOnly) return;
    try {
      await recycleBinApi.permanentDelete(id);
      setRecycleBin((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert("Failed to delete item: " + err.message);
    }
  };

  const emptyBin = async () => {
    if (isReadOnly) return;
    if (
      window.confirm("Are you sure you want to permanently delete all items?")
    ) {
      try {
        await recycleBinApi.emptyRecycleBin();
        setRecycleBin([]);
      } catch (err) {
        alert("Failed to empty recycle bin: " + err.message);
      }
    }
  };

  const updateMosqueProfile = async (updatedData) => {
    if (isReadOnly) return;
    try {
      const response = await authApi.updateProfile(updatedData);
      setUser(response.mosque);
      localStorage.setItem(
        "masjid_current_user",
        JSON.stringify(response.mosque)
      );
    } catch (err) {
      alert("Failed to update profile: " + err.message);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
          <div>Loading data...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ textAlign: "center", padding: "2rem", color: "#ef4444" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚠️</div>
          <div>{error}</div>
          <button
            onClick={fetchAllData}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    switch (currentView) {
      case "dashboard":
        return (
          <Dashboard
            members={members}
            payments={payments}
            imamSalaryPayments={imamSalaryPayments}
            imamPayouts={imamPayouts}
            mosqueIncome={mosqueIncome}
            expenses={expenses}
            isReadOnly={isReadOnly}
          />
        );
      case "mosque-profile":
        return (
          <MosqueProfile user={user} onUpdateProfile={updateMosqueProfile} />
        );
      case "members":
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
      case "add-member":
        return (
          <AddMember
            onAddMember={addMember}
            onCancel={() => window.history.back()}
          />
        );
      case "record-payment":
        return (
          <RecordPayment
            members={members}
            payments={payments}
            onAddPayment={addPayment}
          />
        );
      case "pending":
        return (
          <PendingPayments
            members={members}
            payments={payments}
            isReadOnly={isReadOnly}
            user={user}
          />
        );
      case "imam-salary":
        return (
          <ImamSalary
            members={members}
            imamSalaryPayments={imamSalaryPayments}
            onDeletePayment={deleteImamSalaryPayment}
            isReadOnly={isReadOnly}
          />
        );
      case "record-imam-salary":
        return (
          <RecordImamSalary
            members={members}
            imamSalaryPayments={imamSalaryPayments}
            onAddPayment={addImamSalaryPayment}
            onCancel={() => window.history.back()}
          />
        );
      case "pay-imam":
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
      case "mosque-income":
        return (
          <MosqueIncome
            mosqueIncome={mosqueIncome}
            onDeleteIncome={deleteMosqueIncome}
            isReadOnly={isReadOnly}
          />
        );
      case "add-mosque-income":
        return (
          <AddMosqueIncome
            onAddIncome={addMosqueIncome}
            onCancel={() => setCurrentView("mosque-income")}
          />
        );
      case "mosque-expenses":
        return (
          <Expenses
            expenses={expenses}
            onDeleteExpense={deleteExpense}
            isReadOnly={isReadOnly}
          />
        );
      case "add-expense":
        return (
          <AddExpense
            onAddExpense={addExpense}
            onCancel={() => setCurrentView("mosque-expenses")}
          />
        );
      case "recycle-bin":
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
        return (
          <Dashboard
            members={members}
            payments={payments}
            imamSalaryPayments={imamSalaryPayments}
            mosqueIncome={mosqueIncome}
            expenses={expenses}
            isReadOnly={isReadOnly}
          />
        );
    }
  };

  return (
    <div className="app">
      <Header
        onToggleSidebar={toggleSidebar}
        mosqueName={
          user.role === "super_admin" ? "Super Admin Panel" : user.name
        }
        onToggleTheme={toggleTheme}
        currentTheme={theme}
        onNavigate={handleNavigate}
      />
      <div className="app-container">
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
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
              <div
                style={{
                  background: "#e0f2fe",
                  color: "#0369a1",
                  padding: "10px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  textAlign: "center",
                  border: "1px solid #bae6fd",
                }}
              >
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
