#  Decentralized Hostel Management & Savings App

**hostelNest** is a Web3 platform built to simplify hostel life — connecting students and hostel owners in a transparent, blockchain-powered ecosystem.  
It allows **students (tenants)** to find and join hostels, manage their rent, and grow savings — while **owners** can easily assign rooms, monitor payments, and withdraw funds, all without middlemen.

---

## About Our Project

This project was developed to showcase how **real-world property management** can merge with **on-chain transparency and automation**.  
We designed it to **empower students and small hostel owners** through smart contracts, tokenized payments, and an intuitive decentralized app (dApp) interface.

---

## Inspiration

University students constantly struggle with unreliable hostel managers, delayed payments, and lack of financial transparency.  
At the same time, hostel owners face difficulties in tracking rent and savings.  
**hostelNest** bridges this gap using blockchain — offering a trusted system where both sides can view, verify, and transact securely.

---

## Core Idea

We aimed to:
- **Remove manual hostel record-keeping**
- **Guarantee rent transparency** using smart contracts
- **Introduce savings automation** for owners
- **Give hostel owners instant insights** into occupancy and funds
- **Demonstrate blockchain’s practicality** in real-world property use cases

---

## Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React Javascript |
| **Blockchain** | Solidity (Smart Contracts) |
| **Framework** | Hardhat / Ethers.js |
| **Wallet Integration** | MetaMask |
| **Storage** | JSON + On-chain mappings |
| **Hosting** | IPFS / Web3-compatible deployment |

---

## Smart Contract Overview

Our main contract manages:
- Room registration by hostel owners  
- Tenant assignment and savings deposits  
- Owner withdrawal functionality  
- Tenant-room relationship tracking  

Each action updates state variables transparently on-chain.

---

### Core Functions

#### `createRoom(string memory _roomLabel)`
Owner registers a new hostel room.

#### `assignRoom(address _tenant, string memory _roomLabel)`
Owner assigns an existing room to a tenant.

#### `depositSavings(uint256 _amount)`
Tenant pays rent using wallet.

#### `withdrawSavings()`
Owner withdraws accumulated rent + savings contributions.

#### `getTenantRoom(address _tenant)`
Returns the room details of a specific tenant.

---

## User Flow

### Owner Flow
1. Connect wallet → Owner Dashboard  
2. Enter:
   - Tenant address: e.g. `0x3C44...3BC`  
   - Room label: e.g. `Apartment 5A`
3. Click **"Create & Assign Room"**
4. View all rooms and savings
5. Withdraw accumulated savings anytime

### Tenant Flow
1. Connect wallet → Tenant Dashboard  
2. View:
   - Room: Apartment 5A  
   - Rent: 100 USDC/month  
   - Savings: 30 USDC (30%)
3. Deposit or view transaction history  
4. Track growth transparently

---

## Impact

- **Transparency:** Eliminates fraud in hostel rent handling.  
- **Financial Literacy:** Encourages students to save responsibly.  
- **Accessibility:** Built for developing regions where trust is key.  
- **Scalability:** Can be extended to rental apartments or co-living spaces.

---

## Key Features

✅ Decentralized rent & savings management  
✅ Owner and tenant dashboards  
✅ Transparent room allocation  
✅ Instant wallet-based interactions  
✅ Future integration: stablecoin payments (USDC) and NFT-based room tokens  

---

## Highlights

- Developed end-to-end in under 72 hours  
- Smart contracts tested locally on Hardhat  
- Seamless wallet connection and real-time feedback  
- Clear separation of owner/tenant roles  
- Minimal and accessible UI design  

---

## Key notes taken during building

- Designing a **clear smart contract architecture** helps avoid logic conflicts  
- User experience in dApps must be as smooth as Web2 apps  
- Combining **financial inclusion + decentralization** can have massive real-world effects

---

## Future planned Improvements and additional features

- Add **stablecoin (USDC/DAI) integration** for real rent payments  
- Enable **multi-owner hostels**  
- Expand **analytics dashboard** for occupancy trends  
- Use **IPFS for room metadata and proof of occupancy**  
- Deploy on **Polygon or Base** for low-cost transactions  

---

## Conclusion

Our project is more than a hackathon project — it’s a proof-of-concept showing that decentralized property management can be practical, user-friendly, and financially empowering.  

By leveraging blockchain’s transparency, we can make **student housing more accountable and efficient**.

---

## Team

**Developer:** Stewart Comfort Makokha  
**Role:** Smart Contract Engineer & Frontend Developer  
**Location:** Nyeri, Kenya  
**Status:** Final Year Mechanical Engineering Student / Web3 & Software Developer  

**Developer:** Lucky Omushieni  
**Role:** Frontend Developer  

---


