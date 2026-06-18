# Gates Dashboard

Real-time monitoring dashboard for gate chains. Each gate is an IP address checked via ICMP ping. Gates are linked in order — if an upstream gate goes down, downstream gates are marked as degraded.

## Quick Start

```bash
git clone https://github.com/AmrMustafa282/Dabaa_gates.git
cd Dabaa_gates
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Real-time updates** via Server-Sent Events (SSE)
- **Chain dependency logic** — downstream gates depend on upstream ones
- **CRUD** — add, edit, and delete gates (name + IP + order)
- **ICMP ping** health checks every 10 seconds (configurable)
- **Activity logs** — status changes, CRUD events, import/export history
- **Import / Export** — backup and restore gate config as JSON
- **View modes** — chain, table, and grid layouts
- **Search & filters** — filter by name, IP, order, or status
- **SQLite** database persisted in a Docker volume

## Configuration

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `file:/app/data/gates.db` | SQLite database path |
| `HEALTH_CHECK_INTERVAL_MS` | `10000` | Ping interval in milliseconds |

## Gate Chain Logic

Gates are ordered (1, 2, 3, …). The system pings each gate and evaluates status:

- **Online** — gate responds to ping and all upstream gates are up
- **Down** — gate does not respond to ping
- **Degraded** — gate responds to ping but an upstream gate is down

## Data Management

- **Export Gates** — download gate configuration as JSON
- **Export Gates + Logs** — include recent activity logs
- **Import** — upload JSON with `replace` (wipe & reload) or `merge` (update existing orders, add new)

Export format:
```json
{
  "version": 1,
  "exportedAt": "2026-06-18T...",
  "gates": [{ "name": "Gate A", "ip": "172.16.0.1", "order": 1 }]
}
```

## API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/gates` | List all gates |
| `POST` | `/api/gates` | Create a gate |
| `GET` | `/api/gates/:id` | Get a gate |
| `PUT` | `/api/gates/:id` | Update a gate |
| `DELETE` | `/api/gates/:id` | Delete a gate |
| `GET` | `/api/health` | Current health snapshot |
| `GET` | `/api/stream` | SSE real-time stream |
| `GET` | `/api/logs` | Activity logs (supports `search`, `type`, `limit`) |
| `DELETE` | `/api/logs` | Clear all logs |
| `GET` | `/api/export` | Export JSON (`?includeLogs=true`) |
| `POST` | `/api/export` | Import JSON (`{ gates, mode }`) |

## Development

```bash
cp .env.example .env
npm install
npx prisma db push
npm run dev
```

Note: Ping requires `NET_RAW` capability. In Docker this is handled via `cap_add: NET_RAW` in docker-compose.
