# Millow - Modern Tech Stack Edition 🏠⚡

A complete rebuild of [Dapp University's Millow](https://github.com/dappuniversity/millow/) using the latest blockchain development tools and frameworks.

> **Note:** This is a fork/reimplementation of the original Millow project, updated with modern technologies and best practices.

## 🔄 What's Different from the Original?

This version modernizes the original Millow concept with:

| Feature | Original Millow | This Version |
|---------|----------------|--------------|
| Smart Contracts | Hardhat (older) | **Latest Hardhat** |
| Frontend | React | **Next.js with TypeScript** |
| Styling | CSS | **Tailwind CSS** |
| Type Safety | JavaScript | **TypeScript** |
| Package Management | npm | **npm with latest dependencies** |

## 🙏 Credits & Attribution

**Original Project:** [Millow by Dapp University](https://github.com/dappuniversity/millow/)  
**Original Author:** [@dappuniversity](https://github.com/dappuniversity)  
**Original Tutorial:** [Dapp University YouTube Channel](https://www.dappuniversity.com/)

This project is a learning exercise that reimplements the original concept with modern tooling. All credit for the core idea goes to Dapp University.

⭐ **Please star the [original repository](https://github.com/dappuniversity/millow/) if you find this useful!**

## 🚀 Getting Started

### Prerequisites

- Node.js v16+ and npm
- MetaMask browser extension
- Git

### Installation

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/BlockChain-Kumar/Millow.git
cd Millow
```

#### 2️⃣ Install Backend Dependencies

```bash
cd backend
npm install
```

#### 3️⃣ Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Running the Project

#### 4️⃣ Run Smart Contract Tests

```bash
cd backend
npx hardhat test
```

#### 5️⃣ Start Local Blockchain

```bash
npx hardhat node
```

Keep this terminal running!

#### 6️⃣ Deploy Smart Contracts

In a **new terminal**:

```bash
cd backend
npx hardhat run scripts/deploy.ts --network localhost
```

Copy the deployed contract addresses to `frontend/constants/` files.

#### 7️⃣ Start Frontend

In a **new terminal**:

```bash
cd frontend
npm run dev
```

#### 8️⃣ Configure MetaMask

1. Open MetaMask
2. Connect to `localhost:8545`
3. Import a test account using private keys from Hardhat node output
4. Visit `http://localhost:3000`

## 📁 Project Structure

```
Millow/
├── backend/          # Smart contracts (Hardhat)
│   ├── contracts/    # Solidity contracts
│   ├── scripts/      # Deployment scripts
│   ├── test/         # Contract tests
│   └── hardhat.config.ts
│
├── frontend/         # Next.js frontend
│   ├── app/          # Next.js pages
│   ├── components/   # React components
│   ├── constants/    # Contract ABIs & addresses
│   └── public/       # Static assets
│
└── README.md
```

## 🛠️ Built With

### Backend
- **Hardhat** - Ethereum development environment
- **Solidity** - Smart contract language
- **Ethers.js** - Ethereum library
- **Chai** - Testing framework

### Frontend
- **Next.js** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Ethers.js** - Blockchain interaction
- **MetaMask** - Wallet integration

## 🎯 Features

- ✅ Real estate NFT minting
- ✅ Property listing marketplace
- ✅ Escrow smart contract
- ✅ Inspector approval workflow
- ✅ Lender approval workflow
- ✅ Seller/Buyer transaction handling
- ✅ Modern responsive UI

## 🧪 Testing

Run the complete test suite:

```bash
cd backend
npx hardhat test
```

For test coverage:

```bash
npx hardhat coverage
```

## 🔐 Security

⚠️ **This is a learning project. Do NOT use in production without proper security audits.**

- Smart contracts have not been professionally audited
- Use only on test networks
- Never commit private keys or sensitive data

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

**Original Millow project** by Dapp University is also open source.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Contact

**Project Maintainer:** [@BlockChain-Kumar](https://github.com/BlockChain-Kumar)  
**Original Creator:** [@dappuniversity](https://github.com/dappuniversity)

## 🌟 Acknowledgments

- Huge thanks to [Dapp University](https://www.dappuniversity.com/) for the original tutorial and concept
- The Ethereum and Hardhat communities
- All contributors to the original Millow project

---

**⭐ If you found this helpful:**
- Star this repository
- Star the [original Millow repository](https://github.com/dappuniversity/millow/)
- Follow [@dappuniversity](https://github.com/dappuniversity) for more blockchain tutorials
- Share with others learning blockchain development!

**Built with ❤️ for the blockchain community**
