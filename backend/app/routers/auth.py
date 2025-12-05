from fastapi import APIRouter, Depends, HTTPException, Response, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import httpx
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.auth import create_access_token, set_auth_cookie, clear_auth_cookie, get_current_user
from app.config import get_settings

router = APIRouter(prefix="/auth", tags=["Authentication"])
settings = get_settings()

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


@router.get("/google/login")
async def google_login():
    """Redirect to Google OAuth login"""
    redirect_uri = f"{settings.backend_url}/api/auth/google/callback"
    scope = "openid email profile"
    
    auth_url = (
        f"{GOOGLE_AUTH_URL}?"
        f"client_id={settings.google_client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"response_type=code&"
        f"scope={scope}&"
        f"access_type=offline&"
        f"prompt=consent"
    )
    
    return RedirectResponse(url=auth_url)


@router.get("/google/callback")
async def google_callback(
    code: str,
    response: Response,
    db: Session = Depends(get_db)
):
    """Handle Google OAuth callback"""
    redirect_uri = f"{settings.backend_url}/api/auth/google/callback"
    
    # Exchange code for tokens
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": redirect_uri,
            }
        )
        
        if token_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get access token")
        
        tokens = token_response.json()
        access_token = tokens.get("access_token")
        
        # Get user info from Google
        userinfo_response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        if userinfo_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get user info")
        
        userinfo = userinfo_response.json()
    
    # Get or create user using Google profile ID
    google_id = userinfo.get("id")
    email = userinfo.get("email")
    name = userinfo.get("name")
    picture = userinfo.get("picture")
    
    user = db.query(User).filter(User.id == google_id).first()
    
    if not user:
        # Create new user
        user = User(
            id=google_id,
            email=email,
            name=name,
            picture=picture
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update existing user info
        user.email = email
        user.name = name
        user.picture = picture
        db.commit()
    
    # Create JWT token
    jwt_token = create_access_token(data={"sub": user.id})
    
    # Create redirect response and set cookie
    redirect_response = RedirectResponse(
        url=f"{settings.frontend_url}/dashboard",
        status_code=302
    )
    set_auth_cookie(redirect_response, jwt_token)
    
    return redirect_response


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user"""
    return current_user


@router.post("/logout")
async def logout(response: Response):
    """Logout user by clearing the auth cookie"""
    clear_auth_cookie(response)
    return {"message": "Successfully logged out"}


@router.get("/check")
async def check_auth(request: Request, db: Session = Depends(get_db)):
    """Check if user is authenticated"""
    from app.auth import get_current_user_optional
    user = await get_current_user_optional(request, db)
    if user:
        return {"authenticated": True, "user": UserResponse.model_validate(user)}
    return {"authenticated": False, "user": None}
