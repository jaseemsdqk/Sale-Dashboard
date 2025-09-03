# Sales Dashboard - Odoo Module

A modern, interactive sales dashboard for Odoo with drag-and-drop functionality, offline support, and real-time analytics.

![Dashboard Preview](https://img.shields.io/badge/Odoo-16.0%2B-blue)
![License](https://img.shields.io/badge/License-LGPL--3.0-green)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)

## 🚀 Features

### 📊 Interactive Charts
- **Revenue vs COGS Chart** - Bar chart comparing revenue and costs by product category
- **Sales Trend Chart** - Line chart showing daily sales trends over the last 7 days
- **Product Price Chart** - Line chart displaying list prices of products (excluding services)

### 🎛️ Dashboard Capabilities
- **Drag & Drop Interface** - Easily add/remove charts from sidebar
- **Real-time KPI Cards** - Total sales, revenue, daily orders, and average order value
- **Edit Mode** - Toggle between view and edit modes
- **Responsive Design** - Works on desktop, tablet, and mobile devices

### 💾 Offline Support
- **IndexedDB Integration** - Persistent data storage for offline access
- **Smart Caching** - Automatic fallback to cached data when offline
- **State Persistence** - Dashboard layout and chart visibility saved across sessions

### 🎨 Modern UI/UX
- **Clean Interface** - Bootstrap-based responsive design
- **Smooth Animations** - Hover effects and transitions
- **Loading States** - Visual feedback during data loading
- **Error Handling** - Graceful error messages and fallback mechanisms

---

## 📸 Screenshots

### 1) Dashboard Sales Order List View
Here we can see the sales dashboard with the order list.  
Click **"Edit Dashboard"** to customize.

![Screenshot 1](/sale_dashboard/static/src/img/1.png)

---

### 2) Drag & Drop Interface
When edit mode is enabled, you can drag and drop chart components.  
Currently, two charts are available:
- **Revenue vs COGS Chart**
- **Sales Trend Chart**

![Screenshot 2](/sale_dashboard/static/src/img/2.png)

---

### 3) Revenue vs COGS Chart
Example of a bar chart comparing revenue and cost by product category.

![Screenshot 3](/sale_dashboard/static/src/img/3.png)

---

## 📋 Prerequisites

- Odoo 16.0 or higher  
- Chart.js library (included)  
- Modern web browser with IndexedDB support  

---

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repo_url> odoo/addons/sale_dashboard
