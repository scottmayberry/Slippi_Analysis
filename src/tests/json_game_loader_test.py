import os
import json
from multiprocessing import Pool, cpu_count

# Directory containing the .json files
data_dir = "./data"

# Function to load a single JSON file
def load_json(file_path):
    try:
        with open(file_path, 'r') as file:
            data = json.load(file)
        return data
    except Exception as e:
        print(f"Failed to load {file_path}: {e}")
        return None

# Function to get all JSON file paths in the directory
def get_all_json_files(dir):
    json_files = []
    for root, _, files in os.walk(dir):
        for file in files:
            if file.endswith('.json'):
                json_files.append(os.path.join(root, file))
    return json_files

# Main function to load all JSON files using multiprocessing
def main():
    json_files = get_all_json_files(data_dir)
    
    # Use all available CPU cores
    num_workers = cpu_count()
    
    with Pool(num_workers) as pool:
        results = pool.map(load_json, json_files)
    
    # Filter out any None results from failed loads
    results = [result for result in results if result is not None]
    
    print(f"Loaded {len(results)} JSON files successfully.")
    return results

if __name__ == "__main__":
    loaded_data = main()
    print(loaded_data[0])
