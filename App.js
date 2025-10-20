import React, { useState } from "react";
import axios from "axios";
import "./App.css";

// ✅ Your working Google Apps Script Web App URL
const BASE_URL =
  "https://script.google.com/macros/s/AKfycbzgr-ETeW1rtSek87Jwv3ELRY-zDn49QZ3fa4wRvxlf_gZ3iFhdeCwCBXXGe83fL5gsCg/exec";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    category: "",
    amount: "",
    account_name: "",
    note: "",
    new_balance: "",
    person_name: "",
    type: "",
    date: "",
    purpose: "",
  });

  // 🔹 Handle input changes for all forms
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Fetch accounts for user
  const fetchAccounts = async (user_id) => {
    try {
      const res = await axios.get(BASE_URL, {
        params: { action: "getAccounts", user_id },
      });
      setAccounts(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch accounts");
    }
  };

  // 🔐 LOGIN PAGE
  const LoginPage = () => {
    const [loginForm, setLoginForm] = useState({ username: "", password: "" });

    const handleLoginChange = (e) => {
      const { name, value } = e.target;
      setLoginForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleLoginSubmit = async () => {
      try {
        const res = await axios.get(BASE_URL, {
          params: {
            action: "login",
            username: loginForm.username.trim(),
            password: loginForm.password.trim(),
          },
        });
        if (res.data.success) {
          setUser(res.data);
          fetchAccounts(res.data.user_id);
          setPage("dashboard");
        } else {
          alert("Invalid username or password");
        }
      } catch (err) {
        console.error(err);
        alert("Error connecting to server");
      }
    };

    return (
      <div className="page">
        <h2>🔐 FinPocket Login</h2>
        <input
          name="username"
          placeholder="Username"
          value={loginForm.username}
          onChange={handleLoginChange}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={loginForm.password}
          onChange={handleLoginChange}
        />
        <button onClick={handleLoginSubmit}>Login</button>
      </div>
    );
  };

  // 🏦 DASHBOARD PAGE
  const Dashboard = () => {
    const totalBalance = accounts.reduce(
      (acc, a) => acc + Number(a.balance || 0),
      0
    );

    return (
      <div className="page">
        <h2>🏦 Dashboard</h2>
        <p>
          <b>User:</b> {user?.username}
        </p>
        <h3>💰 Total Balance: ₹{totalBalance}</h3>

        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          <button onClick={() => setPage("addAccount")}>🏧 Add Account</button>
          <button onClick={() => setPage("addExpense")}>💸 Add Expense</button>
          <button onClick={() => setPage("adjustBalance")}>
            ⚖️ Adjust Balance
          </button>
          <button onClick={() => setPage("pockets")}>👥 Pockets</button>
          <button
            onClick={() => {
              setUser(null);
              setAccounts([]);
              setPage("login");
            }}
          >
            Logout
          </button>
        </div>

        <h3>Accounts</h3>
        {accounts.length === 0 && <p>No accounts found.</p>}
        {accounts.map((a) => (
          <div key={a.account_id} className="card">
            <b>{a.account_name}</b> ({a.account_type})
            <p>Balance: ₹{a.balance}</p>
            <p>Last Updated: {a.last_updated}</p>
          </div>
        ))}
      </div>
    );
  };

  // 🏧 ADD ACCOUNT PAGE
  const AddAccount = () => {
    const [newAccount, setNewAccount] = useState({
      account_name: "",
      account_type: "Bank",
      balance: "",
    });

    const handleAccountChange = (e) => {
      const { name, value } = e.target;
      setNewAccount((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddAccount = async () => {
      if (!newAccount.account_name || !newAccount.balance) {
        alert("Please fill all fields");
        return;
      }

      try {
        const res = await axios.get(BASE_URL, {
          params: {
            action: "addAccount",
            user_id: user.user_id,
            account_name: newAccount.account_name,
            account_type: newAccount.account_type,
            balance: newAccount.balance,
          },
        });
        if (res.data.success) {
          alert("Account added successfully!");
          fetchAccounts(user.user_id);
          setPage("dashboard");
        } else {
          alert("Failed to add account");
        }
      } catch (err) {
        console.error(err);
        alert("Error adding account");
      }
    };

    return (
      <div className="page">
        <h2>🏧 Add Account</h2>
        <input
          name="account_name"
          placeholder="Account Name"
          value={newAccount.account_name}
          onChange={handleAccountChange}
        />
        <select
          name="account_type"
          value={newAccount.account_type}
          onChange={handleAccountChange}
        >
          <option>Bank</option>
          <option>Cash</option>
          <option>Wallet</option>
          <option>Other</option>
        </select>
        <input
          name="balance"
          placeholder="Initial Balance"
          value={newAccount.balance}
          onChange={handleAccountChange}
        />
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleAddAccount}>Save</button>
          <button onClick={() => setPage("dashboard")}>Back</button>
        </div>
      </div>
    );
  };

  // 💸 ADD EXPENSE PAGE
  const AddExpense = () => {
    const handleAddExpense = async () => {
      if (!form.category || !form.amount || !form.account_name) {
        alert("Please fill all fields");
        return;
      }

      try {
        const res = await axios.get(BASE_URL, {
          params: {
            action: "addExpense",
            user_id: user.user_id,
            category: form.category,
            amount: form.amount,
            account_name: form.account_name,
            note: form.note,
          },
        });
        if (res.data.success) {
          alert("Expense added!");
          fetchAccounts(user.user_id);
          setPage("dashboard");
        } else {
          alert("Failed to add expense");
        }
      } catch (err) {
        console.error(err);
        alert("Error adding expense");
      }
    };

    return (
      <div className="page">
        <h2>💸 Add Expense</h2>
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Select Category</option>
          <option>Swiggy</option>
          <option>Zomato</option>
          <option>Restaurant</option>
          <option>Groceries</option>
          <option>Fuel</option>
          <option>Cash Withdrawal</option>
          <option>Other</option>
        </select>
        <input
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
        />
        <select
          name="account_name"
          value={form.account_name}
          onChange={handleChange}
        >
          <option value="">Select Account</option>
          {accounts.map((a) => (
            <option key={a.account_id}>{a.account_name}</option>
          ))}
        </select>
        <input
          name="note"
          placeholder="Note (optional)"
          value={form.note}
          onChange={handleChange}
        />
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleAddExpense}>Save</button>
          <button onClick={() => setPage("dashboard")}>Back</button>
        </div>
      </div>
    );
  };

  // ⚖️ ADJUST BALANCE PAGE
  const AdjustBalance = () => {
    const handleAdjustBalance = async () => {
      if (!form.account_name || !form.new_balance) {
        alert("Please fill all fields");
        return;
      }

      try {
        const res = await axios.get(BASE_URL, {
          params: {
            action: "adjustBalance",
            user_id: user.user_id,
            account_name: form.account_name,
            new_balance: form.new_balance,
          },
        });
        if (res.data.success) {
          alert("Balance updated!");
          fetchAccounts(user.user_id);
          setPage("dashboard");
        } else {
          alert("Failed to update balance");
        }
      } catch (err) {
        console.error(err);
        alert("Error adjusting balance");
      }
    };

    return (
      <div className="page">
        <h2>⚖️ Adjust Balance</h2>
        <select
          name="account_name"
          value={form.account_name}
          onChange={handleChange}
        >
          <option value="">Select Account</option>
          {accounts.map((a) => (
            <option key={a.account_id}>{a.account_name}</option>
          ))}
        </select>
        <input
          name="new_balance"
          placeholder="New Balance"
          value={form.new_balance}
          onChange={handleChange}
        />
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleAdjustBalance}>Update</button>
          <button onClick={() => setPage("dashboard")}>Back</button>
        </div>
      </div>
    );
  };

  // 👥 POCKETS PAGE
  const Pockets = () => {
    const handleAddPocket = async () => {
      try {
        const res = await axios.get(BASE_URL, {
          params: {
            action: "addPocket",
            user_id: user.user_id,
            person_name: form.person_name,
            type: form.type,
            amount: form.amount,
            date: form.date,
            purpose: form.purpose,
          },
        });
        if (res.data.success) {
          alert("Pocket entry added!");
          setPage("dashboard");
        } else {
          alert("Failed to add entry");
        }
      } catch (err) {
        console.error(err);
        alert("Error adding pocket entry");
      }
    };

    return (
      <div className="page">
        <h2>👥 Add Pocket Entry</h2>
        <input
          name="person_name"
          placeholder="Person Name"
          value={form.person_name}
          onChange={handleChange}
        />
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="">Select Type</option>
          <option>Gave</option>
          <option>Received</option>
        </select>
        <input
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
        />
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
        />
        <input
          name="purpose"
          placeholder="Purpose"
          value={form.purpose}
          onChange={handleChange}
        />
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleAddPocket}>Save</button>
          <button onClick={() => setPage("dashboard")}>Back</button>
        </div>
      </div>
    );
  };

  // 🧩 MAIN ROUTER
  return (
    <div className="App">
      {page === "login" && <LoginPage />}
      {page === "dashboard" && <Dashboard />}
      {page === "addAccount" && <AddAccount />}
      {page === "addExpense" && <AddExpense />}
      {page === "adjustBalance" && <AdjustBalance />}
      {page === "pockets" && <Pockets />}
    </div>
  );
}

export default App;
