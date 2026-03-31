import json, os, uuid
from datetime import datetime

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "ai_setups.json")

def load_configs():
    with open(CONFIG_PATH, "r") as f:
        return json.load(f)

def save_configs(data):
    with open(CONFIG_PATH, "w") as f:
        json.dump(data, f, indent=2)

def get_active_config():
    configs = load_configs()
    for c in configs:
        if c.get("is_active"):
            return c
    # Fallback if nothing is active
    return {
        "model": "llama-3.1-8b-instant",
        "prompt": "Classify the user query into DATA or SEMANTIC."
    }
