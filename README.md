# AI-Based Adaptive Learning Orchestration System

An intelligent, multi-agent platform designed to orchestrate adaptive learning interventions based on learner mastery and system uncertainty. 

This research project leverages a deterministic statistical agent alongside a local Large Language Model (LLM) to negotiate pedagogical strategies in real-time, resolving conflicts dynamically to ensure the most effective student interventions.

## 🚀 Tech Stack

- **Backend Architecture**: [FastAPI](https://fastapi.tiangolo.com/) & [LangGraph](https://python.langchain.com/v0.1/docs/langgraph/) (Stateful multi-agent workflows)
- **Local LLM Integration**: [Ollama](https://ollama.com/) running **Qwen3-4B** via `langchain-ollama` for free, private, low-latency inference.
- **Frontend Dashboard**: React (SPA), Vite, and [Tailwind CSS v3](https://tailwindcss.com/) featuring premium glassmorphism, native dark mode, and cutting-edge View Transitions.
- **Database & Auth**: Local Dockerized [Supabase](https://supabase.com/) stack.

## 🧠 System Architecture

The core orchestration loop runs on LangGraph and processes a `LearnerState` (mastery and uncertainty) through a multi-agent pipeline:

1. **Knowledge Agent**: A deterministic agent that recommends actions (`LEARN`, `PRACTICE`, `CHALLENGE`) based on strict mastery thresholds.
2. **Pedagogical Agent**: An LLM-powered agent that reasons over the state—particularly focusing on system uncertainty—and outputs strict Pydantic JSON proposals.
3. **Deterministic Validator**: A gatekeeper that resolves disagreements. If the agents conflict and uncertainty is dangerously high (> 0.6), the Validator overrides the decision to trigger a diagnostic `ASSESS` intervention.

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your Linux environment:
- **Python 3.10+** (Tested on Python 3.14.7)
- **Node.js (npm & npx)**
- **Docker Engine** (Required for the local Supabase stack)
- **Ollama** (Running locally)

## 📦 Installation & Setup

1. **Clone the repository and enter the directory**:
   ```bash
   cd adaptive-learning-orchestration
   ```

2. **Set up the Python Virtual Environment**:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install fastapi uvicorn langgraph pydantic langchain-ollama
   ```

3. **Install Frontend Dependencies**:
   ```bash
   cd apps/web
   npm install
   cd ../..
   ```

4. **Pull the Local LLM**:
   Make sure the Ollama service is running, then download the Qwen model:
   ```bash
   ollama pull qwen3:4b
   ```

## 💻 Running the Application

This project includes a built-in bootstrapper script (`start.py`) that manages the backend and frontend simultaneously.

**1. Start the Database Layer (Supabase)**
Open a terminal and spin up your ephemeral, local database stack:
```bash
sudo systemctl start docker   # Ensure Docker is running
npx supabase start
```
*(This gives you a full Postgres DB + Auth + Studio UI at `http://localhost:54323`)*

**2. Start the Application Layer**
Open a new terminal in the project root and run:
```bash
python3 start.py
```
This script will automatically:
- Ensure Ollama is running in the background.
- Stream **FastAPI Backend** logs in `[backend]` Blue.
- Stream **Vite Frontend** logs in `[frontend]` Yellow.

**3. Access the Dashboard**
- Open **[http://localhost:5173](http://localhost:5173)** in your browser to view the interactive Student Dashboard.
- The backend API docs are available at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

## 🧹 Cleaning Up

To gracefully stop the FastAPI and Vite servers, press `Ctrl+C` in the terminal running `start.py`.

To stop the Supabase database and completely wipe the local volumes to start fresh next time:
```bash
npx supabase stop --no-backup
```
