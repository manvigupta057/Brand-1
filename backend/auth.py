import os
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from authlib.integrations.starlette_client import OAuth
from jose import JWTError, jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
oauth = OAuth()
security = HTTPBearer()

# Google Setup
oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.get("/auth/login")
async def login(request: Request):
    print(f"[AUTH] Login attempt initiated from {request.client.host}")
    
    # Manually construct the redirect URI using Forwarded headers for Tunnels
    forwarded_host = request.headers.get('x-forwarded-host')
    host = forwarded_host if forwarded_host else request.headers.get('host', 'localhost:8000')
    
    if "devtunnels.ms" in host:
        redirect_uri = f"https://{host}/auth/callback"
    else:
        redirect_uri = f"http://{host}/auth/callback"
        
    print(f"[AUTH] Redirecting to Google via {redirect_uri}")
    return await oauth.google.authorize_redirect(request, redirect_uri)

from fastapi.responses import RedirectResponse

@router.get("/auth/callback")
async def auth_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user = token.get('userinfo')
    if user:
        access_token = create_access_token(data={"sub": user["email"], "name": user.get("name")})
        
        # Detect where the request came from (Tunnel or Localhost)
        forwarded_host = request.headers.get('x-forwarded-host')
        host = forwarded_host if forwarded_host else request.headers.get('host', 'localhost:5173')

        if "devtunnels.ms" in host:
            # Handle both formats: 'id-8000.inc1...' AND 'id.inc1...:8000'
            frontend_host = host.replace("-8000", "-5173").replace(":8000", ":5173")
            frontend_base = f"https://{frontend_host}"
        else:
            frontend_base = "http://localhost:5173"
            
        print(f"[AUTH] Redirecting user back to: {frontend_base}")
        response = RedirectResponse(url=f"{frontend_base}/?access_token={access_token}")
        return response
    raise HTTPException(status_code=400, detail="Login failed")

async def get_current_user(auth: HTTPAuthorizationCredentials = Depends(security)):
    token = auth.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or Expired Credentials")
