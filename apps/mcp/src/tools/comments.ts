import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { db } from '../db.js';
import { comments } from '@hq/db/schema';
import { eq, asc } from '@hq/db/drizzle';

export function registerCommentTools(server: McpServer) {
  server.tool(
    'hq_list_comments',
    'List comments for a task or subtask',
    {
      taskId: z.string().uuid().optional().describe('Filter by task UUID'),
      subtaskId: z.string().uuid().optional().describe('Filter by subtask UUID'),
    },
    async ({ taskId, subtaskId }) => {
      if (!taskId && !subtaskId) {
        return { isError: true, content: [{ type: 'text', text: 'Either taskId or subtaskId is required' }] };
      }

      const condition = taskId ? eq(comments.taskId, taskId) : eq(comments.subtaskId, subtaskId!);
      const results = await db
        .select()
        .from(comments)
        .where(condition)
        .orderBy(asc(comments.createdAt));

      return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
    }
  );

  server.tool(
    'hq_create_comment',
    'Create a comment on a task or subtask',
    {
      author: z.string().describe('Comment author name'),
      body: z.string().describe('Comment body text'),
      taskId: z.string().uuid().optional().describe('Task UUID (provide this or subtaskId)'),
      subtaskId: z.string().uuid().optional().describe('Subtask UUID (provide this or taskId)'),
      metadata: z.record(z.unknown()).optional().describe('Arbitrary metadata'),
    },
    async ({ author, body, taskId, subtaskId, metadata }) => {
      if (!taskId && !subtaskId) {
        return { isError: true, content: [{ type: 'text', text: 'Either taskId or subtaskId is required' }] };
      }

      const [created] = await db
        .insert(comments)
        .values({
          author,
          body,
          taskId: taskId || null,
          subtaskId: subtaskId || null,
          metadata: metadata || null,
        })
        .returning();

      return { content: [{ type: 'text', text: JSON.stringify(created, null, 2) }] };
    }
  );
}
