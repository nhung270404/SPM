const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://spm_manager:SmartManager123@agile-smart-db.ncdjvm2.mongodb.net/SmartAgileDB?retryWrites=true&w=majority';

async function debugRoles() {
    try {
        await mongoose.connect(MONGO_URI);
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        const roles = await mongoose.connection.db.collection('roles').find({}).toArray();
        
        console.log('--- TẤT CẢ ROLES TRONG DB ---');
        roles.forEach(r => console.log(`- ${r.title} (${r.name}): Level ${r.level}, ID: ${r._id}`));
        
        console.log('\n--- DANH SÁCH 5 USER ĐẦU TIÊN ---');
        users.slice(0, 5).forEach(u => {
            console.log(`- ${u.lastname} ${u.firstname} | Roles: ${JSON.stringify(u.roles)}`);
        });
        
        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}

debugRoles();
