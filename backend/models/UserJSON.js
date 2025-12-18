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
        this.profileImage = data.profileImage || '';
        this.loginOtp = data.loginOtp;
        this.loginOtpExpire = data.loginOtpExpire ? new Date(data.loginOtpExpire) : undefined;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = new Date();
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
            foundUser = users.find(u => u.mobile === query.mobile);
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
