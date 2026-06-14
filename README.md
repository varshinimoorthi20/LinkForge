# LinkForge - Smart URL Shortener & Analytics Platform

## Demo Video

🎥 **Demo Video:** https://youtu.be/LF7psdoU3YY

## Overview

LinkForge is a modern URL shortening and analytics platform built using the MERN Stack. It enables users to shorten long URLs, create custom aliases, generate QR codes, track analytics, manage links, and monitor URL performance through an intuitive dashboard.

The application provides secure authentication, detailed analytics, URL management capabilities, bulk URL shortening through CSV uploads, and a modern responsive user interface designed for an enhanced user experience.

# Planning the App

## Goal

The goal of LinkForge is to provide a secure and scalable URL shortening service where authenticated users can:

* Create shortened URLs from long URLs.
* Customize short URLs using aliases.
* Manage all their URLs through a dashboard.
* Track analytics such as clicks, recent visits, browser, device, and country information.
* Generate QR codes for sharing.
* Bulk create shortened URLs through CSV uploads.

## Application Workflow

1. User registers or logs into the application.
2. User creates a shortened URL or uploads URLs using CSV.
3. Backend validates the URL and generates a unique short code or custom alias.
4. URL data is stored in MongoDB Atlas.
5. Users share the shortened URLs.
6. Visitors access the shortened URLs.
7. The backend:

   * Records analytics data.
   * Increments click count.
   * Stores browser, device, and country information.
   * Redirects users to the original URL.
8. Analytics and performance insights are displayed on the dashboard.

# Features

## Authentication

* User Registration
* User Login
* JWT Authentication
* Password Hashing using bcryptjs
* Protected Routes
* User-Specific URL Management

## URL Management

* Create Short URLs
* Custom Alias Support
* URL Validation
* Edit Destination URL
* Delete URLs
* Redirect to Original URLs
* Copy URL Functionality
* URL Expiry Support

## Analytics

* Click Tracking
* Total Click Count
* Last Visited Time
* Recent Visit History
* Browser Analytics
* Device Analytics
* Country Analytics
* QR Click Tracking
* Performance Score System
* Activity Feed

## Additional Features

* QR Code Generation
* QR Code Download
* Bulk URL Shortening via CSV Upload
* URL Search Functionality
* Achievement & Gamification System
* Responsive Design
* Modern Dashboard UI

# Tech Stack

## Frontend

* React.js
* React Router DOM
* Axios
* Vite
* CSS3

## Backend

* Node.js
* Express.js

## Database

* MongoDB Atlas
* Mongoose

## Authentication

* JWT (JSON Web Tokens)
* bcryptjs


# System Architecture

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/5a91d274-462f-4d31-b20a-ef6ae9adbc6d" />


The application follows a **MERN Stack Architecture**.

### React Frontend (Client-Side SPA)

The frontend provides an interactive user interface where users can:

* Login / Register
* Manage URLs
* Create Short URLs
* Edit URLs
* Delete URLs
* Search URLs
* View Analytics Dashboard
* Generate QR Codes
* Upload CSV Files
* Track Performance Metrics
* View Achievements


### Express.js Backend (Node.js Server)

The backend handles all business logic and API requests.

Core services include:

* JWT Authentication
* User Management
* URL Shortening Service
* Custom Alias Management
* URL Redirection Service
* Analytics Processing
* QR Code Generation
* CSV Upload Processing
* Achievement Tracking
* Performance Score Calculation


### MongoDB Atlas Database

The database stores:

* Users Collection
* URLs Collection
* Analytics Collection
* Visits Collection
* Achievements Collection


### Analytics Engine

The analytics module records:

* Total Clicks
* Recent Visits
* Browser Information
* Device Information
* Country Information
* QR Code Clicks
* URL Performance Statistics



## Architecture Flow

```text
┌───────────────┐
│ React Frontend│
│  (Vite SPA)   │
└──────┬────────┘
       │ REST APIs
       ▼
┌───────────────┐
│ Express Server│
│ Authentication│
│ URL Services  │
│ Analytics     │
└──────┬────────┘
       │
       ▼
┌───────────────┐
│ MongoDB Atlas │
│ Users         │
│ URLs          │
│ Analytics     │
│ Visits        │
│ Achievements  │
└───────────────┘
```


# Screenshots

## Login Page

<img width="1917" height="1020" alt="image" src="https://github.com/user-attachments/assets/4724fe10-c2ed-493a-97d0-d3b3ea795639" />


Secure authentication interface with modern UI design.


## Register Page

<img width="1917" height="1087" alt="image" src="https://github.com/user-attachments/assets/db3516d6-9c67-4119-a8c3-b8ee7bb69c38" />


User registration page with validation and responsive layout.


## Dashboard

<img width="1625" height="1037" alt="image" src="https://github.com/user-attachments/assets/91b86319-1c91-4d47-bfd0-a0cc7b7da3d4" />
<img width="1917" height="1020" alt="image" src="https://github.com/user-attachments/assets/cc6069d2-dd3f-4b5e-85d2-c50801681d6f" />



Manage URLs, create aliases, upload CSV files, monitor statistics, and access analytics.


## Analytics Page

