import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { db } from '../db.js';
import { subtasks, comments } from '@hq/db/schema';
import { eq, asc } from '@hq/db/drizzle';

export function registerSubtaskTools(server: McpServer) {
  server.tool(
    'hq_list_subtasks',
    'List subtasks for a given task',
    { taskId: z.string().uuid().describe('Parent task UUID') },
    async ({ taskId }) => {
      const results = await db
        .select()
        .from(subtasks)
        .where(eq(subtasks.taskId, taskId))
        .orderBy(asc(subtasks.sortOrder));

      return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
    }
  );

  server.tool(
    'hq_get_subtask',
    'Get a subtask by ID with its comments',
    { id: z.string().uuid().describe('Subtask UUID') },
    async ({ id }) => {
      const [subtask] = await db.select().from(subtasks).where(eq(subtasks.id, id));
      if (!subtask) {
        return { isError: true, content: [{ type: 'text', text: 'Subtask not found' }] };
      }

      const subtaskComments = await db
        .select()
        .from(comments)
        .where(eq(comments.subtaskId, id))
        .orderBy(asc(comments.createdAt));

      return {
        content: [{ type: 'text', text: JSON.stringify({ ...subtask, comments: subtaskComments }, null, 2) }],
      };
    }
  );

  server.tool(
    'hq_create_subtask',
    'Create a new subtask under a task',
    {
      taskId: z.string().uuid().describe('Parent task UUID'),
      title: z.string().describe('Subtask title'),
      description: z.string().optional().describe('Subtask description'),
      assignee: z.string().optional().describe('Assignee name'),
      sortOrder: z.number().int().optional().describe('Sort order (default: appended last)'),
    },
    async ({ taskId, title, description, assignee, sortOrder }) => {
      let order = sortOrder;
      if (order === undefined) {
        const existing = await db.select().from(subtasks).where(eq(subtasks.taskId, taskId));
        order = existing.length;
      }

      const [created] = await db
        .insert(subtasks)
        .values({
          taskId,
          title,
          description: description || null,
          assignee: assignee || null,
          sortOrder: order,
        })
        .returning();

      return { content: [{ type: 'text', text: JSON.stringify(created, null, 2) }] };
    }
  );

  server.tool(
    'hq_update_subtask',
    'Update an existing subtask',
    {
      id: z.string().uuid().describe('Subtask UUID'),
      title: z.string().optional().describe('New title'),
      description: z.string().optional().describe('New description'),
      status: z.enum(['todo', 'done']).optional().describe('New status'),
      assignee: z.string().optional().describe('New assignee'),
      sortOrder: z.number().int().optional().describe('New sort order'),
    },
    async ({ id, title, description, status, assignee, sortOrder }) => {
      const [updated] = await db
        .update(subtasks)
        .set({
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(status !== undefined && { status }),
          ...(assignee !== undefined && { assignee }),
          ...(sortOrder !== undefined && { sortOrder }),
          updatedAt: new Date(),
        })
        .where(eq(subtasks.id, id))
        .returning();

      if (!updated) {
        return { isError: true, content: [{ type: 'text', text: 'Subtask not found' }] };
      }
      return { content: [{ type: 'text', text: JSON.stringify(updated, null, 2) }] };
    }
  );

  server.tool(
    'hq_delete_subtask',
    'Delete a subtask',
    { id: z.string().uuid().describe('Subtask UUID') },
    async ({ id }) => {
      const [deleted] = await db.delete(subtasks).where(eq(subtasks.id, id)).returning();
      if (!deleted) {
        return { isError: true, content: [{ type: 'text', text: 'Subtask not found' }] };
      }
      return { content: [{ type: 'text', text: `Subtask ${id} deleted` }] };
    }
  );
}
