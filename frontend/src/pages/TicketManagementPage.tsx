import React, { useEffect } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const TicketManagementPage: React.FC = () => {
  interface Ticket {
    id: number;
    title: string;
    status: string;
    assignee: string;
    finishTime: string | null;
    updatedAt: string;
    locations: {
      address: string;
      latitude: number;
      longitude: number;
      recordedAt: string;
    }[];
  }
  
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = React.useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = React.useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/tickets', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setTickets(data.data || []);
      setError('');
    } catch (error) {
      console.error('获取工单失败:', error);
      setError('获取工单失败，请刷新重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [location.state]);

  // 添加轮询刷新
  useEffect(() => {
    const interval = setInterval(fetchTickets, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 3 },
      overflow: 'auto' 
    }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
        工单管理
      </Typography>
      
      <Box sx={{ 
        mb: 2, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1,
        justifyContent: 'space-between' 
      }}>
        <Box>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => window.location.href='/tickets/new'}
            data-testid="create-ticket-button"
          >
            新建工单
          </Button>
        </Box>
        <Button 
          variant="outlined" 
          color="error"
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          data-testid="logout-button"
        >
          退出登录
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 650 }}>
          <TableHead>
              <TableRow>
                <TableCell>工单ID</TableCell>
                <TableCell>标题</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>负责人</TableCell>
                <TableCell>完成时间</TableCell>
                <TableCell>位置</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>{ticket.id}</TableCell>
                <TableCell>{ticket.title}</TableCell>
                <TableCell 
                  sx={{
                    backgroundColor: ticket.status === 'pending' ? '#fff3e0' : 
                                  ticket.status === 'in_progress' ? '#e3f2fd' : 
                                  '#e8f5e9',
                    fontWeight: 'bold',
                    color: ticket.status === 'pending' ? '#e65100' : 
                         ticket.status === 'in_progress' ? '#0d47a1' : 
                         '#2e7d32'
                  }}
                >
                  {ticket.status === 'pending' ? '待处理' : 
                   ticket.status === 'in_progress' ? '处理中' : 
                   '已完成'}
                </TableCell>
                <TableCell>{ticket.assignee || '未分配'}</TableCell>
                <TableCell>
                  {ticket.status === 'completed' && ticket.updatedAt ? 
                    new Date(ticket.updatedAt).toLocaleString() : 
                    '未完成'}
                </TableCell>
                <TableCell>
                  {ticket.locations?.length > 0 ? (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        最后位置:
                      </Typography>
                      <Typography variant="body1">
                        {ticket.locations[ticket.locations.length - 1].address || 
                         `(${ticket.locations[ticket.locations.length - 1].latitude}, 
                          ${ticket.locations[ticket.locations.length - 1].longitude})`}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {new Date(ticket.locations[ticket.locations.length - 1].recordedAt).toLocaleString()}
                      </Typography>
                    </Box>
                  ) : '无位置信息'}
                </TableCell>
                <TableCell>
                  <Button 
                    size="small"
                    onClick={() => navigate(`/technician/tickets/${ticket.id}`)}
                    data-testid="view-ticket-button"
                  >
                    查看
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TicketManagementPage;
