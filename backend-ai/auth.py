import os
import base64
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

security = HTTPBearer()


def _get_secret() -> bytes:
    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise RuntimeError("JWT_SECRET environment variable is not set")
    # Add padding if needed (base64 strings must be a multiple of 4)
    secret += "=" * (-len(secret) % 4)
    return base64.b64decode(secret)


def verify_jwt(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Validate Bearer JWT and return decoded claims."""
    token = credentials.credentials
    try:
        claims = jwt.decode(
            token,
            _get_secret(),
            algorithms=["HS256"],
        )
        return claims
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
