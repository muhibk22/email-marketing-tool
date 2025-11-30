from pymongo import MongoClient
from decouple import config

# Load MongoDB URI
MONGO_URI = config("MONGO_URI")

# Create MongoDB client with timeout to prevent hanging
client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=5000,  # 5 second timeout
    connectTimeoutMS=5000,
    socketTimeoutMS=5000
)

# Select DB
db = client[config("DB_NAME")]

# Collections
users_collection = db["users_email_tool"]
contacts_collection = db["contacts_email_tool"]
groups_collection = db["groups_email_tool"]
emails_collection = db["emails_sent_tool"]

