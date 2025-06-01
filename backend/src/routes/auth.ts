import { Router } from 'express';
import { prisma } from '../app';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = Router();

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // 设置请求超时(5秒)
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Request timeout')), 5000)
  );

  try {
    const user = await Promise.race([
      prisma.user.findUnique({
        where: { username }
      }) as Promise<{id: string, username: string, password: string, role: string, status: string} | null>,
      timeoutPromise
    ]) as {id: string, username: string, password: string, role: string, status: string} | null;

    console.log('User found:', user);
    console.log('Input password:', password);
    console.log('Stored hash:', user?.password);

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'User not found' });
    }

      console.log('Comparing passwords...');
      console.log('Input password:', password);
      console.log('Stored hash:', user.password);
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log('Password match result:', passwordMatch);
      console.log('Hash of input password:', await bcrypt.hash(password, 10));
      
      if (!passwordMatch) {
        console.log('Password does not match');
        return res.status(401).json({ 
          error: 'Invalid credentials',
          details: '用户名或密码错误',
          code: 'AUTH_001'
        });
      }

      // 检查用户状态
      if (user.status === 'inactive') {
        return res.status(403).json({
          error: 'Account disabled',
          details: '您的账号已被停用',
          code: 'AUTH_002'
        });
      }

    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '8h' }
    );

    console.log('Generated token:', token);
    console.log('Sending response...');
    
    res.json({ 
      token,
      role: user.role 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Password reset route
router.post('/reset-password', async (req, res) => {
  // TODO: Implement password reset
});

export default router;
