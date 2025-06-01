import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack
} from '@mui/material';
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const TicketCreatePage: React.FC = () => {
  const [formData, setFormData] = useState({
    工单标题: '',
    故障描述: '',
    优先级: 'medium',
    客户名称: '',
    联系人: '',
    联系电话: '',
    地址: '',
    设备名称: '',
    设备型号: '',
    序列号: '',
    解决方案: '',
    到达时间: new Date(),
    完成时间: null as Date | null,
    更换配件: [],
    客户意见: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, [field]: e.target.value});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const api = axios.create({
        baseURL: 'http://localhost:3001/api',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await api.post('/tickets', {
        title: formData.工单标题,
        description: formData.故障描述,
        status: 'pending',
        priority: formData.优先级,
        customerName: formData.客户名称,
        contactPerson: formData.联系人,
        contactPhone: formData.联系电话,
        address: formData.地址,
        deviceName: formData.设备名称,
        deviceModel: formData.设备型号,
        serialNumber: formData.序列号,
        solution: formData.解决方案,
        arrivalTime: formData.到达时间.toISOString(),
        completionTime: formData.完成时间?.toISOString(),
        customerFeedback: formData.客户意见,
        technicianId: 1 // 默认分配第一个技术人员
      }, {
        timeout: 5000 // 添加5秒超时
      });

      if (response.data.success) {
        console.log('Ticket created:', response.data.data);
        window.location.href = '/admin/tickets';
      } else {
        console.error('Failed to create ticket:', response.data.error);
        alert('创建工单失败: ' + (response.data.message || '未知错误'));
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('创建工单失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Paper elevation={3} sx={{ padding: 4, width: 800 }}>
          <Typography variant="h4" align="center" gutterBottom>
            创建维修工单
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <Box>
                <TextField
                  label="工单标题"
                  variant="outlined"
                  fullWidth
                  value={formData.工单标题}
                  onChange={handleChange('工单标题')}
                  required
                />
              </Box>
              
              <Box>
                <TextField
                  label="故障描述"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.故障描述}
                  onChange={handleChange('故障描述')}
                  required
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box flex={1}>
                  <TextField
                    label="客户名称"
                    variant="outlined"
                    fullWidth
                    value={formData.客户名称}
                    onChange={handleChange('客户名称')}
                  />
                </Box>

                <Box flex={1}>
                  <TextField
                    label="联系人"
                    variant="outlined"
                    fullWidth
                    value={formData.联系人}
                    onChange={handleChange('联系人')}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box flex={1}>
                  <TextField
                    label="联系电话"
                    variant="outlined"
                    fullWidth
                    value={formData.联系电话}
                    onChange={handleChange('联系电话')}
                  />
                </Box>

                <Box flex={1}>
                  <FormControl fullWidth>
                    <InputLabel>优先级</InputLabel>
                    <Select
                      value={formData.优先级}
                      label="优先级"
                      onChange={(e) => setFormData({...formData, 优先级: e.target.value})}
                    >
                      <MenuItem value="low">低</MenuItem>
                      <MenuItem value="medium">中</MenuItem>
                      <MenuItem value="high">高</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box>
                <TextField
                  label="地址"
                  variant="outlined"
                  fullWidth
                  value={formData.地址}
                  onChange={handleChange('地址')}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box flex={1}>
                  <TextField
                    label="设备名称"
                    variant="outlined"
                    fullWidth
                    value={formData.设备名称}
                    onChange={handleChange('设备名称')}
                  />
                </Box>

                <Box flex={1}>
                  <TextField
                    label="设备型号"
                    variant="outlined"
                    fullWidth
                    value={formData.设备型号}
                    onChange={handleChange('设备型号')}
                  />
                </Box>

                <Box flex={1}>
                  <TextField
                    label="序列号"
                    variant="outlined"
                    fullWidth
                    value={formData.序列号}
                    onChange={handleChange('序列号')}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box flex={1}>
                  <DateTimePicker
                    label="到达时间"
                    value={formData.到达时间}
                    onChange={(newValue: Date | null) => setFormData({...formData, 到达时间: newValue || new Date()})}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Box>

                <Box flex={1}>
                  <DateTimePicker
                    label="完成时间"
                    value={formData.完成时间}
                    onChange={(newValue: Date | null) => setFormData({...formData, 完成时间: newValue})}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Box>
              </Box>

              <Box>
                <TextField
                  label="解决方案"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.解决方案}
                  onChange={handleChange('解决方案')}
                />
              </Box>

              <Box>
                <TextField
                  label="客户意见"
                  variant="outlined"
                  fullWidth
                  value={formData.客户意见}
                  onChange={handleChange('客户意见')}
                />
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
              >
                {loading ? '提交中...' : '提交工单'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/tickets')}
              >
                取消
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default TicketCreatePage;
