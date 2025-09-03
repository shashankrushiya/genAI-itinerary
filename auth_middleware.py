from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth

# This handles the Bearer token scheme from the Authorization header
oauth2_scheme = HTTPBearer()

async def get_current_user(token: HTTPAuthorizationCredentials = Depends(oauth2_scheme)):
    """
    A FastAPI dependency that verifies a Firebase ID token.

    Args:
        token: The bearer token from the request header.

    Returns:
        The decoded token payload if the token is valid.

    Raises:
        HTTPException: If the token is missing, invalid, or expired.
    """
    try:
        # The .credentials attribute holds the token string
        decoded_token = auth.verify_id_token(token.credentials)
        return decoded_token
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        # Catch other potential errors, e.g., token missing
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed or token missing: " + str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )