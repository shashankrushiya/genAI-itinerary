import firebase_admin
from firebase_admin import credentials, firestore

# Path to your downloaded service account key
CREDENTIALS_PATH = "./service-account-key.json"

# Initialize the app with a service account
try:
    service_account_info = json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"])
    cred = credentials.Certificate(service_account_info)
    print("Firebase Admin SDK initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")

# Get a reference to the Firestore database
db = firestore.client()