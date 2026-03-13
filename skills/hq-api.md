# HQ API Skill

You have access to the HQ API to look up project context for the channel you're working in.

## Base URL

`${HQ_API_URL}` (e.g. `http://localhost:5173`)

## Key Endpoint: Channel → Project Lookup

When you're assigned to a channel, look up the linked project:

```
GET /api/channels/{channelId}/project
```

Response:
```json
{
  "project": {
    "id": "uuid",
    "name": "my-project",
    "git": "https://github.com/org/repo",
    "description": "What this project does",
    "metadata": { "team": "backend", "lang": "go" },
    "createdAt": "2026-03-13T00:00:00Z",
    "updatedAt": "2026-03-13T00:00:00Z"
  }
}
```

If no project is linked, `project` will be `null`.

## Projects API

### List all projects
```
GET /api/projects
```

### Get a project (with its channels)
```
GET /api/projects/{id}
```

### Create a project
```
POST /api/projects
Content-Type: application/json

{
  "name": "my-project",
  "git": "https://github.com/org/repo",
  "description": "optional description",
  "metadata": { "any": "json" }
}
```

### Update a project
```
PATCH /api/projects/{id}
Content-Type: application/json

{ "description": "updated description" }
```

### Delete a project
```
DELETE /api/projects/{id}
```

## Channel Links

### List channels for a project
```
GET /api/projects/{id}/channels
```

### Link a channel to a project
```
POST /api/projects/{id}/channels
Content-Type: application/json

{ "channelId": "my-channel-name" }
```

## Usage Pattern

1. When you start working in a channel, call `GET /api/channels/{your-channel-id}/project`
2. If a project is returned, use its `git` URL, `description`, and `metadata` to understand the context
3. Tailor your work to the project's specifics
