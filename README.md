# Vox Platform

> **A high-performance, real-time communication platform built for privacy and speed.**

Vox is a full-stack chat application inspired by Discord, engineered with a focus on distributed architecture, end-to-end encryption, and seamless user experience. It features hierarchical server structures, instant messaging via WebSockets, and a robust friend management system.

## 🚀 Key Features

### Core Communication
*   **Real-time Messaging:** Instant message delivery using **Spring WebSockets** (STOMP) and **SockJS**.
*   **Spaces (Servers):** Create and manage communities with hierarchical text channels.
*   **Direct Messages (E2E):** Private 1-on-1 messaging secured with **AES Encryption** (Client-side).
*   **File Sharing:** Integrated file upload and media rendering.

### Social & User Experience
*   **Friend System:** Bidirectional friend requests, blocking, and "Favorites" pinning.
*   **Notifications:** Global unread indicators for Servers, Channels, and DMs.
*   **Rich UI:** Custom Context Menus (Right-click interactions) and Modal-based settings.
*   **Theming:** Native support for Dark, Light, and Anthracite themes.

### Security & Architecture
*   **Role-Based Access:** Secure backend endpoints using **Spring Security**.
*   **Optimized Data:** Custom JPA queries for efficient relationship fetching.
*   **Containerized:** Fully dockerized PostgreSQL database and environment.

---

## 🛠️ Tech Stack

### Backend (The Core)
*   **Language:** Java 21
*   **Framework:** Spring Boot 3.3.5
*   **Security:** Spring Security
*   **Real-time:** Spring WebSocket (STOMP)
*   **Build Tool:** Gradle

### Frontend (The Interface)
*   **Framework:** React 18 (Vite)
*   **Language:** TypeScript
*   **State Management:** Zustand
*   **Styling:** Custom CSS Variables (Theme Engine)
*   **Icons:** Lucide React
*   **Encryption:** Crypto-JS

### Infrastructure
*   **Database:** PostgreSQL 16
*   **DevOps:** Docker & Docker Compose

---
