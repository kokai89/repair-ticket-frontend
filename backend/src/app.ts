import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import authRoutes from './routes/auth';
import ticketRoutes from './routes/tickets';
import usersRoutes from './routes/users';

const prisma = new PrismaClient();

// Create test user if not exists
async function createTestUser() {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { username: 'technician1' }
    });
    
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await prisma.user.create({
        data: {
          username: 'technician1',
          password: hashedPassword,
          role: 'technician'
        }
      });
      console.log('Test user created');
    }
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser();

const app = express();

// CORS配置 - 必须放在所有中间件和路由之前
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 禁用缓存中间件
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// 其他中间件
app.use(express.json());
app.use(express.static('public')); // 添加静态文件服务

// 健康检查路由
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', usersRoutes);

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export { app, prisma };
