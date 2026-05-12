const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://spm_manager:SmartManager123@agile-smart-db.ncdjvm2.mongodb.net/SmartAgileDB?retryWrites=true&w=majority';

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const projects = await mongoose.connection.db.collection('projects').find({}).toArray();
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        
        console.log('--- DANH SÁCH DỰ ÁN VÀ LEADER ---');
        projects.forEach(p => {
            const managerId = p.manager;
            if (managerId) {
                const manager = users.find(u => u._id.toString() === managerId.toString());
                console.log(`Dự án: ${p.title} [${p.key}]`);
                if (manager) {
                    console.log(`- Leader: ${manager.lastname} ${manager.firstname}`);
                    console.log(`- Email: ${manager.email}`);
                    console.log(`- ID: ${manager._id}`);
                } else {
                    console.log(`- Manager ID: ${managerId} (Không tìm thấy thông tin User)`);
                }
            } else {
                console.log(`Dự án: ${p.title} [${p.key}] - Không có Leader`);
            }
            console.log('-----------------------------------');
        });
        
        await mongoose.disconnect();
    } catch (e) {
        console.error('Lỗi kết nối:', e.message);
    }
}

check();
