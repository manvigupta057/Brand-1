import json, os, uuid
from datetime import datetime

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "ai_setups.json")

def load_configs():
    if not os.path.exists(CONFIG_PATH):
        return []
    try:
        with open(CONFIG_PATH, "r") as f:
            return json.load(f)
    except:
        return []

def save_configs(data):
    with open(CONFIG_PATH, "w") as f:
        json.dump(data, f, indent=2)

def get_active_config():
    configs = load_configs()
    # Puraane sync errors ko handle karne ke liye sakht check
    for c in configs:
        if c.get("is_active") == True:
            return c
    return None
