# Property Vault DApp  
## A Web3 Rent Payment & Savings Platform  


---

## 1. Project Overview

**Property Vault** is a **decentralized rental payment system** that enables:

- **Landlords** to create and assign rooms to tenants  
- **Tenants** to pay rent in **USDC** with **automatic savings** for the owner  
- **Full transparency** via on-chain payment history  
- **Zero trust** — powered by **smart contracts**

> **No middlemen. No late fees. No paper receipts.**

---

## 2. Problem Solved

| Problem                  | Solution                                |
|--------------------------|-----------------------------------------|
| Tenants forget rent      | **One-click USDC payments**             |
| Owners chase payments    | **On-chain history**                    |
| No proof of payment      | **Immutable blockchain logs**           |
| No savings incentive     | **30% of rent auto-saved for owner**    |

---

## 3. How It Works (Step-by-Step)


graph TD
    A[Owner Creates Room] --> B[Tenant Assigned]
    B --> C[Tenant Pays Rent]
    C --> D[70% to Owner | 30% Saved]
    D --> E[Owner Withdraws Savings]
    E --> F[History Updated for Both]


# 🏠 Property Vault

## Owner Flow
**Connect wallet → Owner Dashboard**  
Enter:
- Tenant address: `0x3C44...3BC`
- Room label: `Apartment 5A`

Click **"Create & Assign Room"**  
View all rooms + savings  
Withdraw savings anytime

---

## Tenant Flow
**Connect wallet → Tenant Dashboard**  
See:
- Room: `Apartment 5A`
- Rent: `100 USDC/month`
- Savings: `30 USDC (30%)`

Click **"Approve USDC" → "Pay Rent"**  
View payment history

---

## 🧠 Smart Contract (Solidity)
```solidity
// PropertyVault.sol
struct Property {
    address tenant;
    string roomLabel;
    uint256 rentAmount;
    uint256 savingsPercent;
    uint256 totalSaved;
    uint256 savingsGoal;
}

event RentPaid(address tenant, uint256 propertyId, uint256 amount, uint256 savedForOwner);
event SavingsWithdrawn(address owner, uint256 propertyId, uint256 amount);

function createProperty(
    address _tenant,
    string memory _roomLabel,
    uint256 _rentAmount,
    uint256 _savingsPercent,
    uint256 _savingsGoal
) external onlyOwner { ... }

function payRent(uint256 _propertyId) external {
    Property storage p = properties[_propertyId];
    require(msg.sender == p.tenant, "Not tenant");

    uint256 saved = (p.rentAmount * p.savingsPercent) / 100;
    p.totalSaved += saved;

    usdc.transferFrom(msg.sender, address(this), p.rentAmount);
    emit RentPaid(msg.sender, _propertyId, p.rentAmount, saved);
}

function withdrawSavings(uint256 _propertyId) external onlyOwner {
    Property storage p = properties[_propertyId];
    uint256 amount = p.totalSaved;
    p.totalSaved = 0;
    usdc.transfer(owner(), amount);
    emit SavingsWithdrawn(owner(), _propertyId, amount);
}
```

---

## 💻 Frontend (React + Ethers.js)

### Key Features
| Feature | Implementation |
|----------|----------------|
| Login Page | Wallet connect → auto-detect Owner/Tenant |
| Owner Dashboard | Create room, assign tenant, withdraw |
| Tenant Dashboard | Pay rent, view savings, history |
| Payment History | `queryFilter(RentPaid)` → real-time |
| Progress Bar | Visual savings goal tracker |
| Responsive UI | Full-screen, mobile-ready |

---

## ⚙️ Tech Stack
| Layer | Technology |
|--------|-------------|
| Blockchain | Hardhat, Solidity 0.8.20 |
| Network | Hardhat Local / Sepolia (ready) |
| Token | USDC (ERC-20) |
| Frontend | React, Vite, Ethers.js |
| UI | Custom CSS (Turquoise + Gray) |
| Wallet | MetaMask |

---

## 🚀 Setup & Run Locally

### Prerequisites
```bash
Node.js v18+
MetaMask
```

### Step 1: Clone & Install
```bash
git clone https://github.com/StewieC/DApp_PropertyVault.git
cd property-vault
npm install
cd frontend && npm install
```

### Step 2: Start Hardhat Node
```bash
npx hardhat node
```

### Step 3: Deploy Contract
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Step 4: Start Frontend
```bash
cd frontend
npm run dev
```

### Step 5: Connect Wallets
| Role | Address | Private Key |
|------|----------|-------------|
| Owner | 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 | 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 |
| Tenant | 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC | 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a |

---


## 🧭 Future Roadmap
| Feature | Status |
|----------|---------|
| Email/SMS reminders | Planned |
| Late fee automation | Planned |
| Multi-tenant support | Planned |
| NFT receipts | Planned |
| Sepolia → Mainnet | Planned |

---

## Vision Behind our project


> "This isn't just a hack — it's a product. A product to help making transactions and property management easier and managable"

---

## 👥 Team
- **Stewart Comfort** – Full-Stack Web3 Developer  
- **Lucky Omushieni** – Full-Stack Developer




