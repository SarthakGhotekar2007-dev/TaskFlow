import os
import firebase_admin
from firebase_admin import credentials, auth
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)
load_dotenv()

def initialize_firebase():
    """Initializes the Firebase Admin SDK."""
    if not firebase_admin._apps:
        cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
        
        if not cred_path:
            logger.warning("FIREBASE_SERVICE_ACCOUNT_PATH is not set. Initializing with Project ID for token verification.")
            try:
                # Try initialization with project ID for token verification
                project_id = os.getenv("FIREBASE_PROJECT_ID", "taskflow-saas-13ab9")
                firebase_admin.initialize_app(options={'projectId': project_id})
                logger.info(f"Initialized Firebase Admin SDK with project ID {project_id}.")
            except Exception as e:
                logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
        else:
            if os.path.exists(cred_path):
                try:
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
                    logger.info("Initialized Firebase Admin SDK with service account credentials.")
                except Exception as e:
                    logger.error(f"Failed to initialize Firebase Admin SDK with path {cred_path}: {e}")
            else:
                logger.error(f"Service account file not found at {cred_path}")

def verify_google_token(token: str):
    """Verifies a Google ID token using Firebase Admin SDK."""
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        logger.error(f"Error verifying Firebase ID token: {e}")
        raise ValueError(f"Invalid authentication token: {e}")

# Initialize when the module is imported
initialize_firebase()
