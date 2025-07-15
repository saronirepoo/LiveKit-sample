import os
from dotenv import load_dotenv
from livekit.api import AccessToken, VideoGrants

load_dotenv()

API_KEY = os.getenv("LIVEKIT_API_KEY")
API_SECRET = os.getenv("LIVEKIT_API_SECRET")

if not API_KEY or not API_SECRET:
    raise RuntimeError("LIVEKIT_API_KEY or LIVEKIT_API_SECRET is not set in .env file")

def create_join_token(
    identity: str,
    room: str,
    can_publish: bool = True, 
    can_subscribe: bool = True,
    can_publish_data: bool = True
) -> str:
    grants = VideoGrants(
        room_join=True,
        room=room,
        can_publish=can_publish,
        can_subscribe=can_subscribe,
        can_publish_data=can_publish_data
    )

    token = (
        AccessToken(API_KEY, API_SECRET)
        .with_identity(identity)
        .with_grants(grants)
    )

    return token.to_jwt()
