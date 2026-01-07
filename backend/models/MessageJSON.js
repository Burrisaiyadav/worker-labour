const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataPath = path.join(__dirname, '../data/messages.json');

// Ensure data directory and file exist
if (!fs.existsSync(path.dirname(dataPath))) {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
}
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([]));
}

class MessageJSON {
    constructor(data) {
        this.id = data.id || uuidv4();
        this.senderId = data.senderId;
        this.receiverId = data.receiverId;
        this.content = data.content;
        this.timestamp = data.timestamp || new Date();
        this.read = data.read || false;
    }

    static async find(query = {}) {
        const messages = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        let filteredMessages = messages;

        if (query.senderId && query.receiverId) {
            filteredMessages = messages.filter(m =>
                (m.senderId === query.senderId && m.receiverId === query.receiverId) ||
                (m.senderId === query.receiverId && m.receiverId === query.senderId)
            );
        }

        return filteredMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).map(m => new MessageJSON(m));
    }

    async save() {
        const messages = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const existingIndex = messages.findIndex(m => m.id === this.id);

        if (existingIndex >= 0) {
            messages[existingIndex] = { ...this };
        } else {
            messages.push({ ...this });
        }

        fs.writeFileSync(dataPath, JSON.stringify(messages, null, 2));
        return this;
    }

    static async deleteMany(query = {}) {
        const messages = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        let filteredMessages = messages;

        if (query.senderId && query.receiverId) {
            filteredMessages = messages.filter(m =>
                !((m.senderId === query.senderId && m.receiverId === query.receiverId) ||
                    (m.senderId === query.receiverId && m.receiverId === query.senderId))
            );
        }

        fs.writeFileSync(dataPath, JSON.stringify(filteredMessages, null, 2));
        return true;
    }
}

module.exports = MessageJSON;
