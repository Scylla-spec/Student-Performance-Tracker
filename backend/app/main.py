from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, modules, marks, analytics

app = FastAPI(
    title="Student Performance Tracker",
    description="NUST Academic Performance API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(modules.router, prefix="/modules", tags=["Modules"])
app.include_router(marks.router, prefix="/marks", tags=["Marks"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

@app.get("/")
def root():
    return {"message": "Student Performance Tracker API is running 🚀"}