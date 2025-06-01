import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// 验证管理员权限中间件
const adminOnly = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: '未授权' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: '无效的token' });
  }
};

// 获取所有用户
router.get('/', adminOnly, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: '获取用户列表失败' });
  }
});

// 创建用户
router.post('/', adminOnly, async (req, res) => {
  const { username, role, password } = req.body;
  
  if (!username || !role || !password) {
    return res.status(400).json({ message: '请提供用户名、角色和密码' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        username,
        role,
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        role: true
      }
    });
    res.status(201).json(user);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: '用户名已存在' });
    }
    res.status(500).json({ message: '创建用户失败' });
  }
});

// 更新用户
router.put('/:id', adminOnly, async (req, res) => {
  const { id } = req.params;
  const { username, role } = req.body;

  if (!username || !role) {
    return res.status(400).json({ message: '请提供用户名和角色' });
  }

  try {
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { username, role },
      select: {
        id: true,
        username: true,
        role: true
      }
    });
    res.json(user);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: '用户名已存在' });
    }
    res.status(500).json({ message: '更新用户失败' });
  }
});

// 删除用户
router.delete('/:id', adminOnly, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({
      where: { id: Number(id) }
    });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: '删除用户失败' });
  }
});

export default router;
