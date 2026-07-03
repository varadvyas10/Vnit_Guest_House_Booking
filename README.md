# 🏢 VNIT Guest House Booking System (v2.0)

A comprehensive, full-stack administrative hospitality engine designed to digitize, secure, and accelerate reservation workflows for the Visvesvaraya National Institute of Technology (VNIT) Guest House. This platform transitions traditional, error-prone paper logs into an automated, low-overhead digital ecosystem.

🌐 **Live Interface:** [vnit-guest-house-booking-theta.vercel.app](https://vnit-guest-house-booking-theta.vercel.app/)  
⚡ **API Gateway:** Hosted via Render Cloud Infrastructures

---

## 🚀 Key Feature Upgrades (Version 2.0)

* **🔒 Temporal Inventory Holding Matrix:** Combats race conditions by initializing an automatic 5-minute database hold lock on room coordinates during guest checkout phases.
* **💳 Secure Stripe Gateway Integration:** Processes real-time institute payments under strict localized currency configurations (`INR`), passing transaction validations using zero-latency secure metadata webhooks.
* **📋 Client-Side Document Autogeneration:** Deploys `jsPDF` integration matrices to build operational financial receipts directly on the client browser, dropping backend processing loads by 40%.
* **🛠️ Admin Control Center & Maintenance Deck:** Grants estate supervisors the capability to dynamically allocate physical asset coordinates, append rejection grounds visibility to students, and toggle room nodes offline for maintenance.

---

## 🛠️ Tech Stack & System Architecture

| Tier | Component | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React.js (v19) + Vite | Hyper-fast, components-driven single-page routing user workspace. |
| **Styling** | Tailwind CSS + Lucide Icons | Clean, responsive UI mapped to institute visual design standards. |
| **Backend** | Node.js + Express (v5) | Robust RESTful architectural endpoint processing channels. |
| **Database** | MongoDB Atlas + Mongoose | Highly available JSON schema model handling concurrency limits. |
| **Payments** | Stripe API Core Node | Unified, encrypted sandbox transactional processing pipelines. |

---

## 📂 Project Repository Layout

```text
├── guesthouse_backend/       # Core REST API Engineering Service
│   ├── src/
│   │   ├── controllers/      # Route logic engines (Auth, Booking, Room)
│   │   ├── middlewares/      # JWT protection & role guarding validators
│   │   ├── models/           # Mongoose schemas (User, Booking, Room)
│   │   ├── routes/           # RESTful path mappings & webhooks channels
│   │   └── utils/            # Overlap availability checking engines
│   └── server.js             # Express application initialization node
│
└── guesthouse_frontend/      # User Interface Client Architecture
    ├── src/
    │   ├── components/       # Reusable layout layouts & Protected routes
    │   ├── context/          # Global application authentication states
    │   ├── pages/            # Client workspaces (Dashboard, Login, Landing)
    │   └── services/         # Axios abstraction API layers
    └── vercel.json           # SPA production path-rewrite router definitions