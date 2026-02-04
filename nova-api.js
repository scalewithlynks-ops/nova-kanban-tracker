/**
 * Nova's Kanban API Helper
 * Provides simple functions for Nova to update the kanban board via API calls
 */

const BASE_URL = 'https://nova-kanban-tracker-production.up.railway.app';

class NovaKanbanAPI {
    
    // Move task to new status
    async moveTask(taskId, newStatus) {
        try {
            const response = await fetch(`${BASE_URL}/api/tasks/${taskId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentStatus: newStatus })
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to move task:', error);
            return { error: error.message };
        }
    }
    
    // Add journal entry
    async addJournalEntry(entry) {
        try {
            const response = await fetch(`${BASE_URL}/api/journal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entry })
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to add journal entry:', error);
            return { error: error.message };
        }
    }
    
    // Add new task
    async addTask(taskData) {
        try {
            const response = await fetch(`${BASE_URL}/api/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to add task:', error);
            return { error: error.message };
        }
    }
    
    // Quick update (task status + journal entry in one call)
    async quickUpdate(updates) {
        try {
            const response = await fetch(`${BASE_URL}/api/nova/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to apply updates:', error);
            return { error: error.message };
        }
    }
    
    // Get current board state
    async getTasks() {
        try {
            const response = await fetch(`${BASE_URL}/api/tasks`);
            return await response.json();
        } catch (error) {
            console.error('Failed to get tasks:', error);
            return { error: error.message };
        }
    }
    
    // Get journal entries
    async getJournal() {
        try {
            const response = await fetch(`${BASE_URL}/api/journal`);
            return await response.json();
        } catch (error) {
            console.error('Failed to get journal:', error);
            return { error: error.message };
        }
    }
}

// Example usage for Nova:
/*
const kanban = new NovaKanbanAPI();

// Move a task
await kanban.moveTask('sam-scripts', 'In Progress');

// Add journal entry
await kanban.addJournalEntry('Fixed modal bug in kanban board - now shows correct subtasks for each card');

// Quick update (both at once)
await kanban.quickUpdate({
    taskId: 'sam-scripts',
    status: 'Done',
    journalEntry: 'Completed Sam ad script review - ready for Austin approval'
});

// Add new task
await kanban.addTask({
    id: 'blog-post-feb5',
    title: 'Sam McGuire Blog Post',
    description: 'The $40K Mistake Most Glen Abbey Buyers Make',
    status: 'Urgent',
    category: 'LYNKS',
    currentStatus: 'In Progress',
    assignee: 'Nova',
    priority: 'Urgent',
    tokens: '~$2 tokens'
});
*/

module.exports = NovaKanbanAPI;