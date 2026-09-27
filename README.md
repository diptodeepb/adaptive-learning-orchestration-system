# ALOS: Adaptive Learning Orchestration System

An intelligent, multi-agent platform designed to orchestrate pedagogical interventions based on learner mastery and system uncertainty, utilizing the EDNet dataset.

This research project leverages a deterministic statistical agent alongside a dynamic LLM Gateway to negotiate learning strategies in real-time. It resolves pedagogical conflicts dynamically using a LangGraph state machine.

## 🚀 Technology Stack

- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) & [LangGraph](https://python.langchain.com/v0.1/docs/langgraph/) (Stateful multi-agent workflows).
- **LLM Gateway**: `litellm` powering seamless routing across Groq, Mistral, and OpenRouter for real-time pedagogical reasoning.
- **Frontend**: React (SPA), Vite, and [Tailwind CSS v3](https://tailwindcss.com/) featuring fully responsive mobile design, native dark mode, custom scrollbars, and sleek UI aesthetics.
- **Data Source**: EDNet student telemetry streamed directly and aggregated from HuggingFace (`hf://datasets/mgor/EDNet`).

## 🧠 System Architecture

The core orchestration loop runs on LangGraph and processes a `LearnerState` through a multi-agent pipeline:

1. **Knowledge Agent**: A deterministic agent that recommends actions (e.g., `LEARN`, `PRACTICE`, `CHALLENGE`) based on statistical mastery thresholds.
2. **Pedagogical Agent**: An LLM-powered reasoning engine that evaluates the student's telemetry to output a strict pedagogical JSON proposal.
3. **Orchestrator Gateway**: A state machine node that negotiates disagreements. It resolves conflicts using predefined heuristic parameters (such as confidence thresholds) configured dynamically in the UI.

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- **Python 3.10+**
- **Node.js (v18+) & npm**

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd adaptive-learning-orchestration
   ```

2. **Set up the Python Environment**:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install fastapi uvicorn langgraph pydantic litellm pandas pyarrow
   ```

3. **Install Frontend Dependencies**:
   ```bash
   cd apps/web
   npm install
   cd ../..
   ```

4. **Environment Variables**:
   Create a `.env` file in `apps/api/` (or run export commands) to set up your API keys for the LLM providers you intend to use:
   ```env
   GROQ_API_KEY=your_key
   MISTRAL_API_KEY=your_key
   OPENROUTER_API_KEY=your_key
   ```

## 💻 Running the Application

This project includes a built-in bootstrapper script (`start.py`) that handles booting and piping both the backend and frontend simultaneously.

Run the following command in the project root:
```bash
python3 start.py
```

This script will automatically:
- Stream **FastAPI Backend** logs.
- Stream **Vite Frontend** logs.
- Strip absolute paths from `.gitignore` for seamless `uvicorn` hot-reloading.

**Access the System:**
- **ALOS UI Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

## 🧩 Key Features

- **Real-Time Orchestration**: Watch the agents negotiate interventions live on the Diagnostics Dashboard.
- **EDNet Analytics**: Monitor global dataset subject mastery and track tracked metrics via a live radar mapping in the Analytics view.
- **Execution Details**: A fully paginated, live system log tracking all orchestrator state transitions and event messages.
- **Dynamic Configuration**: Adjust LLM routing, orchestrator confidence thresholds, and tracing memory on the fly in the Settings panel.

## 🧹 Stopping the System

To gracefully stop the FastAPI and Vite servers, press `Ctrl+C` in the terminal running `start.py`.
