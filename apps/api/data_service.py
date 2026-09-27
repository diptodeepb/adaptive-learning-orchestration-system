import os
from pathlib import Path
from packages.schemas.state import LearnerState
from datasets import load_dataset
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / '.env')
HF_TOKEN = os.getenv("HF_TOKEN")
TARGET_REPO = "diptodeepb/ednet-student-states"

# We cache the dataset in memory after loading it once so the API responds instantly.
_cached_df = None

def get_aggregated_data():
    global _cached_df
    if _cached_df is not None:
        return _cached_df
        
    if not HF_TOKEN:
        print("WARNING: HF_TOKEN not found in .env. Using mock fallback data.")
        return None

    try:
        print(f"Downloading aggregated student states from {TARGET_REPO}...")
        # Since this aggregated dataset is tiny (a few MBs), we just load the whole thing into memory
        ds = load_dataset(TARGET_REPO, split="train", token=HF_TOKEN)
        _cached_df = ds.to_pandas()
        return _cached_df
    except Exception as e:
        print(f"WARNING: Failed to load from Hugging Face: {e}")
        return None

def fetch_learner_state(subject_id: str) -> LearnerState:
    """
    Production-grade API: Fetches the pre-calculated mastery scores
    from the tiny aggregated dataset stored on Hugging Face Hub.
    """
    df = get_aggregated_data()
    
    if df is not None:
        # Fast pandas lookup
        user_data = df[df['subject_id'] == subject_id]
        if not user_data.empty:
            row = user_data.iloc[0]
            mastery_score = float(row['mastery_score'])
            return LearnerState(
                mastery=mastery_score,
                uncertainty=round(1.0 - mastery_score, 2),
                concept_id=str(row['last_question_id']),
                recent_scores=[mastery_score],
                active_misconceptions=[]
            )
            
    # Default state if student not found or DB not initialized
    return LearnerState(
        mastery=0.1,
        uncertainty=0.9,
        concept_id="unknown",
        recent_scores=[],
        active_misconceptions=[]
    )

def get_random_subject_id() -> str:
    """Returns a random subject_id from the aggregated dataset."""
    df = get_aggregated_data()
    if df is not None and not df.empty:
        # Get a random row
        random_row = df.sample(1).iloc[0]
        return str(random_row['subject_id'])
    return "u63386" # Fallback
