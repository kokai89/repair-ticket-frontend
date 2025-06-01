import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem
} from '@mui/material';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'technician';
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: User) => {
    setCurrentUser(user || { username: '', role: 'technician' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentUser({});
  };

  const handleSaveUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('请先登录');
        return;
      }

      if (!currentUser.username || !currentUser.role) {
        alert('请填写用户名和选择角色');
        return;
      }

      if (currentUser.id) {
        await axios.put(
          `http://localhost:3001/api/users/${currentUser.id}`, 
          {
            username: currentUser.username,
            role: currentUser.role
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('用户更新成功');
      } else {
        const response = await axios.post(
          'http://localhost:3001/api/users',
          {
            username: currentUser.username,
            role: currentUser.role,
            password: 'Default@123' // 更安全的默认密码
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert(`用户添加成功！\n用户名: ${response.data.username}\n默认密码: Default@123\n请提醒用户首次登录后修改密码`);
      }
      fetchUsers();
      handleCloseDialog();
    } catch (error: any) {
      console.error('保存用户失败:', error);
      alert(`保存用户失败: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        用户管理
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={() => handleOpenDialog()}
        sx={{ mb: 2 }}
      >
        添加用户
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>用户名</TableCell>
              <TableCell>角色</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.role === 'admin' ? '管理员' : '技术人员'}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpenDialog(user)}>编辑</Button>
                  <Button onClick={() => handleDeleteUser(user.id)} color="error">删除</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{currentUser.id ? '编辑用户' : '添加用户'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="用户名"
            fullWidth
            value={currentUser.username || ''}
            onChange={(e) => setCurrentUser({...currentUser, username: e.target.value})}
          />
          <Select
            margin="dense"
            label="角色"
            fullWidth
            value={currentUser.role || 'technician'}
            onChange={(e) => setCurrentUser({...currentUser, role: e.target.value as 'admin' | 'technician'})}
          >
            <MenuItem value="admin">管理员</MenuItem>
            <MenuItem value="technician">技术人员</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSaveUser} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementPage;
