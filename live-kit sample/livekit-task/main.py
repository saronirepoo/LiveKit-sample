from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from livekit_service import create_join_token
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

@app.get("/")
def root():
    return {"message": "LiveKit FastAPI is running"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost"] for stricter control
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/get-token")
def get_token(identity: str = Query(...), room: str = Query(...)):
    try:
        token = create_join_token(identity, room)
        return {"token": token}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
