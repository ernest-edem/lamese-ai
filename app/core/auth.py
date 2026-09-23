"""
Authentication utilities for LAMESE AI.

Provides server-side Firebase ID-token verification
for protected API endpoints.
"""

import logging
import os
from pathlib import Path

import firebase_admin
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth, credentials


# ==========================================================
# ENVIRONMENT
# ==========================================================

load_dotenv()


# ==========================================================
# LOGGING
# ==========================================================

logger = logging.getLogger(__name__)


# ==========================================================
# SECURITY
# ==========================================================

bearer_scheme = HTTPBearer(
    auto_error=False,
)


# ==========================================================
# FIREBASE ADMIN INITIALIZATION
# ==========================================================

def initialize_firebase() -> None:
    """
    Initialize the Firebase Admin SDK using the service-account
    credentials configured through the environment.
    """

    if firebase_admin._apps:
        return

    credentials_path = os.getenv(
        "FIREBASE_CREDENTIALS_PATH"
    )

    if not credentials_path:
        raise RuntimeError(
            "FIREBASE_CREDENTIALS_PATH is not configured."
        )

    credential_file = Path(credentials_path)

    if not credential_file.exists():
        raise RuntimeError(
            "Firebase credentials file was not found."
        )

    credential = credentials.Certificate(
        str(credential_file)
    )

    firebase_admin.initialize_app(
        credential
    )


try:
    initialize_firebase()

except Exception:
    # Firebase initialization is intentionally deferred until
    # authentication is requested so the application can still
    # start and expose public health/readiness endpoints.
    pass


# ==========================================================
# FIREBASE TOKEN VERIFICATION
# ==========================================================

def verify_firebase_id_token(
    id_token: str,
) -> dict[str, object]:
    """
    Verify a Firebase ID token and return the authenticated user.

    Raises HTTP 401 for invalid or expired tokens.
    Raises HTTP 500 when Firebase authentication is not configured.
    """

    try:
        initialize_firebase()

        decoded_token = auth.verify_id_token(
            id_token
        )

    except ValueError as exc:
        logger.warning(
            "Firebase ID token verification failed: %s: %s",
            type(exc).__name__,
            str(exc),
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        ) from exc

    except auth.InvalidIdTokenError as exc:
        logger.warning(
            "Firebase ID token verification failed: %s: %s",
            type(exc).__name__,
            str(exc),
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        ) from exc

    except auth.ExpiredIdTokenError as exc:
        logger.warning(
            "Firebase ID token verification failed: %s: %s",
            type(exc).__name__,
            str(exc),
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        ) from exc

    except auth.RevokedIdTokenError as exc:
        logger.warning(
            "Firebase ID token verification failed: %s: %s",
            type(exc).__name__,
            str(exc),
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        ) from exc

    except RuntimeError as exc:
        logger.error(
            "Firebase authentication configuration error: %s: %s",
            type(exc).__name__,
            str(exc),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service is not configured.",
        ) from exc

    except Exception as exc:
        logger.error(
            "Firebase authentication service error: %s: %s",
            type(exc).__name__,
            str(exc),
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is unavailable.",
        ) from exc

    if not isinstance(decoded_token, dict):
        logger.warning(
            "Firebase ID token verification returned an invalid payload type: %s",
            type(decoded_token).__name__,
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    user_id = decoded_token.get("uid")

    if not user_id:
        logger.warning(
            "Firebase ID token verification returned a payload without a user ID."
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    return decoded_token


# ==========================================================
# FASTAPI AUTHENTICATION DEPENDENCY
# ==========================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        bearer_scheme
    ),
) -> dict[str, object]:
    """
    Return the currently authenticated Firebase user.

    Raises HTTP 401 when a valid Bearer token is not provided.
    """

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer authentication is required.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    return verify_firebase_id_token(
        credentials.credentials
    )