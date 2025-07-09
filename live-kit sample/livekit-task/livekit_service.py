import os
from dotenv import load_dotenv
from livekit.api import AccessToken, VideoGrants

load_dotenv()

API_KEY = os.getenv("LIVEKIT_API_KEY")
API_SECRET = os.getenv("LIVEKIT_API_SECRET")

def create_join_token(identity: str, room: str) -> str:
    token = (AccessToken(API_KEY, API_SECRET)
             .with_identity(identity)
             .with_grants(VideoGrants(room_join=True, room=room))
            )
    return token.to_jwt()
