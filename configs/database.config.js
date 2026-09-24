const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AccountAdmin = require('../models/accounts-admin.model');
const Role = require('../models/role.model');
const { permissionList } = require('./variable.config');

const seedAdmin = async () => {
  try {
    const adminCount = await AccountAdmin.countDocuments();
    if (adminCount === 0) {
      // 1. Lấy toàn bộ danh sách quyền từ variable.config
      const allPermissions = permissionList.map(item => item.value);

      // 2. Tạo nhóm quyền Super Admin
      const superAdminRole = new Role({
        roleName: 'Super Admin',
        description: 'Nhóm quyền tối cao có thể làm mọi thứ',
        rolePermissions: allPermissions,
      });
      await superAdminRole.save();  

      // 3. Tạo mật khẩu mã hóa
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash('admin123', salt);

      // 4. Tạo tài khoản
      const adminAccount = new AccountAdmin({
        fullName: 'Quản Trị Viên',
        email: 'admin@gmail.com',
        passWord: hashPassword,
        phone: '0123456789',
        role: superAdminRole._id,
        status: 'active'
      });
      await adminAccount.save();
      
      console.log('🎉 ĐÃ TẠO TÀI KHOẢN MẶC ĐỊNH THÀNH CÔNG:');
      console.log('   - Email: admin@gmail.com');
      console.log('   - Pass:  Admin@123');
    }
  } catch (error) {
    console.log('Lỗi khi tạo tài khoản admin mặc định:', error);
  }
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log('Kết nối DB thành công!');
    await seedAdmin(); // Kích hoạt bộ tạo tài khoản mặc định
  } catch (error) {
    console.log('Kết nối DB thất bại!')
    console.log(error);
  }
}

module.exports = connectDB;