import firebase_admin
from firebase_admin import credentials, firestore

# Path to your downloaded service account key
CREDENTIALS_PATH = "./service-account-key.json"

# Initialize the app with a service account
try:
    cred = credentials.Certificate(CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred)
    print("Firebase Admin SDK initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")

# Get a reference to the Firestore database
db = firestore.client()