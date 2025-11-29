from pymongo import MongoClient
from decouple import config

# Load MongoDB URI
MONGO_URI = config("MONGO_URI")

# Create MongoDB client
client = MongoClient(MONGO_URI)

# Select DB
db = client[config("DB_NAME")]

# Collections
users_collection = db["users_email_tool"]
contacts_collection = db["contacts_email_tool"]
groups_collection = db["groups_email_tool"]
emails_collection = db["emails_sent_tool"]
