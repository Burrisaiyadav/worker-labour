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
        this.email = data.email;
        this.password = data.password;
        this.role = data.role || 'farmer';
        this.resetPasswordOtp = data.resetPasswordOtp;
        this.resetPasswordOtpExpire = data.resetPasswordOtpExpire ? new Date(data.resetPasswordOtpExpire) : undefined;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = new Date();
    }

    static async findOne(query) {
        const users = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        let foundUser = null;
        if (query.email) {
            foundUser = users.find(u => u.email === query.email);
        } else if (query.resetPasswordOtp && query.resetPasswordOtpExpire) {
            // For Reset Password (check OTP and Expiry)
            const now = new Date();
            foundUser = users.find(u =>
                u.resetPasswordOtp === query.resetPasswordOtp &&
                new Date(u.resetPasswordOtpExpire) > now
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
