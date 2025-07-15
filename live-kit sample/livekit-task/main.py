# main.py or token_api.py
from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from livekit_service import create_join_token
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "LiveKit FastAPI is running"}

@app.get("/get-token")
def get_token(
    identity: str = Query(...),
    room: str = Query(...),
    role: str = Query("viewer")  # default to viewer
):
    try:
        # Role-based permissions
        can_publish = role == "host"
        can_subscribe = True
        can_publish_data = True

        token = create_join_token(
            identity=identity,
            room=room,
            can_publish=can_publish,
            can_subscribe=can_subscribe,
            can_publish_data=can_publish_data
        )
        return {"token": token}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
