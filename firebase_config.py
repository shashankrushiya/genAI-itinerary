import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

firebase_credentials = os.getenv("FIREBASE_SERVICE_ACCOUNT")

# Initialize the app with a service account
try:
    cred_dict = json.loads(firebase_credentials)
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)
    print("Firebase Admin SDK initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")

# Get a reference to the Firestore database
db = firestore.client()