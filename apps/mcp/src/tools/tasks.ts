import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { db } from '../db.js';
import { tasks, subtasks, comments } from '@hq/db/schema';
import { eq, and, desc, asc, type SQL } from '@hq/db/drizzle';

export function registerTaskTools(server: McpServer) {
  server.tool(
    'hq_list_tasks',
    'List tasks with optional filters',
    {
      companyId: z.string().optional().describe('Filter by company slug'),
      status: z.string().optional().describe('Filter by status (open, in_progress, review, done, closed)'),
      projectId: z.string().uuid().optional().describe('Filter by project UUID'),
      assignee: z.string().optional().describe('Filter by assignee name'),
    },
    async ({ companyId, status, projectId, assignee }) => {
      const conditions: SQL[] = [];
      if (companyId) conditions.push(eq(tasks.companyId, companyId));
      if (status) conditions.push(eq(tasks.status, status));
      if (projectId) conditions.push(eq(tasks.projectId, projectId));
      if (assignee) conditions.push(eq(tasks.assignee, assignee));

      const query = db.select().from(tasks).orderBy(desc(tasks.createdAt));
      const results = conditions.length > 0
        ? await query.where(and(...conditions))
        : await query;

      return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
    }
  );

  server.tool(
    'hq_get_task',
    'Get a task by ID with its subtasks and comments',
    { id: z.string().uuid().describe('Task UUID') },
    async ({ id }) => {
      const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
      if (!task) {
        return { isError: true, content: [{ type: 'text', text: 'Task not found' }] };
      }

      const taskSubtasks = await db.select().from(subtasks).where(eq(subtasks.taskId, id)).orderBy(asc(subtasks.sortOrder));
      const taskComments = await db.select().from(comments).where(eq(comments.taskId, id)).orderBy(asc(comments.createdAt));

      return {
        content: [{ type: 'text', text: JSON.stringify({ ...task, subtasks: taskSubtasks, comments: taskComments }, null, 2) }],
      };
    }
  );

  server.tool(
    'hq_create_task',
    'Create a new task',
    {
      companyId: z.string().describe('Company slug (required)'),
      title: z.string().describe('Task title (required)'),
      description: z.string().optional().describe('Task description'),
      projectId: z.string().uuid().optional().describe('Project UUID'),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional().describe('Priority level'),
      assignee: z.string().optional().describe('Assignee name'),
      labels: z.array(z.string()).optional().describe('Labels array'),
      metadata: z.record(z.unknown()).optional().describe('Arbitrary metadata'),
    },
    async ({ companyId, title, description, projectId, priority, assignee, labels, metadata }) => {
      const [created] = await db
        .insert(tasks)
        .values({
          companyId,
          title,
          description: description || null,
          projectId: projectId || null,
          priority: priority || 'medium',
          assignee: assignee || null,
          labels: labels || [],
          metadata: metadata || null,
        })
        .returning();

      return { content: [{ type: 'text', text: JSON.stringify(created, null, 2) }] };
    }
  );

  server.tool(
    'hq_update_task',
    'Update an existing task',
    {
      id: z.string().uuid().describe('Task UUID'),
      title: z.string().optional().describe('New title'),
      description: z.string().optional().describe('New description'),
      status: z.string().optional().describe('New status'),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional().describe('New priority'),
      assignee: z.string().optional().describe('New assignee'),
      labels: z.array(z.string()).optional().describe('New labels'),
      metadata: z.record(z.unknown()).optional().describe('New metadata'),
    },
    async ({ id, title, description, status, priority, assignee, labels, metadata }) => {
      const [updated] = await db
        .update(tasks)
        .set({
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(status !== undefined && { status }),
          ...(priority !== undefined && { priority }),
          ...(assignee !== undefined && { assignee }),
          ...(labels !== undefined && { labels }),
          ...(metadata !== undefined && { metadata }),
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, id))
        .returning();

      if (!updated) {
        return { isError: true, content: [{ type: 'text', text: 'Task not found' }] };
      }
      return { content: [{ type: 'text', text: JSON.stringify(updated, null, 2) }] };
    }
  );

  server.tool(
    'hq_delete_task',
    'Delete a task and its subtasks/comments',
    { id: z.string().uuid().describe('Task UUID') },
    async ({ id }) => {
      const [deleted] = await db.delete(tasks).where(eq(tasks.id, id)).returning();
      if (!deleted) {
        return { isError: true, content: [{ type: 'text', text: 'Task not found' }] };
      }
      return { content: [{ type: 'text', text: `Task ${id} deleted` }] };
    }
  );
}
