import duckdb
from datasets import load_dataset
import pandas as pd
from pathlib import Path

# In a production environment, we save the processed database locally
# on a high-speed SSD so the backend API queries it instantly.
DB_PATH = Path(__file__).parent.parent.parent / "data" / "processed" / "ednet.duckdb"

def ingest_ednet_to_duckdb():
    print(f"Connecting to Local Production DB at {DB_PATH}")
    # Ensure directory exists
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    con = duckdb.connect(str(DB_PATH))
    
    # 1. Create the persistent table in DuckDB
    print("Creating ednet_kt1 table...")
    con.execute("""
        CREATE TABLE IF NOT EXISTS ednet_kt1 (
            timestamp BIGINT,
            solving_id BIGINT,
            question_id VARCHAR,
            user_answer VARCHAR,
            elapsed_time BIGINT,
            subject_id VARCHAR,
            correct_answer VARCHAR,
            is_correct BOOLEAN
        );
    """)
    
    print("Streaming dataset from HuggingFace...")
    # 2. Stream from HF (You can change split="train" to download everything)
    dataset = load_dataset("mgor/EDNet", name="kt1", split="train", streaming=True)
    
    # 3. Batch insert logic (we use a small batch here for demonstration)
    # To process the full 5.6GB, we would iterate over the dataset and batch insert.
    batch = []
    batch_size = 10000
    total_inserted = 0
    
    for row in dataset:
        batch.append(row)
        if len(batch) >= batch_size:
            df = pd.DataFrame(batch)
            con.register('temp_df', df)
            con.execute("INSERT INTO ednet_kt1 SELECT * FROM temp_df")
            total_inserted += len(batch)
            print(f"Inserted {total_inserted} rows...")
            batch = []
            
            # Stop after 50k rows just for the quick demo. Remove this in actual prod build.
            if total_inserted >= 50000:
                break
                
    if batch:
        df = pd.DataFrame(batch)
        con.register('temp_df', df)
        con.execute("INSERT INTO ednet_kt1 SELECT * FROM temp_df")
        total_inserted += len(batch)
        
    print(f"\nDone! Total rows inserted into production DB: {total_inserted}")
    
    # Create indexes for extremely fast API queries
    print("Building indexes for low-latency queries...")
    con.execute("CREATE INDEX IF NOT EXISTS idx_subject ON ednet_kt1(subject_id);")
    
    con.close()

if __name__ == "__main__":
    ingest_ednet_to_duckdb()
