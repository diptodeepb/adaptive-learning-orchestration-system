import json
from datasets import load_dataset

def explore_ednet():
    print("Loading EDNet (kt1 subset) in streaming mode...")
    # We use streaming=True so it doesn't download the 5.6GB dataset locally.
    # It just streams the first few records over the network.
    try:
        dataset = load_dataset("mgor/EDNet", name="kt1", split="train", streaming=True)
        
        # Take the first 5 rows
        sample = list(dataset.take(5))
        
        print(f"\n--- Schema / Features ---")
        for feature_name, feature_type in dataset.features.items():
            print(f"{feature_name}: {feature_type}")
            
        print(f"\n--- First 5 Rows ---")
        print(json.dumps(sample, indent=2))
        
    except Exception as e:
        print(f"Error loading dataset: {e}")

if __name__ == "__main__":
    explore_ednet()
