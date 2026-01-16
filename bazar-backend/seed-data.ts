import mongoose from "mongoose";
import dotenv from "dotenv";
import bcryptjs from "bcryptjs";
import { RoleModel } from "./src/models/role.model";
import { UserModel } from "./src/models/user.model";

// Load env vars
dotenv.config({ path: "./src/config/config.env" });

// Connect to database
const connectDB = async () => {
  const conn = await mongoose.connect(process.env.LOCAL_DATABASE_URI as string);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

// Dummy data
const roles = [
  { roleId: "role_admin_001", roleName: "admin", status: "active" as const },
  { roleId: "role_user_001", roleName: "user", status: "active" as const },
  { roleId: "role_seller_001", roleName: "seller", status: "active" as const },
];

const users = [
  {
    fullName: "Admin User",
    email: "admin@gmail.com",
    phoneNumber: 9800000001,
    username: "admin",
    password: "password123",
  },
  {
    fullName: "Kiran Rana",
    email: "kiranrana@gmail.com",
    phoneNumber: 9800000002,
    username: "kiranr",
    password: "password123",
  },
  {
    fullName: "Sarah Johnson",
    email: "sarah.johnson@gmail.com",
    phoneNumber: 9800000003,
    username: "sarahj",
    password: "password123",
  },
  {
    fullName: "Michael Chen",
    email: "michael.chen@gmail.com",
    phoneNumber: 9800000004,
    username: "mikechen",
    password: "password123",
  },
  {
    fullName: "Emily Rodriguez",
    email: "emily.rodriguez@gmail.com",
    phoneNumber: 9800000005,
    username: "emilyrod",
    password: "password123",
  },
  {
    fullName: "James Wilson",
    email: "james.wilson@gmail.com",
    phoneNumber: 9800000006,
    username: "jameswilson",
    password: "password123",
  },
  {
    fullName: "Priya Patel",
    email: "priya.patel@gmail.com",
    phoneNumber: 9800000007,
    username: "priyap",
    password: "password123",
  },
  {
    fullName: "David Kim",
    email: "david.kim@gmail.com",
    phoneNumber: 9800000008,
    username: "davidkim",
    password: "password123",
  },
  {
    fullName: "Olivia Martinez",
    email: "olivia.martinez@gmail.com",
    phoneNumber: 9800000009,
    username: "oliviam",
    password: "password123",
  },
  {
    fullName: "Ryan Thompson",
    email: "ryan.thompson@gmail.com",
    phoneNumber: 9800000010,
    username: "ryant",
    password: "password123",
  },
  {
    fullName: "Sophia Lee",
    email: "sophia.lee@gmail.com",
    phoneNumber: 9800000011,
    username: "sophialee",
    password: "password123",
  },
  {
    fullName: "Alex Garcia",
    email: "alex.garcia@gmail.com",
    phoneNumber: 9800000012,
    username: "alexg",
    password: "password123",
  },
  {
    fullName: "Emma Brown",
    email: "emma.brown@gmail.com",
    phoneNumber: 9800000013,
    username: "emmab",
    password: "password123",
  },
  {
    fullName: "Daniel Singh",
    email: "daniel.singh@gmail.com",
    phoneNumber: 9800000014,
    username: "daniels",
    password: "password123",
  },
];

// Import data
const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await RoleModel.deleteMany();
    await UserModel.deleteMany();
    console.log("Data Destroyed...");

    // Create roles
    const createdRoles = await RoleModel.insertMany(roles);
    console.log(`${createdRoles.length} Roles created`);

    // Hash the password once for all users
    const hashedPassword = await bcryptjs.hash("password123", 15);
    console.log("Password hashed successfully");

    // Create users and assign roleIds
    const createdUsers = [];
    const roleMap = {
      admin: createdRoles[0]._id,
      user: createdRoles[1]._id,
      seller: createdRoles[2]._id,
    };
    
    // First user is admin, users 3,5,7,10 are sellers, rest are regular users
    const sellerIndices = [3, 5, 7, 10];
    
    for (let i = 0; i < users.length; i++) {
      let assignedRoleId;
      if (i === 0) {
        assignedRoleId = roleMap.admin;
      } else if (sellerIndices.includes(i)) {
        assignedRoleId = roleMap.seller;
      } else {
        assignedRoleId = roleMap.user;
      }
      
      const user = await UserModel.create({
        ...users[i],
        password: hashedPassword, // Use hashed password
        roleId: assignedRoleId,
      });
      createdUsers.push(user);
    }
    console.log(`${createdUsers.length} Users created`);

    console.log("\n✅ All data imported successfully!");
    console.log("\n📊 Summary:");
    console.log(`   Roles: ${createdRoles.length}`);
    console.log(`   Users: ${createdUsers.length}`);

    console.log("\n🔑 Login Credentials (All passwords: password123):");
    
    // Populate roleId to show role names
    const populatedUsers = await UserModel.find().populate('roleId').limit(5);
    populatedUsers.forEach((user: any) => {
      const roleName = user.roleId ? user.roleId.roleName : 'N/A';
      console.log(`   Email: ${user.email} | Username: ${user.username} | Phone: ${user.phoneNumber} | Role: ${roleName}`);
    });

    await mongoose.connection.close();
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await connectDB();

    await RoleModel.deleteMany();
    await UserModel.deleteMany();

    console.log("Data Destroyed...");
    await mongoose.connection.close();
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run functions based on command line argument
if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
} else {
  console.log("Please use -i to import or -d to delete data");
  process.exit(0);
}
