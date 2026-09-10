from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import (
    departments, jurisdictions, users, projects, land_parcel,
    auth, dashboard, documents, compensation, notifications, admin,
)

app = FastAPI(title="BhoomiSetu API")

# The browser blocks a page on localhost:3000 from calling localhost:8000
# unless the API explicitly allows that origin. These are the dev server ports.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8081",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(departments.router)

app.include_router(jurisdictions.router)

app.include_router(users.router)

app.include_router(projects.router)

app.include_router(land_parcel.router)

app.include_router(auth.router)

app.include_router(dashboard.router)

app.include_router(documents.router)

app.include_router(compensation.router)

app.include_router(notifications.router)

app.include_router(admin.router)
