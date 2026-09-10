# BhoomiSetu System Architecture

## Overview
BhoomiSetu employs a decoupled client-server architecture separating the React frontend workspace from the Python FastAPI backend data engine.

## Access Control Model
The system enforces a **two-dimensional access control model**:
1. **Role (What you can do):** 11 specific user levels dictate actions.
2. **Jurisdiction (Where you can do it):** The server actively filters returned rows based on where the user sits in the geographic jurisdiction tree. Out-of-scope records return `404 Not Found`.

## Backend Architecture
* **Database:** Powered by SQLite with 16 distinct tables.
* **Endpoints:** 11 active endpoint groups.
* **Security:** Passwords are hashed utilizing `bcrypt` and scrubbed from responses.
* **Business Logic:** Compensation calculations (including 100% statutory solatium) are strictly server-side.

## Frontend Resilience
The React application contains localized mock-state fallbacks. Three core screens retrieve live API data. If the backend is unreachable, the system gracefully falls back to local demo state.
