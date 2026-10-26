# Ticket Triage (single user, no login)

Add a ticket → Gemini categorises it and sets a priority → you see it sorted by urgency → mark it resolved.

- **Backend:** Spring Boot 3.4, Java 21, H2 file database
- **Frontend:** Angular 19 (standalone components)
- **AI:** Google Gemini free tier (REST API)
- Design docs (data flow, HLD, LLD): [`docs/DESIGN.md`](docs/DESIGN.md)

## Run it

You need: Java 21, Maven, Node 20+ and a free Gemini API key from https://aistudio.google.com/apikey

**1. Backend** (port 8080)

```bash
cd backend
export GEMINI_API_KEY=your_key_here          # Windows PowerShell: $env:GEMINI_API_KEY="your_key_here"
mvn spring-boot:run
```

**2. Frontend** (port 4200)

```bash
cd frontend
npm install
npm start
```

Open http://localhost:4200

The Angular dev server proxies `/api/*` to `localhost:8080` (see `frontend/proxy.conf.json`), so no CORS setup is needed.

## Run with Docker

From the project root, build the image and start the app:

```bash
docker build -t ticket-triage .
docker run --rm -p 8080:8080 \
  -e GEMINI_API_KEY=your_key_here \
  -v ticket-triage-data:/app/data \
  ticket-triage
```

Open http://localhost:8080. The container serves both the Angular UI and API. The named volume keeps the H2 database across container restarts; omit `GEMINI_API_KEY` to use fallback triage.

## Notes

- Tickets are stored in `backend/data/` (H2 file DB) and survive restarts. Delete that folder to reset.
- If the key is missing, the quota is used up, or Gemini fails, the ticket is still saved with
  category `OTHER`, priority `MEDIUM` and a "not AI-triaged" badge. Nothing is lost.
- The model name is configurable: `export GEMINI_MODEL=gemini-2.5-flash` (default). If Google changes which models
  are on the free tier, change it here, no code change needed.
- Quick API test without the UI:

```bash
curl -X POST localhost:8080/api/tickets -H "Content-Type: application/json" \
  -d '{"title":"Site is down","description":"Production returns 503 for all users since 10am"}'
curl "localhost:8080/api/tickets?status=OPEN"
curl -X PATCH localhost:8080/api/tickets/1/resolve
```

## Project layout

```
ticket-triage/
├── backend/   Spring Boot (controller → service → repository, plus a Gemini client)
├── frontend/  Angular (AppComponent + form + list + HTTP service)
└── docs/DESIGN.md
```
