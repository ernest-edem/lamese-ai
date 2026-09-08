"""
Authentication utilities for LAMESE AI.

Provides server-side Supabase access-token verification
for protected API endpoints.
"""

import os

import httpx
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer


# ==========================================================
# ENVIRONMENT
# ==========================================================

load_dotenv()


# ==========================================================
# SECURITY
# ==========================================================

bearer_scheme = HTTPBearer(
    auto_error=False,
)


# ==========================================================
# SUPABASE TOKEN VERIFICATION
# ==========================================================

def verify_supabase_access_token(
    access_token: str,
) -> dict[str, object]:
    """
    Verify a Supabase access token and return the authenticated user.

    The token is validated by Supabase Auth through the
    /auth/v1/user endpoint.
    """

    supabase_url = os.getenv("SUPABASE_URL")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")

    if not supabase_url or not supabase_anon_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service is not configured.",
        )

    try:
        timeout = httpx.Timeout(
            connect=3.0,
            read=5.0,
            write=5.0,
            pool=5.0,
        )

        with httpx.Client(
            timeout=timeout,
        ) as client:
            response = client.get(
                f"{supabase_url.rstrip('/')}/auth/v1/user",
                headers={
                    "apikey": supabase_anon_key,
                    "Authorization": f"Bearer {access_token}",
                },
            )

    except httpx.TimeoutException as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service timed out.",
        ) from exc

    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is unavailable.",
        ) from exc

    if response.status_code in (401, 403):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is unavailable.",
        )

    try:
        user = response.json()

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service returned an invalid response.",
        ) from exc

    if not isinstance(user, dict) or not user.get("id"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    return user


# ==========================================================
# FASTAPI AUTHENTICATION DEPENDENCY
# ==========================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        bearer_scheme
    ),
) -> dict[str, object]:
    """
    Return the currently authenticated Supabase user.

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

    return verify_supabase_access_token(
        credentials.credentials
    )
