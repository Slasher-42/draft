import httpx
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings

bearer_scheme = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)
) -> dict:
    token = credentials.credentials
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.USER_MANAGEMENT_URL}/api/auth/validate",
                headers={"Authorization": f"Bearer {token}"}
            )
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        data = response.json()
        if not data.get("data", {}).get("valid", False):
            raise HTTPException(status_code=401, detail="Token validation failed")

        return data["data"]
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="User management service unavailable")