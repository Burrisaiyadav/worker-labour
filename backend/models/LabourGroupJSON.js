const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataPath = path.join(__dirname, '../data/labourGroups.json');

// Ensure data directory and file exist
if (!fs.existsSync(path.dirname(dataPath))) {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
}
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([]));
}

class LabourGroupJSON {
    constructor(data) {
        this.id = data.id || uuidv4();
        this.name = data.name;
        this.rating = data.rating || 4.5; // Default initial rating
        this.ratingCount = data.ratingCount || 0;
        this.members = Array.isArray(data.members) ? data.members : [];
        this.joinRequests = Array.isArray(data.joinRequests) ? data.joinRequests : [];
        this.pendingInvites = Array.isArray(data.pendingInvites) ? data.pendingInvites : [];
        this.adminId = data.adminId ? String(data.adminId) : null;
        this.rate = data.rate;
        this.contact = data.contact;
        this.location = data.location;
        this.image = data.image || 'https://images.unsplash.com/photo-1595959154942-8874f6762391?auto=format&fit=crop&q=80&w=100';

        // Support both real array and legacy hardcoded counts
        this.membersCount = Array.isArray(data.members) ? data.members.length : (typeof data.members === 'number' ? data.members : 0);
    }

    static async find(query = {}) {
        const groups = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        // Simple filtering
        let filtered = groups;
        if (query.location) {
            // Case-insensitive inclusion check
            const searchLoc = query.location.toLowerCase();
            filtered = filtered.filter(g =>
                g.location && g.location.toLowerCase().includes(searchLoc)
            );
        }

        return filtered.map(g => new LabourGroupJSON(g));
    }

    async save() {
        const groups = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const existingIndex = groups.findIndex(g => g.id === this.id);

        // Ensure membersCount is always current before saving
        if (Array.isArray(this.members)) {
            this.membersCount = this.members.length;
        }

        if (existingIndex >= 0) {
            groups[existingIndex] = { ...this };
        } else {
            groups.push({ ...this });
        }

        fs.writeFileSync(dataPath, JSON.stringify(groups, null, 2));
        return this;
    }

    static async delete(id) {
        const groups = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const filtered = groups.filter(g => g.id !== id);
        fs.writeFileSync(dataPath, JSON.stringify(filtered, null, 2));
        return true;
    }
}

module.exports = LabourGroupJSON;
