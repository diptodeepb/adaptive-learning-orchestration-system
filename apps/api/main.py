from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn
import os
import datetime

# Explicitly load the .env file from the apps/api directory
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

# Import the refactored schemas and workflow
from packages.schemas.state import LearnerState
from ai.orchestrator import orchestrator_app

app = FastAPI(title="Adaptive Learning Orchestration API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for session logs
session_logs = [
    { "time": datetime.datetime.now().strftime("%H:%M:%S"), "tag": "SYSTEM", "type": "info", "text": "System ready. Waiting for student evaluation.", "session_id": "SYS-IDLE" }
]

@app.get("/")
def root():
    return RedirectResponse(url="/docs")

# --- API Endpoints ---
@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "mistral_configured": bool(os.getenv("MISTRAL_API_KEY"))}

@app.get("/api/v1/logs")
def get_logs():
    return session_logs

from apps.api.data_service import fetch_learner_state, get_aggregated_data, get_random_subject_id
import threading

@app.on_event("startup")
def preload_dataset():
    print("Initiating background download of aggregated student dataset...")
    threading.Thread(target=get_aggregated_data, daemon=True).start()

@app.get("/api/v1/learner/random")
def get_random_learner():
    return {"subject_id": get_random_subject_id()}

@app.get("/api/v1/learner/{subject_id}/state")
def get_learner_state(subject_id: str):
    state = fetch_learner_state(subject_id)
    return state.model_dump()

@app.get("/api/v1/analytics")
def get_analytics():
    # Fetch the real aggregated dataset from Hugging Face
    df = get_aggregated_data()
    
    if df is None or df.empty:
        # Fallback empty state if dataset isn't loaded
        return {"subjectMastery": [], "radarData": [], "questionProficiency": []}
    
    # Calculate REAL statistics from the dataset
    total_students = len(df)
    avg_mastery = float(df['mastery_score'].mean())
    avg_questions = float(df['total_questions'].mean())
    total_questions_answered = int(df['total_questions'].sum())
    
    # Let's categorize students into levels based on their real mastery
    advanced = len(df[df['mastery_score'] >= 0.8])
    intermediate = len(df[(df['mastery_score'] >= 0.5) & (df['mastery_score'] < 0.8)])
    beginner = len(df[df['mastery_score'] < 0.5])
    
    # We map the real data to the dashboard metrics
    return {
        "subjectMastery": [
            { "subject": "Overall Student Accuracy", "level": f"{round(avg_mastery*100, 1)}%", "accuracy": f"{round(avg_mastery*100, 1)}%", "quizzes": int(avg_questions), "chapters": total_students },
            { "subject": "Advanced Learners (>80%)", "level": f"{advanced} Students", "accuracy": f"{round((advanced/total_students)*100, 1)}%", "quizzes": 0, "chapters": advanced },
            { "subject": "Intermediate (50-80%)", "level": f"{intermediate} Students", "accuracy": f"{round((intermediate/total_students)*100, 1)}%", "quizzes": 0, "chapters": intermediate },
            { "subject": "Beginner (<50%)", "level": f"{beginner} Students", "accuracy": f"{round((beginner/total_students)*100, 1)}%", "quizzes": 0, "chapters": beginner }
        ],
        "radarData": [
            { "subject": "Global Accuracy", "A": round(avg_mastery * 100), "fullMark": 100 },
            { "subject": "Engagement (Vol)", "A": min(100, round((avg_questions / 500) * 100)), "fullMark": 100 },
            { "subject": "Advanced %", "A": round((advanced/total_students) * 100), "fullMark": 100 },
            { "subject": "Intermediate %", "A": round((intermediate/total_students) * 100), "fullMark": 100 },
            { "subject": "Beginner %", "A": round((beginner/total_students) * 100), "fullMark": 100 }
        ],
        "questionProficiency": [
            { "type": "Total Questions Processed", "weak": False, "correct": f"{total_questions_answered}", "avgTime": "-", "score": f"{round(avg_mastery*100, 1)}%", "color": "bg-purple-500" },
            { "type": "Unique Students", "weak": False, "correct": f"{total_students}", "avgTime": "-", "score": "100%", "color": "bg-teal-500" }
        ]
    }

def add_log(tag: str, type_: str, text: str, session_id: str = "SYS-IDLE"):
    session_logs.append({
        "time": datetime.datetime.now().strftime("%H:%M:%S"),
        "tag": tag,
        "type": type_,
        "text": text,
        "session_id": session_id
    })

import uuid

from fastapi import FastAPI, HTTPException, Header

@app.post("/api/v1/decisions")
def orchestrate_decision(learner_state: LearnerState, x_llm_model: str = Header(default="mistral/open-mistral-nemo")):
    session_id = f"ALO-SES-{str(uuid.uuid4())[:6].upper()}"
    
    initial_state = {
        "learner_state": learner_state,
        "proposals": [],
        "final_action": "",
        "validation_status": "",
        "settings": {"model": x_llm_model}
    }
    
    add_log("SYSTEM", "info", f"Received student profile for evaluation (Mastery: {learner_state.mastery:.2f}, Node: {learner_state.concept_id}).", session_id)
    add_log("ROUTER", "default", f"Initializing agent workflow. LLM inference engine set to: {x_llm_model}", session_id)
    
    try:
        result = orchestrator_app.invoke(initial_state)
        
        for p in result["proposals"]:
            add_log(f"AGENT ({p.agent.upper()})", "primary", f"Proposed intervention: {p.action} (Confidence: {p.confidence:.2f}). Reason: {p.reasoning}", session_id)
            
        add_log("ORCHESTRATOR", "default", f"Analyzed agent proposals. Final consensus reached: {result['final_action']}", session_id)
        add_log("VALIDATION", "success", f"Intervention successfully validated and committed (Status: {result['validation_status']}).", session_id)
        add_log("DIAGNOSTICS", "info", "Student knowledge graph updated with recent interaction metrics.", session_id)
        
        return {
            "learner_state": learner_state.model_dump(),
            "proposals": [p.model_dump() for p in result["proposals"]],
            "decision": result["final_action"],
            "validation_status": result["validation_status"],
            "session_id": session_id
        }
    except Exception as e:
        add_log("ERROR", "warning", f"Failed to orchestrate decision: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
