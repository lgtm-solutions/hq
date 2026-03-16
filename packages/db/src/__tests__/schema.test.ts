import { describe, it, expect } from 'vitest';
import { projects, projectChannels, tasks, subtasks, comments } from '../schema.js';

describe('schema', () => {
  it('exports projects table with expected columns', () => {
    expect(projects).toBeDefined();
    const columns = Object.keys(projects);
    expect(columns).toContain('id');
    expect(columns).toContain('name');
    expect(columns).toContain('git');
    expect(columns).toContain('description');
    expect(columns).toContain('metadata');
    expect(columns).toContain('createdAt');
    expect(columns).toContain('updatedAt');
  });

  it('exports projectChannels table with expected columns', () => {
    expect(projectChannels).toBeDefined();
    const columns = Object.keys(projectChannels);
    expect(columns).toContain('id');
    expect(columns).toContain('projectId');
    expect(columns).toContain('channelId');
    expect(columns).toContain('createdAt');
  });

  it('exports tasks table with expected columns', () => {
    expect(tasks).toBeDefined();
    const columns = Object.keys(tasks);
    expect(columns).toContain('id');
    expect(columns).toContain('companyId');
    expect(columns).toContain('projectId');
    expect(columns).toContain('title');
    expect(columns).toContain('description');
    expect(columns).toContain('status');
    expect(columns).toContain('priority');
    expect(columns).toContain('assignee');
    expect(columns).toContain('labels');
    expect(columns).toContain('metadata');
    expect(columns).toContain('createdAt');
    expect(columns).toContain('updatedAt');
  });

  it('exports subtasks table with expected columns', () => {
    expect(subtasks).toBeDefined();
    const columns = Object.keys(subtasks);
    expect(columns).toContain('id');
    expect(columns).toContain('taskId');
    expect(columns).toContain('title');
    expect(columns).toContain('description');
    expect(columns).toContain('status');
    expect(columns).toContain('assignee');
    expect(columns).toContain('sortOrder');
    expect(columns).toContain('createdAt');
    expect(columns).toContain('updatedAt');
  });

  it('exports comments table with expected columns', () => {
    expect(comments).toBeDefined();
    const columns = Object.keys(comments);
    expect(columns).toContain('id');
    expect(columns).toContain('taskId');
    expect(columns).toContain('subtaskId');
    expect(columns).toContain('author');
    expect(columns).toContain('body');
    expect(columns).toContain('metadata');
    expect(columns).toContain('createdAt');
  });
});
