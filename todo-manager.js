#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const TODO_FILE = path.join(__dirname, 'TODO.md');
const TODO_HISTORY = path.join(__dirname, 'TODO_HISTORY.md');

class TodoManager {
    constructor() {
        this.ensureFiles();
    }

    ensureFiles() {
        if (!fs.existsSync(TODO_HISTORY)) {
            fs.writeFileSync(TODO_HISTORY, '# TODO History Archive\n\n');
        }
    }

    readTodos() {
        const content = fs.readFileSync(TODO_FILE, 'utf8');
        const todos = {
            high: [],
            medium: [],
            low: [],
            completed: []
        };

        let currentSection = null;
        const lines = content.split('\n');

        for (const line of lines) {
            if (line.includes('🔴 High Priority')) currentSection = 'high';
            else if (line.includes('🟡 Medium Priority')) currentSection = 'medium';
            else if (line.includes('🟢 Low Priority')) currentSection = 'low';
            else if (line.includes('## Completed Tasks')) currentSection = 'completed';
            else if (line.startsWith('- [ ]') && currentSection) {
                todos[currentSection].push({
                    text: line.replace('- [ ] ', ''),
                    done: false
                });
            } else if (line.startsWith('- [x]') && currentSection) {
                todos[currentSection].push({
                    text: line.replace('- [x] ', ''),
                    done: true
                });
            }
        }

        return todos;
    }

    addTodo(text, priority = 'medium') {
        const content = fs.readFileSync(TODO_FILE, 'utf8');
        const lines = content.split('\n');
        
        const priorityMarkers = {
            high: '🔴 High Priority',
            medium: '🟡 Medium Priority',
            low: '🟢 Low Priority'
        };

        const markerIndex = lines.findIndex(line => line.includes(priorityMarkers[priority]));
        if (markerIndex !== -1) {
            lines.splice(markerIndex + 1, 0, `- [ ] ${text}`);
        }

        fs.writeFileSync(TODO_FILE, lines.join('\n'));
        console.log(`✅ Added todo: "${text}" with ${priority} priority`);
    }

    completeTodo(searchText) {
        const content = fs.readFileSync(TODO_FILE, 'utf8');
        const lines = content.split('\n');
        const date = new Date().toISOString().split('T')[0];
        
        let found = false;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(searchText) && lines[i].startsWith('- [ ]')) {
                const completedText = lines[i].replace('- [ ]', `- [x]`) + ` (Completed: ${date})`;
                lines.splice(i, 1);
                
                const completedIndex = lines.findIndex(line => line.includes('## Completed Tasks'));
                if (completedIndex !== -1) {
                    lines.splice(completedIndex + 2, 0, completedText);
                }
                
                found = true;
                break;
            }
        }

        if (found) {
            fs.writeFileSync(TODO_FILE, lines.join('\n'));
            console.log(`✅ Completed todo: "${searchText}"`);
            this.archiveCompleted();
        } else {
            console.log(`❌ Todo not found: "${searchText}"`);
        }
    }

    archiveCompleted() {
        const content = fs.readFileSync(TODO_FILE, 'utf8');
        const historyContent = fs.readFileSync(TODO_HISTORY, 'utf8');
        
        const completedSection = content.split('## Completed Tasks')[1]?.split('##')[0] || '';
        const completedTasks = completedSection.split('\n')
            .filter(line => line.startsWith('- [x]'))
            .filter(line => line.includes('Completed: '));
        
        if (completedTasks.length > 5) {
            const tasksToArchive = completedTasks.slice(0, -5);
            const remainingTasks = completedTasks.slice(-5);
            
            const newHistory = historyContent + '\n' + tasksToArchive.join('\n');
            fs.writeFileSync(TODO_HISTORY, newHistory);
            
            const updatedContent = content.replace(
                completedSection,
                '\n' + remainingTasks.join('\n') + '\n'
            );
            fs.writeFileSync(TODO_FILE, updatedContent);
        }
    }

    listTodos() {
        const todos = this.readTodos();
        console.log('\n📋 Current TODOs:\n');
        
        if (todos.high.length > 0) {
            console.log('🔴 High Priority:');
            todos.high.forEach(todo => console.log(`  - ${todo.text}`));
        }
        
        if (todos.medium.length > 0) {
            console.log('\n🟡 Medium Priority:');
            todos.medium.forEach(todo => console.log(`  - ${todo.text}`));
        }
        
        if (todos.low.length > 0) {
            console.log('\n🟢 Low Priority:');
            todos.low.forEach(todo => console.log(`  - ${todo.text}`));
        }
        
        if (todos.completed.length > 0) {
            console.log('\n✅ Recently Completed:');
            todos.completed.slice(-3).forEach(todo => console.log(`  - ${todo.text}`));
        }
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const manager = new TodoManager();
    
    switch(args[0]) {
        case 'add':
            const priority = args.includes('--high') ? 'high' : 
                           args.includes('--low') ? 'low' : 'medium';
            const text = args.slice(1).filter(arg => !arg.startsWith('--')).join(' ');
            manager.addTodo(text, priority);
            break;
            
        case 'done':
        case 'complete':
            manager.completeTodo(args.slice(1).join(' '));
            break;
            
        case 'list':
        default:
            manager.listTodos();
            break;
    }
}

module.exports = TodoManager;