const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataPath = path.join(__dirname, '../data/jobs.json');

// Ensure data directory and file exist
if (!fs.existsSync(path.dirname(dataPath))) {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
}
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([]));
}

class JobJSON {
    constructor(data) {
        this.id = data.id || uuidv4();
        this.userId = data.userId; // Link to user
        this.farmerName = data.farmerName; // Added farmerName
        this.title = data.title;
        this.date = data.date;
        this.workers = data.workers;
        this.cost = data.cost;
        this.description = data.description;
        this.location = data.location;
        this.image = data.image;
        this.status = data.status || 'Active'; // Active, In Progress, Completed
        this.assignedTo = data.assignedTo || null; // Labour ID
        this.paymentStatus = data.paymentStatus || 'Pending'; // Pending, Paid
        this.paymentRequested = data.paymentRequested || false; // Added
        this.paymentId = data.paymentId || null;
        this.createdAt = data.createdAt || new Date();
    }

    static async find(query = {}) {
        const jobs = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        let filteredJobs = jobs;

        if (query.userId) {
            filteredJobs = filteredJobs.filter(job => job.userId === query.userId);
        }

        // Add sorting by date (newest first)
        return filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(j => new JobJSON(j));
    }

    static async findById(id) {
        const jobs = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const foundJob = jobs.find(j => j.id === id);
        return foundJob ? new JobJSON(foundJob) : null;
    }

    async save() {
        const jobs = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const existingIndex = jobs.findIndex(j => j.id === this.id);

        if (existingIndex >= 0) {
            jobs[existingIndex] = { ...this };
        } else {
            jobs.push({ ...this });
        }

        fs.writeFileSync(dataPath, JSON.stringify(jobs, null, 2));
        return this;
    }
}

module.exports = JobJSON;
