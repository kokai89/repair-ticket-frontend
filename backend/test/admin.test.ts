import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/prisma';
import jwt from 'jsonwebtoken';

describe('Admin Functionality Tests', () => {
  let adminToken: string;
  let technicianToken: string;
  let testTicketId: number;

  beforeAll(async () => {
    // Create test admin user
    const admin = await prisma.user.create({
      data: {
        username: 'testadmin',
        password: 'testpass',
        role: 'admin'
      }
    });

    // Create test technician user
    const technician = await prisma.user.create({
      data: {
        username: 'testtech',
        password: 'testpass',
        role: 'technician'
      }
    });

    // Create test ticket
    const ticket = await prisma.ticket.create({
      data: {
        title: 'Test Ticket',
        description: 'Test Description',
        status: 'pending',
        technicianId: technician.id
      }
    });

    testTicketId = ticket.id;
    adminToken = jwt.sign({ id: admin.id }, process.env.JWT_SECRET || 'secret_key');
    technicianToken = jwt.sign({ id: technician.id }, process.env.JWT_SECRET || 'secret_key');
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany();
    await prisma.user.deleteMany();
  });

  test('GET /api/tickets - Admin can view all tickets', async () => {
    const res = await request(app)
      .get('/api/tickets')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/tickets/export/csv - Admin can export tickets', async () => {
    const res = await request(app)
      .get('/api/tickets/export/csv')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
  });

  test('PATCH /api/tickets/:id/reassign - Admin can reassign tickets', async () => {
    const newTech = await prisma.user.create({
      data: {
        username: 'newtech',
        password: 'testpass',
        role: 'technician'
      }
    });

    const res = await request(app)
      .patch(`/api/tickets/${testTicketId}/reassign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ technicianId: newTech.id });
    
    expect(res.status).toBe(200);
    expect(res.body.data.technicianId).toBe(newTech.id);
  });

  test('Non-admin cannot access admin routes', async () => {
    const res = await request(app)
      .get('/api/tickets/export/csv')
      .set('Authorization', `Bearer ${technicianToken}`);
    
    expect(res.status).toBe(403);
  });
});
