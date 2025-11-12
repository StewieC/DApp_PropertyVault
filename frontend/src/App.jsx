import { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractData from "./contractData.json";

const OWNER = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

export default function App() {
  const [account, setAccount] = useState("");
  const [properties, setProperties] = useState([]);
  const [myProperty, setMyProperty] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [ownerPaymentHistory, setOwnerPaymentHistory] = useState([]);
  const [contract, setContract] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newTenant, setNewTenant] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [showLogin, setShowLogin] = useState(true);
  const [showOwnerSignup, setShowOwnerSignup] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");

  const isValidAddress = (addr) => {
    try { ethers.getAddress(addr); return true; } catch { return false; }
  };

  const connect = async () => {
    if (!window.ethereum) return alert("Install MetaMask");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);
      const cont = new ethers.Contract(contractData.address, contractData.abi, signer);
      setContract(cont);
      const ownerCheck = addr.toLowerCase() === OWNER.toLowerCase();
      setIsOwner(ownerCheck);
      setShowLogin(false);

      if (ownerCheck && properties.length === 0) {
        setShowOwnerSignup(true);
      }
    } catch (e) {
      alert("Connection failed: " + e.message);
    }
  };

  const load = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const count = await contract.getPropertyCount();
      const props = [];
      let mine = null;
      for (let i = 0; i < count; i++) {
        const p = await contract.properties(i);
        const formatted = {
          id: i,
          tenant: p.tenant,
          roomLabel: p.roomLabel,
          rentAmount: p.rentAmount,
          savingsPercent: p.savingsPercent,
          totalSaved: p.totalSaved,
          savingsGoal: p.savingsGoal,
        };
        props.push(formatted);
        if (p.tenant.toLowerCase() === account.toLowerCase()) mine = formatted;
      }
      setProperties(props);
      setMyProperty(mine);

      if (!isOwner && mine) {
        const history = [];
        const filter = contract.filters.RentPaid(null, mine.id);
        const events = await contract.queryFilter(filter);
        for (const e of events) {
          const block = await e.getBlock();
          history.push({
            amount: ethers.formatUnits(e.args.amount, 6),
            saved: ethers.formatUnits(e.args.savedForOwner, 6),
            date: new Date(block.timestamp * 1000).toLocaleDateString(),
            tx: e.transactionHash.slice(0, 8) + "...",
          });
        }
        setPaymentHistory(history.reverse());
      }

      if (isOwner) {
        const ownerHistory = [];
        for (const prop of props) {
          const filter = contract.filters.RentPaid(null, prop.id);
          const events = await contract.queryFilter(filter);
          for (const e of events) {
            const block = await e.getBlock();
            ownerHistory.push({
              room: prop.roomLabel,
              amount: ethers.formatUnits(e.args.amount, 6),
              saved: ethers.formatUnits(e.args.savedForOwner, 6),
              date: new Date(block.timestamp * 1000).toLocaleDateString(),
              tx: e.transactionHash.slice(0, 8) + "...",
              tenant: prop.tenant.slice(0, 6) + "..." + prop.tenant.slice(-4),
            });
          }
        }
        setOwnerPaymentHistory(ownerHistory.reverse());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    if (!contract || !isValidAddress(newTenant) || !newLabel.trim()) return;
    setLoading(true);
    try {
      const tx = await contract.createProperty(
        newTenant,
        newLabel,
        ethers.parseUnits("100", 6),
        30,
        ethers.parseUnits("500", 6)
      );
      await tx.wait();
      alert(`Room "${newLabel}" assigned!`);
      setNewTenant("");
      setNewLabel("");
      load();
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const payRent = async (id) => {
    setLoading(true);
    try {
      const tx = await contract.payRent(id);
      await tx.wait();
      alert("Rent paid!");
      load();
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (id) => {
    setLoading(true);
    try {
      const tx = await contract.withdrawSavings(id);
      await tx.wait();
      alert("Savings withdrawn!");
      load();
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract && !showLogin) load();
  }, [contract, showLogin]);

  // OWNER SIGNUP PAGE
  if (showOwnerSignup) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <h1 style={styles.title}>Register Your Property</h1>
            <p style={styles.subtitle}>As the owner, register your first property to begin.</p>
            <div style={styles.form}>
              <input
                type="text"
                placeholder="Your Name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Property Address (e.g. 123 Main St)"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                style={styles.input}
              />
              <button
                onClick={() => {
                  if (ownerName && propertyAddress) {
                    setShowOwnerSignup(false);
                    alert(`Welcome, ${ownerName}! Property registered.`);
                  } else {
                    alert("Fill all fields");
                  }
                }}
                style={styles.btnPrimary}
              >
                Register Property
              </button>
              <button onClick={() => setShowLogin(true)} style={styles.btnSecondary}>
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LOGIN PAGE
  if (showLogin) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <h1 style={styles.loginTitle}>Property Vault</h1>
          <p style={styles.loginSubtitle}>Decentralized Property Management</p>
          <button onClick={connect} style={styles.btnLogin}>
            Connect Wallet
          </button>
          <p style={styles.loginHint}>
            Owner or Tenant access detected automatically
          </p>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>Property Vault</h1>
            <button onClick={() => setShowLogin(true)} style={styles.logoutBtn}>
              Logout
            </button>
          </div>

          <p style={styles.wallet}>
            Wallet: <span style={styles.address}>{account.slice(0,6)}...{account.slice(-4)}</span>
            {isOwner ? " (Owner)" : " (Tenant)"}
          </p>

          {loading && <p style={styles.loading}>Processing...</p>}

          {/* OWNER DASHBOARD */}
          {isOwner && (
            <div style={styles.section}>
              <h2 style={styles.subtitle}>Owner Dashboard</h2>

              <div style={styles.form}>
                <input
                  type="text"
                  placeholder="Tenant Address (0x...)"
                  value={newTenant}
                  onChange={(e) => setNewTenant(e.target.value)}
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="Room Label (e.g. Apartment 5A)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  style={styles.input}
                />
                <button 
                  onClick={createRoom} 
                  style={styles.btnPrimary}
                  disabled={loading || !isValidAddress(newTenant) || !newLabel.trim()}
                >
                  Create & Assign Room
                </button>
              </div>

              <div style={styles.grid}>
                {properties.length === 0 ? (
                  <p style={styles.empty}>No rooms created yet.</p>
                ) : (
                  properties.map(p => (
                    <div key={p.id} style={styles.roomCard}>
                      <h3 style={styles.roomTitle}>{p.roomLabel}</h3>
                      <p style={styles.info}>
                        <strong>Tenant:</strong> {p.tenant.slice(0,6)}...{p.tenant.slice(-4)}
                      </p>
                      <p style={styles.info}>
                        <strong>Saved:</strong> {ethers.formatUnits(p.totalSaved, 6)} USDC
                      </p>
                      <button 
                        onClick={() => withdraw(p.id)} 
                        style={p.totalSaved > 0 ? styles.btnSuccess : styles.btnDisabled}
                        disabled={loading || p.totalSaved === 0n}
                      >
                        {p.totalSaved > 0 ? "Withdraw" : "No Savings"}
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div style={styles.historySection}>
                <h3 style={styles.historyTitle}>Payment History</h3>
                {ownerPaymentHistory.length === 0 ? (
                  <p style={styles.empty}>No payments yet.</p>
                ) : (
                  <div style={styles.historyList}>
                    {ownerPaymentHistory.map((h, i) => (
                      <div key={i} style={styles.historyItem}>
                        <div>
                          <strong>{h.date}</strong>
                          <span style={styles.historyRoom}>Room: {h.room}</span>
                        </div>
                        <div>
                          <span style={styles.historyAmount}>Paid: {h.amount} USDC</span>
                          <span style={styles.historySaved}>Saved: {h.saved} USDC</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TENANT DASHBOARD */}
          {!isOwner && account && (
            <div style={styles.section}>
              <h2 style={styles.subtitle}>Your Room</h2>
              {myProperty ? (
                <div style={styles.roomCard}>
                  <h3 style={styles.roomTitle}>{myProperty.roomLabel}</h3>
                  <p style={styles.info}>
                    <strong>Rent:</strong> {ethers.formatUnits(myProperty.rentAmount, 6)} USDC/month
                  </p>
                  <p style={styles.info}>
                    <strong>Saved:</strong> {ethers.formatUnits(myProperty.totalSaved, 6)} USDC
                  </p>

                  <div style={styles.progressContainer}>
                    <div 
                      style={{
                        ...styles.progressBar,
                        width: `${(Number(myProperty.totalSaved) * 100) / Number(myProperty.savingsGoal)}%`
                      }}
                    />
                  </div>
                  <p style={styles.progressText}>
                    {ethers.formatUnits(myProperty.totalSaved, 6)} / {ethers.formatUnits(myProperty.savingsGoal, 6)} USDC
                  </p>

                  <button 
                    onClick={() => payRent(myProperty.id)} 
                    style={styles.btnPrimary}
                    disabled={loading}
                  >
                    Pay Rent Now
                  </button>

                  <button 
                    onClick={async () => {
                      const usdc = new ethers.Contract("0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", [
                        "function approve(address spender, uint256 amount) returns (bool)"
                      ], contract.signer);
                      await usdc.approve(contractData.address, ethers.parseUnits("1000", 6));
                      alert("USDC approved");
                    }}
                    style={styles.btnSecondary}
                  >
                    Approve USDC
                  </button>

                  <div style={styles.historySection}>
                    <h3 style={styles.historyTitle}>Payment History</h3>
                    {paymentHistory.length === 0 ? (
                      <p style={styles.empty}>No payments yet.</p>
                    ) : (
                      <div style={styles.historyList}>
                        {paymentHistory.map((h, i) => (
                          <div key={i} style={styles.historyItem}>
                            <div>
                              <strong>{h.date}</strong>
                              <span style={styles.historyTx}>Tx: {h.tx}</span>
                            </div>
                            <div>
                              <span style={styles.historyAmount}>Paid: {h.amount} USDC</span>
                              <span style={styles.historySaved}>Saved: {h.saved} USDC</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p style={styles.empty}>No room assigned. Ask owner to add you.</p>
              )}
            </div>
          )}

          <button onClick={load} style={styles.btnRefresh} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

// NEW PROFESSIONAL COLOR PALETTE — HIGH CONTRAST
const styles = {
  // BACKGROUND
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #1e293b, #334155)",
    padding: "40px 20px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: "#f1f5f9",
  },
  container: { width: "90%", maxWidth: "1200px", margin: "0 auto" },
  card: { background: "#ffffff", borderRadius: 24, padding: 40, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", border: "1px solid #e2e8f0" },

  // LOGIN
  loginPage: { minHeight: "100vh", background: "linear-gradient(135deg, #0f172a, #1e293b)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  loginCard: { background: "#ffffff", borderRadius: 28, padding: 50, maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "0 25px 70px rgba(0,0,0,0.4)" },
  loginTitle: { fontSize: 52, margin: "0 0 16px", background: "linear-gradient(90deg, #3b82f6, #1d4ed8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800 },
  loginSubtitle: { fontSize: 18, color: "#64748b", margin: "0 0 32px" },
  btnLogin: { width: "100%", padding: "18px", fontSize: 20, fontWeight: "bold", background: "#3b82f6", color: "white", border: "none", borderRadius: 18, cursor: "pointer", boxShadow: "0 6px 18px rgba(59, 130, 246, 0.4)" },
  loginHint: { marginTop: 24, fontSize: 14, color: "#94a3b8" },

  // TYPOGRAPHY
  title: { fontSize: 48, margin: 0, background: "linear-gradient(90deg, #3b82f6, #1d4ed8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800 },
  subtitle: { fontSize: 30, color: "#1e293b", marginBottom: 20, borderBottom: "4px solid #3b82f6", paddingBottom: 10, display: "inline-block", fontWeight: 700 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  logoutBtn: { background: "none", border: "none", color: "#ef4444", fontSize: 16, fontWeight: "bold", cursor: "pointer", textDecoration: "underline" },
  wallet: { textAlign: "center", fontSize: 16, margin: "12px 0 24px", color: "#475569" },
  address: { fontFamily: "monospace", fontWeight: "bold", color: "#3b82f6" },
  loading: { textAlign: "center", color: "#f59e0b", fontWeight: "bold", fontSize: 16, margin: "16px 0" },

  // FORMS
  form: { display: "flex", flexDirection: "column", gap: 16, marginBottom: 32, padding: 24, background: "#f8fafc", borderRadius: 16, border: "2px dashed #3b82f6" },
  input: { padding: "14px", fontSize: 16, border: "2px solid #cbd5e1", borderRadius: 12, outline: "none", transition: "0.3s", fontFamily: "inherit" },

  // BUTTONS
  btnPrimary: { background: "#3b82f6", color: "white", padding: "14px 32px", border: "none", borderRadius: 14, fontWeight: "bold", cursor: "pointer", fontSize: 17, boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)", width: "100%" },
  btnSuccess: { background: "#10b981", color: "white", padding: "10px 20px", border: "none", borderRadius: 10, fontWeight: "bold", cursor: "pointer", fontSize: 14, marginTop: 12 },
  btnSecondary: { background: "#64748b", color: "white", padding: "10px 20px", border: "none", borderRadius: 10, fontSize: 14, cursor: "pointer", width: "100%", marginTop: 8 },
  btnDisabled: { background: "#cbd5e1", color: "#94a3b8", padding: "10px 20px", border: "none", borderRadius: 10, fontSize: 14, cursor: "not-allowed", marginTop: 12 },
  btnRefresh: { display: "block", width: "100%", padding: "14px", background: "#1e293b", color: "white", border: "none", borderRadius: 14, fontWeight: "bold", cursor: "pointer", marginTop: 40, fontSize: 16 },

  // LAYOUT
  section: { margin: "40px 0" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24, marginTop: 24 },
  roomCard: { background: "#f8fafc", border: "2px solid #3b82f6", borderRadius: 18, padding: 24, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" },
  roomTitle: { margin: "0 0 12px", fontSize: 22, color: "#1e293b", fontWeight: 700 },
  info: { margin: "8px 0", fontSize: 15, color: "#64748b" },

  // PROGRESS
  progressContainer: { background: "#e2e8f0", borderRadius: 12, height: 24, margin: "20px 0", overflow: "hidden", border: "1px solid #cbd5e1" },
  progressBar: { height: "100%", background: "linear-gradient(90deg, #3b82f6, #10b981)", borderRadius: 12, transition: "width 0.6s ease" },
  progressText: { textAlign: "center", fontSize: 15, color: "#1e293b", margin: "8px 0 16px", fontWeight: 600 },

  // HISTORY
  historySection: { marginTop: 32, paddingTop: 24, borderTop: "2px solid #e2e8f0" },
  historyTitle: { fontSize: 20, color: "#1e293b", margin: "0 0 16px", fontWeight: 700 },
  historyList: { display: "flex", flexDirection: "column", gap: 12 },
  historyItem: { background: "#f1f5f9", padding: 14, borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, color: "#1e293b", flexWrap: "wrap" },
  historyTx: { marginLeft: 8, fontFamily: "monospace", color: "#64748b", fontSize: 12 },
  historyRoom: { marginLeft: 8, color: "#10b981", fontWeight: "bold" },
  historyAmount: { fontWeight: "bold", color: "#3b82f6" },
  historySaved: { marginLeft: 8, color: "#f59e0b", fontWeight: "bold" },

  empty: { color: "#94a3b8", fontStyle: "italic", textAlign: "center", margin: "20px 0", fontSize: 16 },
};