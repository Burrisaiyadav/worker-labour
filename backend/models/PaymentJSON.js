const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataPath = path.join(__dirname, '../data/payments.json');

// Ensure data directory and file exist
if (!fs.existsSync(path.dirname(dataPath))) {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
}
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([]));
}

class PaymentJSON {
    constructor(data) {
        this.id = data.id || uuidv4();
        this.payerId = data.payerId;
        this.payeeId = data.payeeId;
        this.amount = data.amount;
        this.status = data.status || 'Completed';
        this.timestamp = data.timestamp || new Date();
        this.details = data.details || 'Payment for labour services';
    }

    static async find(query = {}) {
        const payments = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        // Basic filtering if needed
        return payments.map(p => new PaymentJSON(p));
    }

    async save() {
        const payments = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        payments.push({ ...this });
        fs.writeFileSync(dataPath, JSON.stringify(payments, null, 2));
        return this;
    }
}

module.exports = PaymentJSON;
