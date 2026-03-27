# Apifox Notes

## Base URL
- Local: `http://localhost:3000`

## Current Endpoints

### Health Check
- Method: `GET`
- Path: `/api/health`
- Response example:

```json
{
  "ok": true,
  "service": "price-watcher-web",
  "timestamp": "2026-03-27T15:00:00.000Z"
}
```

## Team Convention
- API debug and API test cases should be managed in Apifox for this project.
