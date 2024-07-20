import os
import json
from multiprocessing import Pool, cpu_count

class JSONLoader:
    def __init__(self, data_dir):
        self.data_dir = os.path.abspath(data_dir)

    def load_json(self, file_path):
        try:
            with open(file_path, 'r') as file:
                data = json.load(file)
            return data
        except Exception as e:
            print(f"Failed to load {file_path}: {e}")
            return None

    def get_all_json_files(self):
        json_files = []
        for root, _, files in os.walk(self.data_dir):
            for file in files:
                if file.endswith('.json'):
                    json_files.append(os.path.join(root, file))
        return json_files

    def load_all_jsons(self):
        json_files = self.get_all_json_files()
        
        # Use all available CPU cores
        num_workers = cpu_count()
        
        with Pool(num_workers) as pool:
            results = pool.map(self.load_json, json_files)
        
        # Filter out any None results from failed loads
        results = [result for result in results if result is not None]
        
        print(f"Loaded {len(results)} JSON files successfully.")
        return results
