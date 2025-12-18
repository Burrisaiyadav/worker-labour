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
        this.rating = data.rating;
        this.members = data.members;
        this.rate = data.rate;
        this.contact = data.contact;
        this.location = data.location; // "Punjab", "Maharashtra", etc. - used for filtering
        this.image = data.image || 'https://images.unsplash.com/photo-1595959154942-8874f6762391?auto=format&fit=crop&q=80&w=100';
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

        if (existingIndex >= 0) {
            groups[existingIndex] = { ...this };
        } else {
            groups.push({ ...this });
        }

        fs.writeFileSync(dataPath, JSON.stringify(groups, null, 2));
        return this;
    }
}

module.exports = LabourGroupJSON;
