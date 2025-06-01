import { Router } from 'express';
import { prisma } from '../app';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { parse } from 'json2csv';

const router = Router();

// Middleware to check admin role
const checkAdmin = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token || '', process.env.JWT_SECRET || 'secret_key') as { id: string };
    
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.id) }
    });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    console.error('Error verifying admin:', error);
    res.status(500).json({ error: 'Failed to verify admin' });
  }
};

// Create new ticket
router.post('/', checkAdmin, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      status = 'pending',
      priority = 'medium',
      customerName,
      contactPerson,
      contactPhone,
      address,
      deviceName,
      deviceModel,
      serialNumber,
      solution,
      arrivalTime,
      completionTime,
      customerFeedback,
      technicianId = 1
    } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: '工单标题和故障描述是必填项' });
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        status,
        priority,
        customerName,
        phone: contactPhone,
        address,
        deviceName,
        deviceModel,
        serialNumber,
        solution,
        arrivalTime: arrivalTime ? new Date(arrivalTime) : null,
        finishTime: completionTime ? new Date(completionTime) : null,
        customerFeedback,
        technicianId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    console.log('工单创建成功:', ticket);

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Get tickets with role-based filtering
router.get('/', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as { id: string, role: string };
    const userId = parseInt(decoded.id);
    const role = decoded.role;

    let whereClause = {};
    // Admin can see all tickets
    if (role === 'technician') {
      whereClause = { technicianId: userId };
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        technician: {
          select: {
            id: true,
            username: true
          }
        },
        locations: {
          orderBy: {
            recordedAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get single ticket with permission check
router.get('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as { id: string, role: string };
    const userId = parseInt(decoded.id);
    const role = decoded.role;

    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        technician: {
          select: {
            id: true,
            username: true
          }
        },
        signatures: {
          select: {
            id: true,
            signature: true,
            signedAt: true
          }
        },
        locations: {
          select: {
            id: true,
            latitude: true,
            longitude: true,
            recordedAt: true
          }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (role === 'technician' && ticket.technicianId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// Update ticket with permission check
router.patch('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as { id: string, role: string };
    const userId = parseInt(decoded.id);
    const role = decoded.role;

    // First check if ticket exists and user has permission
    const existingTicket = await prisma.ticket.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!existingTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (role === 'technician' && existingTicket.technicianId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { status, solution, signature, latitude, longitude } = req.body;
    const updateData: any = {
      status,
      solution,
      updatedAt: new Date()
    };

    // Save location if provided
    if (latitude && longitude) {
      try {
        console.log('Saving location data:', { latitude, longitude, ticketId: parseInt(req.params.id) });
        const location = await prisma.location.create({
          data: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            ticketId: parseInt(req.params.id),
            recordedAt: new Date()
          }
        });
        console.log('Location saved:', location);
      } catch (error) {
        console.error('Error saving location:', error);
      }
    }
    
    const updatedTicket = await prisma.ticket.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
      include: {
        signatures: true
      }
    });

    // Handle signature if provided
    if (signature) {
      try {
        // Save signature to filesystem
        const signatureDir = path.join(__dirname, '../../public/signatures');
        if (!fs.existsSync(signatureDir)) {
          fs.mkdirSync(signatureDir, { recursive: true });
        }
        
        const signatureFileName = `sig_${Date.now()}.png`;
        const signaturePath = path.join(signatureDir, signatureFileName);
        const base64Data = signature.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(signaturePath, base64Data, 'base64');

        // Create or update signature record
        if (updatedTicket.signatures.length > 0) {
          await prisma.signature.update({
            where: { id: updatedTicket.signatures[0].id },
            data: { signature: `/signatures/${signatureFileName}` }
          });
        } else {
          await prisma.signature.create({
            data: {
              signature: `/signatures/${signatureFileName}`,
              ticketId: updatedTicket.id
            }
          });
        }
      } catch (error) {
        console.error('Error saving signature:', error);
      }
    }

    res.json({
      success: true,
      data: updatedTicket
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// Get ticket statistics
router.get('/stats', async (req, res) => {
  try {
    const [totalTickets, pendingTickets, completedTickets, technicians] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: 'pending' } }),
      prisma.ticket.count({ where: { status: 'completed' } }),
      prisma.user.count({ where: { role: 'technician' } })
    ]);

    res.json({
      success: true,
      data: {
        totalTickets,
        pendingTickets,
        completedTickets,
        technicians
      }
    });
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    res.status(500).json({ error: 'Failed to fetch ticket stats' });
  }
});

export default router;
