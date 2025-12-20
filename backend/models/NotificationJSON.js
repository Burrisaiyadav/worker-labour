const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataPath = path.join(__dirname, '../data/notifications.json');

// Ensure data directory and file exist
if (!fs.existsSync(path.dirname(dataPath))) {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
}
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([]));
}

class NotificationJSON {
    constructor(data) {
        this.id = data.id || uuidv4();
        this.userId = data.userId;
        this.title = data.title;
        this.message = data.message;
        this.type = data.type || 'info'; // payment, job, alert, info
        this.read = data.read || false;
        this.createdAt = data.createdAt || new Date();
    }

    static async find(query = {}) {
        const notifications = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        let filtered = notifications;
        if (query.userId) {
            filtered = filtered.filter(n => n.userId === query.userId);
        }
        return filtered.map(n => new NotificationJSON(n)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    static async findById(id) {
        const notifications = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const found = notifications.find(n => n.id === id);
        return found ? new NotificationJSON(found) : null;
    }

    async save() {
        const notifications = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const existingIndex = notifications.findIndex(n => n.id === this.id);

        if (existingIndex >= 0) {
            notifications[existingIndex] = { ...this };
        } else {
            notifications.push({ ...this });
        }

        fs.writeFileSync(dataPath, JSON.stringify(notifications, null, 2));
        return this;
    }
}

module.exports = NotificationJSON;
