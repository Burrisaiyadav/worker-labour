const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataPath = path.join(__dirname, '../data/attendance.json');

// Ensure data directory and file exist
if (!fs.existsSync(path.dirname(dataPath))) {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
}
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([]));
}

class AttendanceJSON {
    constructor(data) {
        this.id = data.id || uuidv4();
        this.farmerId = data.farmerId;
        this.farmerName = data.farmerName;
        this.labourId = data.labourId;
        this.labourName = data.labourName;
        this.timestamp = data.timestamp || new Date();
    }

    static async find(query = {}) {
        const records = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        let filtered = records;

        if (query.farmerId) {
            filtered = filtered.filter(r => r.farmerId === query.farmerId);
        }
        if (query.labourId) {
            filtered = filtered.filter(r => r.labourId === query.labourId);
        }

        return filtered.map(r => new AttendanceJSON(r));
    }

    async save() {
        const records = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const existingIndex = records.findIndex(r => r.id === this.id);

        if (existingIndex >= 0) {
            records[existingIndex] = { ...this };
        } else {
            records.push({ ...this });
        }

        fs.writeFileSync(dataPath, JSON.stringify(records, null, 2));
        return this;
    }
}

module.exports = AttendanceJSON;
