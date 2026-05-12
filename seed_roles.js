const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://spm_manager:SmartManager123@agile-smart-db.ncdjvm2.mongodb.net/SmartAgileDB?retryWrites=true&w=majority';

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const rolesCollection = mongoose.connection.db.collection('roles');
        const usersCollection = mongoose.connection.db.collection('users');

        // 1. Tạo Roles nếu chưa có
        const roles = [
            { name: 'admin', title: 'Quản trị viên', level: 1 },
            { name: 'member', title: 'Thành viên', level: 2 }
        ];

        for (const role of roles) {
            const exists = await rolesCollection.findOne({ name: role.name });
            if (!exists) {
                await rolesCollection.insertOne(role);
                console.log(`Created role: ${role.title}`);
            }
        }

        // 2. Lấy ID của role Admin
        const adminRole = await rolesCollection.findOne({ name: 'admin' });
        const memberRole = await rolesCollection.findOne({ name: 'member' });

        // 3. Gán quyền Admin cho Nguyễn Hồng Nhung
        const targetEmail = 'nhung27042004@gmail.com';
        const user = await usersCollection.findOne({ email: targetEmail });
        
        if (user) {
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { roles: [adminRole._id] } }
            );
            console.log(`Assigned Admin role to ${targetEmail}`);
        }

        // 4. Gán quyền Member cho những người còn lại (nếu chưa có role)
        await usersCollection.updateMany(
            { email: { $ne: targetEmail }, roles: { $size: 0 } },
            { $set: { roles: [memberRole._id] } }
        );
        console.log('Assigned Member role to other users');

        await mongoose.disconnect();
        console.log('Done!');
    } catch (e) {
        console.error(e);
    }
}

seed();
