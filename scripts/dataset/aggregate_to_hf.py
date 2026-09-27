import duckdb
import os
import pandas as pd
from datasets import load_dataset, Dataset
from dotenv import load_dotenv

from pathlib import Path

# Load the Hugging Face token from .env
env_path = Path(__file__).parent.parent.parent / 'apps' / 'api' / '.env'
load_dotenv(env_path)
HF_TOKEN = os.getenv("HF_TOKEN")

TARGET_REPO = "diptodeepb/ednet-student-states"

def aggregate_and_push_to_hf():
    if not HF_TOKEN:
        print("ERROR: HF_TOKEN is not set in apps/api/.env")
        print("Please add your Hugging Face write token before running this.")
        return

    print("Connecting to in-memory DuckDB...")
    con = duckdb.connect(':memory:')
    
    print("Streaming EDNet kt1 dataset...")
    # For a full production run, remove the `take(50000)` and let it stream the whole thing.
    # We use a 50k row slice here just so the script finishes in a few seconds for testing.
    dataset = load_dataset("mgor/EDNet", name="kt1", split="train", streaming=True).take(50000)
    
    # Convert streamed sample to Pandas (in a real massive pipeline we would batch this)
    print("Fetching data into memory...")
    sample_data = list(dataset)
    df = pd.DataFrame(sample_data)
    
    con.register('raw_ednet', df)
    
    print("Calculating exact mastery scores using DuckDB...")
    query = """
        SELECT 
            subject_id, 
            COUNT(*) as total_questions,
            SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
            ROUND(AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END), 2) as mastery_score,
            MAX(question_id) as last_question_id
        FROM raw_ednet 
        GROUP BY subject_id
    """
    
    aggregated_df = con.execute(query).fetchdf()
    print(f"Calculated mastery for {len(aggregated_df)} unique students.")
    
    print(f"Pushing aggregated dataset to Hugging Face ({TARGET_REPO})...")
    # Convert pandas dataframe back to HF Dataset object
    final_dataset = Dataset.from_pandas(aggregated_df)
    
    try:
        final_dataset.push_to_hub(
            repo_id=TARGET_REPO,
            token=HF_TOKEN,
            private=True
        )
        print("✅ Successfully pushed to Hugging Face Hub!")
        print("Your API can now fetch these aggregated states in milliseconds.")
    except Exception as e:
        print(f"❌ Failed to push to Hugging Face: {e}")

if __name__ == "__main__":
    aggregate_and_push_to_hf()
