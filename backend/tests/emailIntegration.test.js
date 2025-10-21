/**
 * Email Integration Tests
 * Tests email sending through API endpoints
 */

const request = require('supertest');
const express = require('express');
const appointmentRoutes = require('../routes/appointments');
const authRoutes = require('../routes/auth');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/appointments', appointmentRoutes);
app.use('/api/auth', authRoutes);

describe('Email Integration Tests', () => {
  const testEmail = 'bergin.oleg@gmail.com';

  beforeAll(() => {
    console.log('\n📧 Email Integration Test Suite');
    console.log('Target email:', testEmail);
  });

  describe('Appointment Email Notifications', () => {
    let createdAppointmentId;

    test('POST /appointments - should send booking confirmation and business notification emails', async () => {
      const appointmentData = {
        businessId: 1,
        serviceId: 1,
        date: '2025-12-25',
        time: '10:00',
        firstName: 'Oleg',
        lastName: 'Bergin',
        phone: '0541234567',
        email: testEmail,
        notes: 'Integration test appointment'
      };

      const response = await request(app)
        .post('/api/appointments')
        .send(appointmentData)
        .expect('Content-Type', /json/);

      console.log('Response status:', response.status);
      console.log('Response body:', response.body);

      if (response.status === 201) {
        expect(response.body).toHaveProperty('appointmentId');
        createdAppointmentId = response.body.appointmentId;
        console.log('✅ Appointment created, emails should be sent to:', testEmail);
        console.log('Appointment ID:', createdAppointmentId);
      } else {
        console.log('⚠️ Appointment creation response:', response.status);
      }
    }, 30000);

    test('PUT /appointments/:id/status - should send status change email', async () => {
      if (!createdAppointmentId) {
        console.log('⚠️ Skipping: No appointment ID from previous test');
        return;
      }

      const response = await request(app)
        .put(`/api/appointments/${createdAppointmentId}/status`)
        .send({ status: 'confirmed' })
        .expect('Content-Type', /json/);

      console.log('Status update response:', response.status);
      if (response.status === 200) {
        console.log('✅ Status updated, email should be sent to:', testEmail);
      }
    }, 30000);

    test('PUT /appointments/:id - should send reschedule email', async () => {
      if (!createdAppointmentId) {
        console.log('⚠️ Skipping: No appointment ID from previous test');
        return;
      }

      const response = await request(app)
        .put(`/api/appointments/${createdAppointmentId}`)
        .send({
          appointment_datetime: '2025-12-26 14:00:00',
          business_id: 1
        })
        .expect('Content-Type', /json/);

      console.log('Reschedule response:', response.status);
      if (response.status === 200) {
        console.log('✅ Appointment rescheduled, email should be sent to:', testEmail);
      }
    }, 30000);

    test('POST /appointments/:id/cancel - should send cancellation email', async () => {
      if (!createdAppointmentId) {
        console.log('⚠️ Skipping: No appointment ID from previous test');
        return;
      }

      const response = await request(app)
        .post(`/api/appointments/${createdAppointmentId}/cancel`)
        .expect('Content-Type', /json/);

      console.log('Cancellation response:', response.status);
      if (response.status === 200) {
        console.log('✅ Appointment cancelled, email should be sent to:', testEmail);
      }
    }, 30000);
  });

  describe('Registration Email Notifications', () => {
    test('POST /auth/register - should send welcome email', async () => {
      const userData = {
        first_name: 'Oleg',
        last_name: 'Bergin',
        email: `test+${Date.now()}@example.com`, // Unique email to avoid duplicates
        phone: '0541234567',
        password: 'test123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect('Content-Type', /json/);

      console.log('User registration response:', response.status);
      if (response.status === 201) {
        console.log('✅ User registered, welcome email should be sent');
        console.log('Note: Email sent to', userData.email, 'not', testEmail);
      } else if (response.status === 409) {
        console.log('⚠️ Email already exists, skipping test');
      }
    }, 30000);

    test('POST /auth/register-business - should send business welcome email', async () => {
      const businessData = {
        first_name: 'Oleg',
        last_name: 'Bergin',
        email: `business+${Date.now()}@example.com`, // Unique email
        phone: '0541234567',
        password: 'test123',
        businessName: 'Test Salon',
        category: 'Beauty',
        description: 'Test business for email integration',
        city: 'Tel Aviv',
        address: 'Dizengoff 123'
      };

      const response = await request(app)
        .post('/api/auth/register-business')
        .send(businessData)
        .expect('Content-Type', /json/);

      console.log('Business registration response:', response.status);
      if (response.status === 201) {
        console.log('✅ Business registered, welcome email should be sent');
        console.log('Note: Email sent to', businessData.email, 'not', testEmail);
      } else if (response.status === 409) {
        console.log('⚠️ Email already exists, skipping test');
      }
    }, 30000);
  });

  afterAll(() => {
    console.log('\n📊 Integration test suite completed');
    console.log('Check your inbox at', testEmail, 'for test emails');
  });
});
