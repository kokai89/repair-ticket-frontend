const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username: 'tech1' }
    });
    
    if (!existingUser) {
      // 哈希密码
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      // 创建测试用户
      await prisma.user.create({
        data: {
          username: 'tech1',
          password: hashedPassword,
          role: 'technician'
        }
      });
      console.log('测试用户 tech1 创建成功');
    } else {
      console.log('用户 tech1 已存在');
    }

    // 创建管理员用户
    // 强制重置管理员密码
    const adminPassword = await bcrypt.hash('Admin@1234', 10);
    await prisma.user.upsert({
      where: { username: 'admin' },
      update: { password: adminPassword },
      create: {
        username: 'admin',
        password: adminPassword,
        role: 'admin'
      }
    });
    console.log('管理员账号已重置');
  } catch (error) {
    console.error('创建用户出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
