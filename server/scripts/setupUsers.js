const User = require("../models/User");

// Create admin user for testing
const createAdminUser = async () => {
  try {
    // Check if admin exists
    const adminExists = await User.findOne({ email: "admin@civic.com" });

    if (adminExists) {
      console.log("✓ Admin user already exists");
      return adminExists;
    }

    // Create admin user
    const admin = new User({
      name: "Admin User",
      email: "admin@civic.com",
      password: "admin123",
      role: "admin",
    });

    await admin.save();
    console.log("✓ Admin user created successfully");
    console.log("Email: admin@civic.com");
    console.log("Password: admin123");
    return admin;
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
};

// Create demo regular user
const createDemoUser = async () => {
  try {
    // Check if demo user exists
    const demoExists = await User.findOne({ email: "user@civic.com" });

    if (demoExists) {
      console.log("✓ Demo user already exists");
      return demoExists;
    }

    // Create demo user
    const demo = new User({
      name: "Demo User",
      email: "user@civic.com",
      password: "user123",
      role: "user",
    });

    await demo.save();
    console.log("✓ Demo user created successfully");
    console.log("Email: user@civic.com");
    console.log("Password: user123");
    return demo;
  } catch (error) {
    console.error("Error creating demo user:", error);
  }
};

module.exports = { createAdminUser, createDemoUser };
