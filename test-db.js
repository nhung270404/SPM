require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function test() {
    try {
        const dbUri = process.env.MONGODB_URI || "";
        console.log("MONGODB_URI length:", dbUri.length);
        if (!dbUri) throw new Error("No DB URI");
        await mongoose.connect(dbUri);
        console.log("Connected");

        // Simple schema test
        const schema = new mongoose.Schema({
            firstname: { type: String, required: true },
            roles: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
            password: { type: String, required: true }
        });

        // Register model if not registered
        const User = mongoose.models.TestUser || mongoose.model('TestUser', schema);

        const user = new User({
            firstname: "Test",
            roles: [],
            password: "$2b$10$abcdef"
        });

        await user.validate();
        console.log("Validation passed");
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await mongoose.disconnect();
    }
}
test();