<img width="1917" height="1022" alt="image" src="https://github.com/user-attachments/assets/ba66dc02-6141-4ae2-9f3c-8aedef58d70b" />
<img width="1647" height="1001" alt="image" src="https://github.com/user-attachments/assets/e51b41ed-edbc-46a9-af2b-7fe7fc24ad70" />



Track clicks, recent visits, browser analytics, device analytics, country analytics, and performance insights.


## QR Code Feature

<img width="877" height="877" alt="image" src="https://github.com/user-attachments/assets/03083f73-1a0c-4d2c-9ed8-d5b4b39436e0" />


Generate and download QR codes for shortened URLs.


## Bulk CSV Upload

<img width="1182" height="362" alt="image" src="https://github.com/user-attachments/assets/a1b902f0-2bc9-493b-9c48-2c619f832ceb" />


Upload multiple URLs and generate shortened links automatically.


# Project Structure

```text
LinkForge/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── components/
│   │   └── assets/
│   └── package.json
│
├── screenshots/
│   ├── architecture.png
│   ├── login.png
│   ├── register.png
│   ├── dashboard.png
│   ├── analytics.png
│   ├── qr.png
│   └── csv.png
│
└── README.md

# Installation

## Clone Repository

```bash
git clone https://github.com/varshinimoorthi20/LinkForge.git

cd LinkForge
```

-# Backend Setup

```bash
cd backend

npm install

npm start
```

## Frontend Setup

```bash
cd frontend

npm install

npm run dev

# Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret_key
```

# API Endpoints

## Authentication

| Method | Endpoint             | Description   |
| ------ | -------------------- | ------------- |
| POST   | `/api/auth/register` | Register User |
| POST   | `/api/auth/login`    | Login User    |


## URL Management

| Method | Endpoint          | Description      |
| ------ | ----------------- | ---------------- |
| POST   | `/api/url/create` | Create Short URL |
| GET    | `/api/url/myurls` | Get User URLs    |
| PUT    | `/api/url/:id`    | Edit URL         |
| DELETE | `/api/url/:id`    | Delete URL       |


## Analytics

| Method | Endpoint                     | Description       |
| ------ | ---------------------------- | ----------------- |
| GET    | `/api/analytics/:id`         | Get URL Analytics |
| GET    | `/api/analytics/browser/:id` | Browser Analytics |
| GET    | `/api/analytics/device/:id`  | Device Analytics  |


## QR Code

| Method | Endpoint      | Description      |
| ------ | ------------- | ---------------- |
| GET    | `/api/qr/:id` | Generate QR Code |



## CSV Upload

| Method | Endpoint          | Description       |
| ------ | ----------------- | ----------------- |
| POST   | `/api/upload/csv` | Bulk URL Creation |



## Redirect

| Method | Endpoint      | Description              |
| ------ | ------------- | ------------------------ |
| GET    | `/:shortCode` | Redirect to Original URL |


# Assumptions Made

* Users must be authenticated to create and manage URLs.
* Each custom alias must be unique.
* Analytics are recorded for every successful redirect.
* Users can only access and manage their own URLs.
* QR codes are generated dynamically using shortened URLs.
* Uploaded CSV files contain valid URLs.
* Expired URLs cannot be accessed after the expiry date.


# Sample Database Entries

## User Document

```json
{
  "_id": "123456",
  "name": "varshini",
  "email": "varshinimoorthi20@gmail.com"
}
```

## URL Document

```json
{
  "_id": "789012",
  "originalUrl": "https://github.com",
  "shortCode": "linkforge",
  "clickCount": 25
}
```


## Analytics Document

```json
{
  "_id": "987654",
  "urlId": "789012",
  "browser": "Chrome",
  "device": "Desktop",
  "country": "India",
  "timestamp": "2026-06-14T10:30:00Z"
}
```

# Sample Logs

```text
POST /api/auth/register      201 Created
POST /api/auth/login         200 OK
POST /api/url/create         201 Created
GET  /linkforge              302 Redirect
GET  /api/analytics/:id      200 OK
POST /api/upload/csv         201 Created
DELETE /api/url/:id          200 OK
```

# AI Planning Document

AI tools were used during the development process for:

* Feature brainstorming
* UI/UX design ideas
* Architecture planning
* Documentation assistance
* Analytics workflow design
* Code refactoring suggestions

However, all core functionalities including authentication, URL shortening logic, API development, database design, analytics integration, testing, debugging, and deployment were implemented and validated manually.


# Future Enhancements

* Custom Domains
* AI-Based Link Insights
* Real-Time Geolocation Analytics
* Team Collaboration Features
* Email Analytics Reports
* Export Analytics Data
* Advanced Performance Reports
* Mobile Application Support

# Deployment

## Frontend

https://link-forge-puce.vercel.app

# Demo Video

🎥 https://youtu.be/LF7psdoU3YY

# Author

**VARSHINI D**

B.Tech – Artificial Intelligence and Data Science

# Hackathon Submission

This project was developed as part of a hackathon challenge and demonstrates practical implementation of authentication, URL shortening, analytics processing, QR code generation, CSV handling, dashboard-based URL management, and performance monitoring.

**This project is a part of a hackathon run by https://katomaran.com**
