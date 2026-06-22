# 🚗 AutoCRM Enterprise

A modern enterprise-grade Customer Relationship Management (CRM) platform designed for automobile dealerships to manage leads, customers, inventory, quotations, financing, service operations, support tickets, and business analytics from a single dashboard.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📌 Overview

AutoCRM is a full-stack dealership management platform built to streamline automotive sales and service workflows.

The platform provides:

* Lead Management
* Customer 360° Profiles
* Vehicle Inventory Management
* Test Drive Scheduling
* Quotation Generation
* Loan & Insurance Tracking
* Service Job Management
* Support Ticket System
* AI Assistant & Sales Insights
* Dashboard Analytics
* Audit Logging & Security

---

# ✨ Features

## 📊 Executive Dashboard

* Revenue KPIs
* Sales Funnel Metrics
* Vehicle Inventory Overview
* Monthly Trends
* Branch Performance
* Activity Widgets
* Real-time Notifications

---

## 🎯 Lead Management

* Kanban Pipeline
* Lead Scoring
* Lead Source Tracking
* Sales Representative Assignment
* Follow-up Management
* Conversion Tracking

Pipeline Stages:

* New Lead
* Contacted
* Qualified
* Negotiation
* Won
* Lost

---

## 👤 Customer 360°

Complete customer profile including:

* Personal Information
* Contact Details
* Purchase History
* Test Drives
* Quotations
* Loan Information
* Insurance Information
* Service History
* Support Tickets

---

## 🚘 Vehicle Inventory

Manage:

* Hatchbacks
* Sedans
* SUVs
* EVs

Features:

* Inventory Tracking
* Stock Monitoring
* Category Filters
* Vehicle Specifications
* Availability Status

---

## 🛣 Test Drive Management

* Schedule Test Drives
* Customer Assignment
* Sales Executive Assignment
* Feedback Collection
* Rating Management

---

## 💰 Quotations

Generate:

* Vehicle Price Breakdown
* Taxes
* Registration Charges
* Insurance Charges
* Accessories Cost
* Final On-Road Price

---

## 🏦 Finance Module

### Loan Management

* Loan Tracking
* Approval Status
* Bank Assignment
* Loan Amount Tracking

### EMI Calculator

* Real-time EMI Calculation
* Interest Rate Support
* Tenure Selection

### Insurance Management

* Policy Tracking
* Expiry Monitoring
* Renewal Management

---

## 🔧 Service Management

### Service Jobs

* Job Cards
* Service Status
* Assigned Technician
* Cost Tracking

### Spare Parts Inventory

* Parts Tracking
* Stock Levels
* Low Stock Alerts

---

## 🎫 Support Center

* Ticket Creation
* Priority Levels
* SLA Tracking
* Ticket Assignment
* Resolution Workflow

---

## 🤖 AI Assistant

AI-powered capabilities:

* Sales Forecasting
* Follow-up Suggestions
* Customer Insights
* CRM Query Assistance

---

## 📋 Audit Logs

Track:

* User Actions
* Record Updates
* Security Events
* System Activity

---

# 🏗 Architecture

## Frontend

* Next.js 15
* React
* TypeScript
* Tailwind CSS
* ShadCN UI

## Backend

* FastAPI
* SQLAlchemy
* Pydantic
* JWT Authentication

## Database

* PostgreSQL

---

# 🗄 Database Modules

* Users
* Roles
* Customers
* Leads
* Vehicles
* Quotations
* Test Drives
* Loans
* Insurance
* Service Jobs
* Spare Parts
* Tickets
* Notifications
* Audit Logs

---

# 🔐 Authentication

Features:

* JWT Access Tokens
* Refresh Tokens
* Role-Based Access Control
* Secure Password Hashing

Roles:

* Admin
* Sales Manager
* Sales Executive
* Service Manager
* Service Advisor

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/HarshalM143/AutoCRM.git
cd AutoCRM
```

## Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

Create `.env`

```env
DATABASE_URL=postgresql+psycopg2://postgres:password@localhost:5432/autocrm

SECRET_KEY=your-secret-key

ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Initialize Database

```bash
python app/db/init_db.py
python app/db/seed.py
```

Run Backend

```bash
python -m uvicorn app.main:app --reload --port 8000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:8000
```

Swagger Docs:

```text
http://localhost:8000/docs
```

---

# 🧪 Demo Credentials

```text
Email: admin@autocrm.in
Password: Demo@123
```

---

# 📈 Future Enhancements

* WhatsApp Integration
* Email Automation
* Razorpay Payments
* Document Uploads
* AI Lead Scoring
* Mobile Application
* Real-time Notifications
* Multi-Branch Analytics

---

# 👨‍💻 Developer

Harshal Mahajan

BSc IT | Software Developer

Tech Stack:

* Python
* FastAPI
* PostgreSQL
* Next.js
* TypeScript
* Tailwind CSS

GitHub:
https://github.com/HarshalM143

LinkedIn:
https://www.linkedin.com/in/harshalmahajan001

---

# ⭐ Support

If you found this project useful:

⭐ Star the repository

🍴 Fork the project

🚀 Contribute improvements

---

MIT License © 2026 Harshal Mahajan
