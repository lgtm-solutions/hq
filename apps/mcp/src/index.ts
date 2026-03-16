import { createServer } from 'node:http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { getDb } from './db.js';
import { getConfig } from './config.js';
import { registerTaskTools } from './tools/tasks.js';
import { registerSubtaskTools } from './tools/subtasks.js';
import { registerCommentTools } from './tools/comments.js';
import { registerCompanyTools } from './tools/companies.js';
import { registerAgentTools } from './tools/agents.js';
import { registerProjectTools } from './tools/projects.js';

const PORT = parseInt(process.env.MCP_PORT || '3001', 10);

async function main() {
  // Initialize DB (triggers auto-migration) and config
  await getDb();
  await getConfig();
  console.log('[hq-mcp] DB and config initialized');

  const server = new McpServer({
    name: 'hq-mcp',
    version: '0.0.1',
  });

  // Register all tools
  registerTaskTools(server);
  registerSubtaskTools(server);
  registerCommentTools(server);
  registerCompanyTools(server);
  registerAgentTools(server);
  registerProjectTools(server);

  // Session management
  const sessions = new Map<string, StreamableHTTPServerTransport>();

  const httpServer = createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://localhost:${PORT}`);

    if (url.pathname !== '/mcp') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found. Use /mcp endpoint.' }));
      return;
    }

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Mcp-Session-Id');
    res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    if (req.method === 'POST') {
      // Check for existing session
      if (sessionId && sessions.has(sessionId)) {
        const transport = sessions.get(sessionId)!;
        await transport.handleRequest(req, res);
        return;
      }

      // New session
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => crypto.randomUUID(),
        onsessioninitialized: (id) => {
          sessions.set(id, transport);
        },
      });

      transport.onclose = () => {
        const id = [...sessions.entries()].find(([_, t]) => t === transport)?.[0];
        if (id) sessions.delete(id);
      };

      await server.connect(transport);
      await transport.handleRequest(req, res);
      return;
    }

    if (req.method === 'GET') {
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid or missing session ID' }));
        return;
      }
      const transport = sessions.get(sessionId)!;
      await transport.handleRequest(req, res);
      return;
    }

    if (req.method === 'DELETE') {
      if (sessionId && sessions.has(sessionId)) {
        const transport = sessions.get(sessionId)!;
        await transport.handleRequest(req, res);
        sessions.delete(sessionId);
        return;
      }
      res.writeHead(204);
      res.end();
      return;
    }

    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  });

  // Clean up stale sessions every 30 minutes
  setInterval(() => {
    // Sessions are cleaned up on close, this is a safety net
    if (sessions.size > 100) {
      console.log(`[hq-mcp] Warning: ${sessions.size} active sessions`);
    }
  }, 30 * 60 * 1000);

  httpServer.listen(PORT, () => {
    console.log(`[hq-mcp] Streamable HTTP MCP server running on http://localhost:${PORT}/mcp`);
    console.log(`[hq-mcp] 28 tools registered (hq_*)`);
  });
}

main().catch((err) => {
  console.error('[hq-mcp] Fatal:', err);
  process.exit(1);
});
