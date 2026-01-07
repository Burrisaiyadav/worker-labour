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
