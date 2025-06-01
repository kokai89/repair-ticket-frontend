import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField,
  Divider,
  CircularProgress,
  Stack,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import axios from 'axios';
import SignaturePad from 'react-signature-pad-wrapper';
import 'leaflet/dist/leaflet.css';

  interface Location {
    id?: number;
    latitude: number;
    longitude: number;
    accuracy?: number;
    recordedAt?: string;
  }

  interface Ticket {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    customerName: string | null;
    contact: string | null;
    phone: string | null;
    address: string | null;
    deviceName: string | null;
    deviceModel: string | null;
    serialNumber: string | null;
    solution: string | null;
    arrivalTime: string | null;
    finishTime: string | null;
    parts: string | null;
    replacedParts: {
      name: string;
      model: string;
      quantity: number;
    }[] | null; // 更换部品详细信息
    customerFeedback: string | null;
    customerRating: 'satisfied' | 'neutral' | 'dissatisfied' | null;
    technicianId: number;
    technicianName: string | null; // 新增维修人员姓名
    createdAt: string;
    updatedAt: string;
    technician: {
      username: string;
      fullName: string | null;
    };
    signatures: any[];
    locations: any[];
  }

const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [, setSignatureImg] = useState('');
  const signatureRef = useRef<any>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const api = axios.create({
          baseURL: 'http://localhost:3001/api',
          timeout: 10000,
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const ticketResponse = await api.get(`/tickets/${id}`);
        
        if (ticketResponse.data.success && ticketResponse.data.data) {
          setTicket(ticketResponse.data.data);
          setStatus(ticketResponse.data.data.status);
        }
      } catch (error) {
        console.error('Error fetching ticket:', error);
        alert('获取工单详情失败，请稍后重试');
        navigate('/technician/tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, navigate]);

  // Load signature whenever ticket data changes
  useEffect(() => {
    console.log('Ticket data changed:', ticket);
    if (ticket?.signatures?.length) {
      console.log('Signatures array:', ticket.signatures);
    }
    
    if (ticket?.signatures?.[0]?.signature) {
      console.log('Signature URL found:', ticket.signatures[0].signature);
      
      if (!signatureRef.current) {
        console.error('SignaturePad ref not initialized');
        return;
      }
      
      console.log('Loading signature from:', ticket.signatures[0].signature);
      // Clear any existing signature first
      signatureRef.current.clear();
      
      // Fetch the signature image from backend
      const fetchSignature = async () => {
        try {
          // 严格清理签名路径并编码
          const rawPath = ticket.signatures[0].signature;
          // 移除所有非路径字符，只保留字母数字、斜杠、点、连字符和下划线
          const cleanPath = rawPath.replace(/[^a-zA-Z0-9/._-]/g, '');
          // 确保路径以/signatures/开头
          const normalizedPath = cleanPath.startsWith('/signatures/') 
            ? cleanPath 
            : `/signatures/${cleanPath.replace(/^\/?signatures\/?/, '')}`;
          // 编码URI组件但保留必要的斜杠
          const encodedPath = encodeURI(normalizedPath).replace(/%2F/g, '/');
          const signatureUrl = `http://localhost:3001${encodedPath}`;
          console.log('Processed signature URL:', signatureUrl);
          console.log('Fetching signature from:', signatureUrl);
          
          const response = await fetch(signatureUrl);
          console.log('Signature response status:', response.status);
          
          if (response.ok) {
            const blob = await response.blob();
            console.log('Signature blob size:', blob.size);
            
            const dataUrl = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => {
                console.log('Signature data URL generated');
                resolve(reader.result);
              };
              reader.onerror = () => {
                console.error('FileReader error:', reader.error);
                resolve(null);
              };
              reader.readAsDataURL(blob);
            });
            
            if (dataUrl) {
              console.log('Loading signature to canvas');
              signatureRef.current.fromDataURL(dataUrl);
              console.log('Signature loaded successfully');
            }
          } else {
            console.error('Failed to fetch signature:', response.statusText);
          }
        } catch (error) {
          console.error('Error loading signature:', error);
        }
      };
      
      fetchSignature();
    }
  }, [ticket]);

  const [shouldNavigate, setShouldNavigate] = useState(false);

  useEffect(() => {
    if (shouldNavigate) {
      console.log('执行导航到工单列表页');
      navigate('/tickets', { replace: true });
      setShouldNavigate(false);
    }
  }, [shouldNavigate, navigate]);

  const fetchTicketData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return null;
      }
      
      const api = axios.create({
        baseURL: 'http://localhost:3001/api',
        timeout: 10000,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const response = await api.get(`/tickets/${id}`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Invalid ticket data');
    } catch (error) {
      console.error('Error fetching ticket:', error);
      alert('获取工单详情失败，请稍后重试');
          navigate('/technician/tickets');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const token = localStorage.getItem('token') || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InRlY2huaWNpYW4iLCJpYXQiOjE3NDgxNjc4MjksImV4cCI6MTc0ODE5NjYyOX0.BWK9EM1i_Nts6qK6p8wlgV-frOpAdsQ_21yqIJ2L7wA";
      
      console.log('开始更新工单状态');
      const api = axios.create({
        baseURL: 'http://localhost:3001/api',
        timeout: 10000,
        headers: { Authorization: `Bearer ${token}` }
      });

      // 获取当前位置
      let location: Partial<Location> = { latitude: 0, longitude: 0 };
      console.log('尝试获取位置...');
      if (navigator.geolocation) {
        console.log('浏览器支持地理位置API');
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            console.log('请求位置权限...');
            navigator.geolocation.getCurrentPosition(
              (position) => {
                console.log('位置获取成功:', position);
                resolve(position);
              },
              (error) => {
                console.error('位置获取错误:', error);
                let errorMsg = '无法获取位置';
                switch(error.code) {
                  case 1:
                    errorMsg = '位置权限被拒绝，请在浏览器设置中允许位置访问';
                    break;
                  case 2:
                    errorMsg = '位置信息不可用，请检查设备定位设置';
                    break;
                  case 3:
                    errorMsg = '位置请求超时，请确保设备有GPS信号或网络连接';
                    break;
                }
                alert(errorMsg);
                reject(error);
              },
              {
                enableHighAccuracy: true,
                timeout: 15000, // 延长超时时间
                maximumAge: 0
              }
            );
          });
          location = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            recordedAt: new Date().toISOString()
          };
          console.log('获取到位置:', location);
        } catch (error) {
          console.error('获取位置失败:', error);
          alert('无法获取当前位置，请确保已授权位置权限');
        }
      } else {
        console.warn('浏览器不支持地理位置API');
        alert('您的浏览器不支持地理位置功能');
      }

      // 处理签名数据
      let signatureData = null;
      if (signatureRef.current && !signatureRef.current.isEmpty()) {
        signatureData = signatureRef.current.toDataURL('image/png');
      }

      const updateData: any = { 
        status,
        notes,
        title: ticket?.title || '',
        description: ticket?.description || '',
        customerName: ticket?.customerName || '',
        contact: ticket?.contact || '',
        phone: ticket?.phone || '',
        address: ticket?.address || '',
        deviceName: ticket?.deviceName || '',
        deviceModel: ticket?.deviceModel || '',
        serialNumber: ticket?.serialNumber || '',
        solution: ticket?.solution || '',
        customerFeedback: ticket?.customerFeedback || '',
        customerRating: ticket?.customerRating || null,
        arrivalTime: ticket?.arrivalTime || null,
        finishTime: ticket?.finishTime || null,
        updatedAt: new Date().toISOString(),
        signature: signatureData
      };

      // 添加位置数据(如果获取成功)
      if (location.latitude && location.longitude) {
        updateData.latitude = location.latitude;
        updateData.longitude = location.longitude;
      }

      console.log('更新数据:', JSON.stringify(updateData, null, 2));
      console.log('发送位置数据:', location.latitude && location.longitude ? 
        `纬度: ${location.latitude}, 经度: ${location.longitude}` : '无位置数据');
      const updateResponse = await api.patch(`/tickets/${id}`, updateData);
      console.log('更新响应:', updateResponse.data);

      if (!updateResponse.data.success) {
        throw new Error(updateResponse.data.error || '更新失败');
      }

      console.log('工单更新成功，刷新数据');
      const updatedTicket = await fetchTicketData();
      if (updatedTicket) {
        setTicket(updatedTicket);
        setStatus(updatedTicket.status);
        
        // 强制重新加载签名（如果有）
        if (signatureRef.current && updatedTicket.signatures?.[0]?.signature) {
          signatureRef.current.clear();
          signatureRef.current.fromDataURL(updatedTicket.signatures[0].signature);
          // 添加延迟确保签名加载完成
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        alert('状态更新成功');
        // 不再自动导航，让用户手动返回
      }
    } catch (error) {
      console.error('更新工单错误:', error);
      const errorMessage = error instanceof Error ? error.message : '请检查网络连接后重试';
      alert(`更新工单失败: ${errorMessage}`);
    }
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignatureImg('');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6">工单不存在或加载失败</Typography>
      </Box>
    );
  }

  // 打印样式
  const printStyles = `
    @media print {
      body * {
        visibility: hidden;
      }
      .print-content, .print-content * {
        visibility: visible;
      }
      .print-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        padding: 20px;
      }
      .no-print {
        display: none !important;
      }
    }
  `;

  return (
    <Box sx={{ padding: 3 }}>
      <style>{printStyles}</style>
      <Typography variant="h4" gutterBottom className="no-print">
        Ticket Details
      </Typography>
      <Paper elevation={3} sx={{ padding: 4 }} className="print-content">
        <Box>
          <Typography variant="h4" align="center" gutterBottom>
            维修工单详情
          </Typography>
          <Stack spacing={2} sx={{ mb: 3 }}>
              <Box>
                <TextField
                  label="工单标题"
                  variant="outlined"
                  fullWidth
                  value={ticket.title || '无标题'}
                  onChange={(e) => setTicket({...ticket, title: e.target.value})}
                />
              </Box>
              
              <Box>
                <TextField
                  label="故障描述"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  value={ticket.description || '无描述'}
                  onChange={(e) => setTicket({...ticket, description: e.target.value})}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box flex={1}>
                  <TextField
                    label="客户名称"
                    variant="outlined"
                    fullWidth
                    value={ticket.customerName || ''}
                    onChange={(e) => setTicket({...ticket, customerName: e.target.value})}
                  />
                </Box>

                <Box flex={1}>
                  <TextField
                    label="联系人"
                    variant="outlined"
                    fullWidth
                    value={ticket.contact || ''}
                    onChange={(e) => setTicket({...ticket, contact: e.target.value})}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box flex={1}>
                  <TextField
                    label="联系电话"
                    variant="outlined"
                    fullWidth
                    value={ticket.phone || ''}
                    onChange={(e) => setTicket({...ticket, phone: e.target.value})}
                  />
                </Box>

                <Box flex={1}>
                  <TextField
                    label="优先级"
                    variant="outlined"
                    fullWidth
                    value={ticket.priority}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Box>
              </Box>

              <Box>
                <TextField
                  label="地址"
                  variant="outlined"
                  fullWidth
                  value={ticket.address || ''}
                  onChange={(e) => setTicket({...ticket, address: e.target.value})}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box flex={1}>
                  <TextField
                    label="设备名称"
                    variant="outlined"
                    fullWidth
                    value={ticket.deviceName || ''}
                    onChange={(e) => setTicket({...ticket, deviceName: e.target.value})}
                  />
                </Box>

                <Box flex={1}>
                  <TextField
                    label="设备型号"
                    variant="outlined"
                    fullWidth
                    value={ticket.deviceModel || ''}
                    onChange={(e) => setTicket({...ticket, deviceModel: e.target.value})}
                  />
                </Box>

                <Box flex={1}>
                  <TextField
                    label="序列号"
                    variant="outlined"
                    fullWidth
                    value={ticket.serialNumber || ''}
                    onChange={(e) => setTicket({...ticket, serialNumber: e.target.value})}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box flex={1}>
                  <TextField
                    label="维修人员"
                    variant="outlined"
                    fullWidth
                    value={ticket.technician?.fullName || ticket.technicianName || ''}
                    onChange={(e) => setTicket({...ticket, technicianName: e.target.value})}
                  />
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle1" gutterBottom>
                    更换部品
                  </Typography>
                  {ticket.replacedParts?.map((part, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                        <TextField
                          label="名称"
                          variant="outlined"
                          fullWidth
                          value={part.name}
                          onChange={(e) => {
                            const newParts = [...(ticket.replacedParts || [])];
                            newParts[index].name = e.target.value;
                            setTicket({...ticket, replacedParts: newParts});
                          }}
                        />
                        <TextField
                          label="型号"
                          variant="outlined"
                          fullWidth
                          value={part.model}
                          onChange={(e) => {
                            const newParts = [...(ticket.replacedParts || [])];
                            newParts[index].model = e.target.value;
                            setTicket({...ticket, replacedParts: newParts});
                          }}
                        />
                        <TextField
                          label="数量"
                          variant="outlined"
                          type="number"
                          fullWidth
                          value={part.quantity}
                          onChange={(e) => {
                            const newParts = [...(ticket.replacedParts || [])];
                            newParts[index].quantity = parseInt(e.target.value) || 0;
                            setTicket({...ticket, replacedParts: newParts});
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      setTicket({
                        ...ticket, 
                        replacedParts: [
                          ...(ticket.replacedParts || []), 
                          {name: '', model: '', quantity: 1}
                        ]
                      });
                    }}
                  >
                    添加部品
                  </Button>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box flex={1}>
                  <TextField
                    label="到达时间"
                    variant="outlined"
                    fullWidth
                    type="datetime-local"
                    value={ticket.arrivalTime || ''}
                    onChange={(e) => setTicket({...ticket, arrivalTime: e.target.value})}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Box>

                <Box flex={1}>
                  <TextField
                    label="完成时间"
                    variant="outlined"
                    fullWidth
                    type="datetime-local"
                    value={ticket.finishTime || ''}
                    onChange={(e) => setTicket({...ticket, finishTime: e.target.value})}
                    InputLabelProps={{
                      shrink: true,
                    }}
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
                  value={ticket.solution || ''}
                  onChange={(e) => setTicket({...ticket, solution: e.target.value})}
                />
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  客户评价
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <FormControlLabel
                    control={<Checkbox 
                      checked={ticket.customerRating === 'satisfied'}
                      onChange={(e) => setTicket({...ticket, customerRating: e.target.checked ? 'satisfied' : null})}
                    />}
                    label="满意"
                  />
                  <FormControlLabel
                    control={<Checkbox 
                      checked={ticket.customerRating === 'neutral'}
                      onChange={(e) => setTicket({...ticket, customerRating: e.target.checked ? 'neutral' : null})}
                    />}
                    label="一般"
                  />
                  <FormControlLabel
                    control={<Checkbox 
                      checked={ticket.customerRating === 'dissatisfied'}
                      onChange={(e) => setTicket({...ticket, customerRating: e.target.checked ? 'dissatisfied' : null})}
                    />}
                    label="不满意"
                  />
                </Box>
                <TextField
                  label="客户意见"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={2}
                  value={ticket.customerFeedback || ''}
                  onChange={(e) => setTicket({...ticket, customerFeedback: e.target.value})}
                />
              </Box>
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          客户签名
        </Typography>
        <Paper variant="outlined" sx={{ p: 1, mb: 2 }}>
          <Box className="sigCanvas">
            <SignaturePad 
              options={{ penColor: 'black' }}
              ref={signatureRef}
              width={500}
              height={200}
            />
          </Box>
          <Button 
            variant="outlined" 
            onClick={clearSignature}
          >
            清除
          </Button>
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          状态更新
        </Typography>
        <TextField
          select
          fullWidth
          label="状态"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          SelectProps={{ native: true }}
          sx={{ mb: 2 }}
        >
          <option value="pending">待处理 (pending)</option>
          <option value="in_progress">处理中 (in_progress)</option>
          <option value="completed">已完成 (completed)</option>
        </TextField>
        <TextField
          multiline
          fullWidth
          rows={4}
          label="备注"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Stack direction="row" spacing={2}>
          <Button 
            variant="contained" 
            onClick={(e) => {
              e.preventDefault();
              console.log('更新状态按钮被点击');
              handleStatusUpdate();
            }}
          >
            更新状态
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate(localStorage.getItem('role') === 'admin' ? '/admin/tickets' : '/technician/tickets')}
          >
            返回列表
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default TicketDetailPage;
