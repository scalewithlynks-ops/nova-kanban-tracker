const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Data storage paths
const DATA_DIR = './data';
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const JOURNAL_FILE = path.join(DATA_DIR, 'journal.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Initialize data files if they don't exist
async function initializeData() {
    await ensureDataDir();
    
    try {
        await fs.access(TASKS_FILE);
    } catch {
        const defaultTasks = {
            'sam-scripts': {
                title: 'Sam Ad Script Review',
                description: 'Final review with Austin for video shoot',
                status: 'Urgent',
                category: 'LYNKS',
                assignee: 'Austin',
                priority: 'Urgent',
                tokens: '~$3 tokens',
                currentStatus: 'To Do',
                detailedDesc: 'Complete final review of ad scripts for Sam\'s video shoot campaign.',
                subtasks: [
                    { text: 'Review script hooks for engagement', tokens: '$1', completed: false },
                    { text: 'Check messaging alignment with LYNKS brand', tokens: '$1', completed: false },
                    { text: 'Finalize call-to-action language', tokens: '$1', completed: false }
                ],
                updatedAt: new Date().toISOString()
            }
        };
        await fs.writeFile(TASKS_FILE, JSON.stringify(defaultTasks, null, 2));
    }
    
    try {
        await fs.access(JOURNAL_FILE);
    } catch {
        await fs.writeFile(JOURNAL_FILE, JSON.stringify([], null, 2));
    }
}

// API Routes

// Get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const data = await fs.readFile(TASKS_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Failed to load tasks' });
    }
});

// Update task status
app.put('/api/tasks/:taskId/status', async (req, res) => {
    try {
        const { taskId } = req.params;
        const { currentStatus } = req.body;
        
        const data = await fs.readFile(TASKS_FILE, 'utf8');
        const tasks = JSON.parse(data);
        
        if (tasks[taskId]) {
            tasks[taskId].currentStatus = currentStatus;
            tasks[taskId].updatedAt = new Date().toISOString();
            
            await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
            res.json({ success: true, task: tasks[taskId] });
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// Add new task
app.post('/api/tasks', async (req, res) => {
    try {
        const taskData = req.body;
        const taskId = req.body.id || Date.now().toString();
        
        const data = await fs.readFile(TASKS_FILE, 'utf8');
        const tasks = JSON.parse(data);
        
        tasks[taskId] = {
            ...taskData,
            updatedAt: new Date().toISOString()
        };
        
        await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
        res.json({ success: true, taskId, task: tasks[taskId] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add task' });
    }
});

// Journal entries

// Get journal entries
app.get('/api/journal', async (req, res) => {
    try {
        const data = await fs.readFile(JOURNAL_FILE, 'utf8');
        const entries = JSON.parse(data);
        res.json(entries.slice(-50)); // Return last 50 entries
    } catch (error) {
        res.status(500).json({ error: 'Failed to load journal' });
    }
});

// Add journal entry
app.post('/api/journal', async (req, res) => {
    try {
        const { entry } = req.body;
        
        const data = await fs.readFile(JOURNAL_FILE, 'utf8');
        const entries = JSON.parse(data);
        
        const newEntry = {
            id: Date.now(),
            entry,
            timestamp: new Date().toISOString(),
            date: new Date().toDateString()
        };
        
        entries.push(newEntry);
        
        await fs.writeFile(JOURNAL_FILE, JSON.stringify(entries, null, 2));
        res.json({ success: true, entry: newEntry });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add journal entry' });
    }
});

// Quick API endpoint for Nova to update status
app.post('/api/nova/update', async (req, res) => {
    try {
        const { taskId, status, journalEntry } = req.body;
        
        // Update task if provided
        if (taskId && status) {
            const tasksData = await fs.readFile(TASKS_FILE, 'utf8');
            const tasks = JSON.parse(tasksData);
            
            if (tasks[taskId]) {
                tasks[taskId].currentStatus = status;
                tasks[taskId].updatedAt = new Date().toISOString();
                await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
            }
        }
        
        // Add journal entry if provided
        if (journalEntry) {
            const journalData = await fs.readFile(JOURNAL_FILE, 'utf8');
            const entries = JSON.parse(journalData);
            
            entries.push({
                id: Date.now(),
                entry: journalEntry,
                timestamp: new Date().toISOString(),
                date: new Date().toDateString()
            });
            
            await fs.writeFile(JOURNAL_FILE, JSON.stringify(entries, null, 2));
        }
        
        res.json({ success: true, message: 'Updates applied' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to apply updates' });
    }
});

// Serve the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize and start server
async function startServer() {
    await initializeData();
    app.listen(PORT, () => {
        console.log(`Nova Kanban Tracker API running on port ${PORT}`);
    });
}

startServer().catch(console.error);