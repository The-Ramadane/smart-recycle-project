
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from io import BytesIO
from .model_loader import model_loader

app = FastAPI(title="Smart Recycle API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Smart Recycle API is running ♻️"}

@app.post("/classify")
async def classify_image(file: UploadFile = File(...)):
    """Reçoit une image et renvoie la catégorie de déchet"""
    try:
        contents = await file.read()
        
        # Appel à notre modèle YOLO
        predictions = model_loader.predict(contents)
        
        return {
            "filename": file.filename,
            "detections": predictions,  # Renvoie un tableau avec tous les objets détectés
            "total_objects_detected": len(predictions)
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
