import duckdb
from datasets import load_dataset
import pandas as pd

def calculate_student_mastery():
    print("Streaming kt1 dataset to find a student's history...")
    dataset = load_dataset("mgor/EDNet", name="kt1", split="train", streaming=True)
    
    # Let's take the first 1000 rows to find a student's track record
    sample_data = list(dataset.take(1000))
    df = pd.DataFrame(sample_data)
    
    # We will use DuckDB to quickly run analytics on this Pandas DataFrame
    con = duckdb.connect(database=':memory:')
    con.register('ednet_sample', df)
    
    # Calculate mastery (accuracy) per user
    query = """
        SELECT 
            subject_id as user_id, 
            COUNT(*) as total_questions,
            SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
            ROUND(AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END), 2) as mastery_score,
            ROUND(AVG(elapsed_time)/1000, 1) as avg_time_sec
        FROM ednet_sample 
        GROUP BY subject_id
        ORDER BY total_questions DESC
        LIMIT 5
    """
    
    results = con.execute(query).fetchdf()
    
    print("\n--- Top 5 Active Students in Sample ---")
    print(results.to_string(index=False))
    
    # This demonstrates how we can convert a row into our LearnerState!
    top_student = results.iloc[0]
    print(f"\nExample mapping to LearnerState for user {top_student['user_id']}:")
    print(f"- Mastery: {top_student['mastery_score']}")
    print(f"- Uncertainty: {min(1.0, 1.0 - top_student['mastery_score'])}") # Simple heuristic

if __name__ == "__main__":
    calculate_student_mastery()
