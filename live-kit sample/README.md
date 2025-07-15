Backend: FastAPI server to generate LiveKit tokens

Frontend: React app using livekit-client for video, audio & chat

Backend Setup (FastAPI) : 

cd livekit-task
python -m venv venv
venv\Scripts\activate    # On Windows
pip install -r requirements.txt
uvicorn main:app --reload
Server runs at: http://localhost:8000

Frontend Setup (React + LiveKit) : 
cd livekit-frontend
npm install
npm start
React app runs at: http://localhost:3000