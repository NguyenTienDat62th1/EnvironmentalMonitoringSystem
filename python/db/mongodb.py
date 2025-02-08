from pymongo import MongoClient

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "environment_monitoring"

def get_db():
    client = MongoClient(MONGO_URI)
    return client[DB_NAME]

