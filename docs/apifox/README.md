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

### Keyword Search (v1 mock)
- Method: `POST`
- Path: `/api/search`
- Body example:

```json
{
  "keyword": "iphone 16 256g"
}
```

- Response example:

```json
{
  "ok": true,
  "data": {
    "keyword": "iphone 16 256g",
    "fetchedAt": "2026-03-28T00:30:00.000Z",
    "lowest": {
      "platform": "pdd",
      "title": "iphone 16 256g - PDD item 2",
      "currentPrice": 3129,
      "link": "https://example.com/pdd/iphone%2016%20256g/2"
    },
    "byPlatform": {
      "taobao": [],
      "jd": [],
      "pdd": []
    },
    "totalCandidates": 9
  }
}
```

## Team Convention
- API debug and API test cases should be managed in Apifox for this project.
