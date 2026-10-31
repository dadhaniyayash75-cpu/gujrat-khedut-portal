# 🚜 Gujarat Khedut Portal (ગુજરાત ખેડૂત પોર્ટલ)
### Uber/Rapido Style Agricultural Service Platform • Dynamic Live Mandi Bhav • Private Admin Dashboard

A production-ready full-stack web platform built for Gujarat farmers, connecting farmers who need agricultural machinery (Tractors, Harvesters, Rotavators, Cultivators, Water Tankers) with nearby service providers in real-time, inspired by **Uber and Rapido**.

---

## 🌟 Key Features

### 1. 🚜 Uber/Rapido-Style Agricultural Service Booking
- **Multi-Step Lifecycle Stepper**:
  `Request Sent` $\rightarrow$ `Accepted` $\rightarrow$ `On The Way` $\rightarrow$ `Arrived at Farm` $\rightarrow$ `Service Started` $\rightarrow$ `Completed`.
- **Live Tracking Interface (`/track/:bookingId`)**:
  - Visual progress bar with animated active stages.
  - Interactive Leaflet OpenStreetMap showing Farm location (red pin) and Provider location (blue tractor pin) with distance (KM) and ETA.
  - One-tap Direct Call and WhatsApp buttons with pre-filled details.
  - Cancellation handling when pending or accepted.
- **Ratings & Reviews**:
  - 1-to-5 star rating and comment submission upon job completion.
  - Provider aggregate rating recalculated and displayed across search cards and profiles.

### 2. 🌾 Dynamic Live APMC Mandi Bhav (`/api/mandi/live`)
- Real-time market rates for major Gujarat APMC yards: Rajkot, Gondal, Unjha, Amreli, Junagadh, Surat, Mahuva, Deesa, Halvad, and more.
- Covers Groundnut, Cotton, Cumin (જીરું), Fennel (વરિયાળી), Wheat, Castor, Onion, Chilli, and Sesame per 20 kg (Mann / મણ).
- Dynamic date timestamp, live daily price trend indicators ($+$, $-$), arrival volumes, and 1-click **🔄 તાજા ભાવ (Refresh)** button.

### 3. 👑 Private Admin Dashboard & Database Management
- **Role-Based Access Control (RBAC)**: All administrative endpoints and database views are strictly restricted to the website owner and company members.
- **Admin Option in Login & Register**:
  - Dedicated **"🛡️ Admin / Company Member"** choice in both Login and Register.
  - Authenticates with the authorized master password **`"yash"`**.
- **Database Viewer Privacy**:
  - The Database Viewer button is **completely removed** for general website visitors, farmers, and providers.
  - Visible **ONLY** to logged-in Admin accounts in the Navbar.
- **Admin Control Center (`/admin/dashboard`)**:
  - 📊 **Platform Overview**: Live stats on users, active providers, farmers, bookings, and SMS dispatches.
  - 👥 **User Database**: Search, filter by role, block/unblock accounts, and permanent deletion.
  - 🚜 **All Bookings**: Complete platform booking history with status filters.
  - 📱 **SMS Audit Logs**: View every outgoing SMS notification, recipient, status, and message body.
  - 🌾 **Live Mandi Manager**: Add or adjust custom market quotes.

### 4. ⚡ Real-Time Socket.IO Updates
- Instant push notifications and live UI updates without refreshing the page.
- User-specific private rooms (`user_<userId>`) for providers and farmers.
- Floating toast alerts and audio cues on incoming requests and status transitions.

### 5. 📱 Modular SMS Notification Gateway
- Built-in support for **Twilio**, **MSG91 (India DLT)**, **2Factor**, and **Simulator Mode**.
- Default Simulator Mode: logs formatted SMS dispatches to console and records audit logs in MongoDB `SmsLog` collection.
- Automated triggers:
  - Provider alerted on new booking request.
  - Farmer alerted when provider accepts, is on the way, arrives, and completes the service.

---

## 🚀 How to Run Locally

### 1. Start MongoDB
Ensure MongoDB is running locally on port 27017:
```bash
net start MongoDB
```

### 2. Start Backend (Node.js & Socket.IO)
```bash
cd server
npm install
npm run dev
```
Backend runs at `http://localhost:5000`.

### 3. Start Frontend (React + Vite)
```bash
cd client
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## 🌐 How to Upload to Vercel (Production Deployment)

### Step 1: Free Cloud MongoDB (MongoDB Atlas)
1. Create a free cluster on [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas).
2. Allow access from anywhere (`0.0.0.0/0`).
3. Copy your connection URI:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/gujarat_khedut_portal?retryWrites=true&w=majority
   ```

### Step 2: Deploy Backend to Render.com (100% Free)
*(Render natively supports persistent Socket.IO connections)*
1. Push this project to GitHub.
2. In [render.com](https://render.com), click **New +** $\rightarrow$ **Web Service** and select your repo.
3. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add Environment Variables:
   - `MONGODB_URI`: *Your MongoDB Atlas connection URI*
   - `JWT_SECRET`: *Your JWT secret*
   - `ADMIN_PASSWORD`: `yash`
   - `PORT`: `5000`
5. Copy your live backend URL (e.g., `https://khedut-portal-api.onrender.com`).

### Step 3: Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com) and click **"Add New..."** $\rightarrow$ **"Project"**.
2. Import your GitHub repository.
3. In **Project Settings**:
   - **Root Directory**: Select **`client`** folder.
4. In **Environment Variables**, add:
   - `VITE_API_URL` = `https://khedut-portal-api.onrender.com/api`
5. Click **"Deploy"**!
*(Client routing is already configured in `client/vercel.json` to prevent 404 errors on refresh)*.

---

## 🧪 Automated Testing
Run the backend test suite:
```bash
cd server
node test_suite.js
```
Runs 24 automated assertions covering Mandi live rates, Admin master passcode "yash", RBAC security, geospatial search, and the Uber booking lifecycle.
