const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataPath = path.join(__dirname, '../data/users.json');

// Ensure data directory and file exist
if (!fs.existsSync(path.dirname(dataPath))) {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
}
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([]));
}

class UserJSON {
    constructor(data) {
        this.id = data.id || uuidv4();
        this.name = data.name;
        this.role = data.role || 'farmer';
        this.mobile = data.mobile || '';
        this.location = data.location || '';
        this.gender = data.gender || '';
        this.skills = data.skills || [];
        this.crops = data.crops || [];
        this.farmSize = data.farmSize || '';
        this.experience = data.experience || '';
        this.radius = data.radius || '';
        this.rate = data.rate || '';
        this.accountType = data.accountType || 'individual'; // 'individual' or 'group'
        this.groupMembersCount = data.groupMembersCount || 0;
        this.loginOtp = data.loginOtp;
        this.loginOtpExpire = data.loginOtpExpire ? new Date(data.loginOtpExpire) : undefined;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = new Date();
    }

    static async find(query = {}) {
        const users = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        let filteredUsers = users;

        if (query.role) {
            const roleToFind = query.role.toLowerCase();
            if (roleToFind === 'labour' || roleToFind === 'laborer') {
                filteredUsers = filteredUsers.filter(u => u.role === 'labour' || u.role === 'laborer');
            } else {
                filteredUsers = filteredUsers.filter(u => u.role === roleToFind);
            }
        }

        return filteredUsers.map(u => new UserJSON(u));
    }

    static async findById(id) {
        const users = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const foundUser = users.find(u => u.id === id);
        return foundUser ? new UserJSON(foundUser) : null;
    }

    static async findOne(query) {
        const users = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        let foundUser = null;
        if (query.mobile) {
            const searchMobile = query.mobile.trim();
            foundUser = users.find(u => u.mobile.trim() === searchMobile);
        } else if (query.loginOtp && query.loginOtpExpire) {
            // For Login OTP Verification
            const now = new Date();
            foundUser = users.find(u =>
                u.loginOtp === query.loginOtp &&
                new Date(u.loginOtpExpire) > now
            );
        }

        return foundUser ? new UserJSON(foundUser) : null;
    }

    async save() {
        const users = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        // If ID is a UUID or missing, generate a short sequenced ID (username-0001)
        const isUuid = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

        if (!this.id || isUuid(this.id)) {
            const originalId = this.id;
            const namePrefix = (this.name || 'user').toLowerCase().replace(/\s+/g, '').substring(0, 8);
            const others = users.filter(u => u.id && u.id.startsWith(`${namePrefix}-`));
            let maxSeq = 0;
            others.forEach(u => {
                const parts = u.id.split('-');
                const seq = parseInt(parts[parts.length - 1]);
                if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
            });
            this.id = `${namePrefix}-${String(maxSeq + 1).padStart(4, '0')}`;

            // If we replaced a UUID, we should ideally update other collections, 
            // but for now we primarily care about new users or clean display.
            console.log(`Migrated/Generated ID: ${originalId || 'new'} -> ${this.id}`);
        }

        const existingIndex = users.findIndex(u => u.id === this.id);

        if (existingIndex >= 0) {
            users[existingIndex] = { ...this };
        } else {
            users.push({ ...this });
        }

        fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
        return this;
    }
}

module.exports = UserJSON;
