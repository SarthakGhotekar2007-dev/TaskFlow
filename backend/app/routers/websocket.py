from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Dict, List
import json
from jose import jwt, JWTError
from app.utils.security import SECRET_KEY, ALGORITHM

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # map org_id -> list of websockets
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, org_id: int):
        await websocket.accept()
        if org_id not in self.active_connections:
            self.active_connections[org_id] = []
        self.active_connections[org_id].append(websocket)

    def disconnect(self, websocket: WebSocket, org_id: int):
        if org_id in self.active_connections and websocket in self.active_connections[org_id]:
            self.active_connections[org_id].remove(websocket)
            if not self.active_connections[org_id]:
                del self.active_connections[org_id]

    async def broadcast(self, message: dict, org_id: int = None):
        json_msg = json.dumps(message)
        
        # If org_id is provided, send only to that org. Otherwise broadcast globally (fallback)
        target_websockets = []
        if org_id is not None and org_id in self.active_connections:
            target_websockets = self.active_connections[org_id]
        elif org_id is None:
            for websockets in self.active_connections.values():
                target_websockets.extend(websockets)
                
        for connection in target_websockets:
            try:
                await connection.send_text(json_msg)
            except Exception as e:
                print("Failed to send message via websocket", e)

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(None), org_id: int = Query(default=0)):
    if not token:
        await websocket.close(code=1008)
        return
        
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            await websocket.close(code=1008)
            return
    except JWTError:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, org_id)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, org_id)
