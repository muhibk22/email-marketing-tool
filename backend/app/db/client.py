from pymongo import MongoClient
from decouple import config

MONGO_URI = config("MONGO_URI")

client = MongoClient(MONGO_URI)

db = client[config("DB_NAME")]   # Example: "fes-portal"

users_collection = db["users_email_tool"]
