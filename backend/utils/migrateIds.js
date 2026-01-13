const fs = require('fs');
const path = require('path');

const dataDir = 'c:/Farmapp/worker-labour/backend/data';
const files = ['users.json', 'jobs.json', 'notifications.json', 'messages.json', 'labourGroups.json', 'attendance.json', 'payments.json'];

const idMap = {};
const isUuid = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

// 1. Generate Mapping from users.json
const usersPath = path.join(dataDir, 'users.json');
const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
const nameCounts = {};

users.forEach(u => {
    if (isUuid(u.id)) {
        const namePrefix = (u.name || 'user').toLowerCase().replace(/\s+/g, '').substring(0, 8) || 'user';
        nameCounts[namePrefix] = (nameCounts[namePrefix] || 0) + 1;
        const newId = `${namePrefix}-${String(nameCounts[namePrefix]).padStart(4, '0')}`;
        idMap[u.id] = newId;
    }
});

console.log('ID Mapping Generated:', idMap);

if (Object.keys(idMap).length === 0) {
    console.log('No UUIDs found to migrate.');
    process.exit(0);
}

// 2. Perform Migration
files.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let data = JSON.parse(content);

    if (file === 'users.json') {
        data.forEach(u => { if (idMap[u.id]) u.id = idMap[u.id]; });
    } else if (file === 'jobs.json') {
        data.forEach(j => {
            if (idMap[j.userId]) j.userId = idMap[j.userId];
            if (idMap[j.assignedTo]) j.assignedTo = idMap[j.assignedTo];
        });
    } else if (file === 'notifications.json') {
        data.forEach(n => { if (idMap[n.userId]) n.userId = idMap[n.userId]; });
    } else if (file === 'messages.json') {
        data.forEach(m => {
            if (idMap[m.senderId]) m.senderId = idMap[m.senderId];
            if (idMap[m.receiverId]) m.receiverId = idMap[m.receiverId];
        });
    } else if (file === 'labourGroups.json') {
        data.forEach(g => {
            if (idMap[g.id]) g.id = idMap[g.id];
            if (idMap[g.adminId]) g.adminId = idMap[g.adminId];
            if (Array.isArray(g.members)) {
                g.members = g.members.map(m => idMap[m] || m);
            }
        });
    } else if (file === 'attendance.json' && Array.isArray(data)) {
        data.forEach(a => {
            if (idMap[a.farmerId]) a.farmerId = idMap[a.farmerId];
            if (idMap[a.labourId]) a.labourId = idMap[a.labourId];
        });
    } else if (file === 'payments.json' && Array.isArray(data)) {
        data.forEach(p => {
            if (idMap[p.payerId]) p.payerId = idMap[p.payerId];
            if (idMap[p.payeeId]) p.payeeId = idMap[p.payeeId];
        });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${file}`);
});

console.log('Migration Complete.');
