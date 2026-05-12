const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://spm_manager:SmartManager123@agile-smart-db.ncdjvm2.mongodb.net/SmartAgileDB?retryWrites=true&w=majority';

async function listAdmins() {
    try {
        await mongoose.connect(MONGO_URI);
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        const roles = await mongoose.connection.db.collection('roles').find({}).toArray();
        
        console.log('--- DANH SÁCH QUẢN TRỊ VIÊN (ADMIN) ---');
        
        // Tìm các role có level <= 1
        const adminRoleIds = roles
            .filter(r => r.level <= 1)
            .map(r => r._id.toString());
            
        let found = false;
        users.forEach(u => {
            // Kiểm tra xem user có bất kỳ role nào thuộc danh sách adminRoleIds không
            const userRoleIds = (u.roles || []).map(r => r.toString());
            const isAdmin = userRoleIds.some(id => adminRoleIds.includes(id));
            
            if (isAdmin) {
                const roleNames = roles
                    .filter(r => userRoleIds.includes(r._id.toString()))
                    .map(r => r.title || r.name)
                    .join(', ');
                    
                console.log(`- Họ tên: ${u.lastname} ${u.firstname}`);
                console.log(`  Email: ${u.email}`);
                console.log(`  Vai trò: ${roleNames}`);
                console.log(`  ID: ${u._id}`);
                console.log('-----------------------------------');
                found = true;
            }
        });
        
        if (!found) {
            console.log('Không tìm thấy Admin nào trong hệ thống!');
        }
        
        await mongoose.disconnect();
    } catch (e) {
        console.error('Lỗi:', e.message);
    }
}

listAdmins();
