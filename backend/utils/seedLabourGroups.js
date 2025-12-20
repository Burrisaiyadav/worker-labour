const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataPath = path.join(__dirname, '../data/labourGroups.json');

const realisticGroups = [
    // Punjab
    {
        id: uuidv4(),
        name: "Khalsa Labour Force",
        rating: 4.8,
        members: 45,
        rate: 550,
        contact: "9812345670",
        location: "Ludhiana, Punjab",
        image: "https://images.unsplash.com/photo-1595959154942-8874f6762391?auto=format&fit=crop&q=80&w=100"
    },
    {
        id: uuidv4(),
        name: "Amritsar Kissan Union",
        rating: 4.6,
        members: 30,
        rate: 500,
        contact: "9812345671",
        location: "Amritsar, Punjab",
        image: "https://images.unsplash.com/photo-1627733979402-9a64be489e21?auto=format&fit=crop&q=80&w=100"
    },
    // Maharashtra
    {
        id: uuidv4(),
        name: "Maratha Shetkar Group",
        rating: 4.7,
        members: 50,
        rate: 480,
        contact: "9988776655",
        location: "Pune, Maharashtra",
        image: "https://images.unsplash.com/photo-1593672715438-d88a70629afd?auto=format&fit=crop&q=80&w=100"
    },
    {
        id: uuidv4(),
        name: "Vidarbha Agro Works",
        rating: 4.5,
        members: 25,
        rate: 450,
        contact: "9988776656",
        location: "Nagpur, Maharashtra",
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=100"
    },
    // Karnataka
    {
        id: uuidv4(),
        name: "Karnataka Raitha Sangha",
        rating: 4.6,
        members: 40,
        rate: 520,
        contact: "8876543210",
        location: "Mysore, Karnataka",
        image: "https://images.unsplash.com/photo-1530053969600-caed2596d242?auto=format&fit=crop&q=80&w=100"
    },
    {
        id: uuidv4(),
        name: "Bangalore Rural Workers",
        rating: 4.4,
        members: 20,
        rate: 500,
        contact: "8876543211",
        location: "Bangalore, Karnataka",
        image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=100"
    },
    // Tamil Nadu
    {
        id: uuidv4(),
        name: "Tamil Nadu Vavasayi",
        rating: 4.7,
        members: 35,
        rate: 480,
        contact: "7766554433",
        location: "Madurai, Tamil Nadu",
        image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=100"
    },
    // Uttar Pradesh
    {
        id: uuidv4(),
        name: "Awadh Labour Union",
        rating: 4.3,
        members: 60,
        rate: 400,
        contact: "9123456789",
        location: "Lucknow, Uttar Pradesh",
        image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=100"
    },
    {
        id: uuidv4(),
        name: "Kisan Shakti Group",
        rating: 4.5,
        members: 28,
        rate: 420,
        contact: "9123456788",
        location: "Varanasi, Uttar Pradesh",
        image: "https://images.unsplash.com/photo-1599580424269-a1e4c7ba9c24?auto=format&fit=crop&q=80&w=100"
    },
    // Bihar
    {
        id: uuidv4(),
        name: "Patna Mazdoor Sangh",
        rating: 4.4,
        members: 55,
        rate: 380,
        contact: "8765432109",
        location: "Patna, Bihar",
        image: "https://images.unsplash.com/photo-1535090467336-9501f96eef89?auto=format&fit=crop&q=80&w=100"
    }
];

const seedLabourGroups = () => {
    try {
        if (!fs.existsSync(path.dirname(dataPath))) {
            fs.mkdirSync(path.dirname(dataPath), { recursive: true });
        }

        let currentData = [];
        if (fs.existsSync(dataPath)) {
            const raw = fs.readFileSync(dataPath, 'utf8');
            try {
                currentData = JSON.parse(raw);
            } catch (e) {
                currentData = [];
            }
        }

        // Only seed if less than 5 items or force re-seed logic could be applied
        // For now, we append if not exist? Or restart fresh?
        // Let's ensure we have at least these diverse groups.
        // We will filter out duplicates by name.

        // Simple strategy: Merge realisticGroups with currentData, preferring realisticGroups if name collision?
        // Actually, safer to just check if 'realisticGroups' are present.

        let needsWrite = false;
        realisticGroups.forEach(group => {
            const exists = currentData.some(g => g.name === group.name);
            if (!exists) {
                currentData.push(group);
                needsWrite = true;
            }
        });

        if (needsWrite) {
            fs.writeFileSync(dataPath, JSON.stringify(currentData, null, 2));
            console.log('Labour Groups seeded with diverse data.');
        } else {
            console.log('Labour Groups already verified.');
        }

    } catch (err) {
        console.error('Error seeding Labour Groups:', err);
    }
};

module.exports = seedLabourGroups;
