require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const createAdmin = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/examination-portal';
        await mongoose.connect(mongoURI);
        console.log('MongoDB Connected');

        const adminEmail = 'admin@example.com';
        const adminPassword = 'password123';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        const adminUser = await User.create({
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            profile: {
                firstName: 'System',
                lastName: 'Admin',
                department: 'Administration',
                phone: '0000000000'
            },
            isActive: true
        });

        console.log(`Admin user created successfully:
        Email: ${adminEmail}
        Password: ${adminPassword}
        Role: ${adminUser.role}`);

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createAdmin();
