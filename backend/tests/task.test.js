const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Task = require('../models/Task');

const TEST_MONGO_URI = 'mongodb://127.0.0.1:27017/o2h-task-portal-test';

beforeAll(async () => {
  // Connect to the test database
  await mongoose.connect(TEST_MONGO_URI);
});

afterAll(async () => {
  // Close database connection
  await mongoose.disconnect();
});

beforeEach(async () => {
  // Clear the database collections
  await User.deleteMany({});
  await Task.deleteMany({});
});

describe('Auth Endpoints', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.username).toBe('testuser');
  });

  it('should fail to register user with duplicate email', async () => {
    // Create initial user
    await User.create({
      username: 'testuser1',
      email: 'test@example.com',
      password: 'password123',
    });

    const res = await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser2',
        email: 'test@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('should authenticate user and return token on login', async () => {
    await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
  });
});

describe('Task Endpoints', () => {
  let userToken;
  let userId;

  beforeEach(async () => {
    const user = await User.create({
      username: 'taskuser',
      email: 'task@example.com',
      password: 'password123',
    });
    userId = user._id;

    // Login to get token
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'task@example.com',
        password: 'password123',
      });
    userToken = res.body.data.token;
  });

  it('should create a task successfully', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Build Login Form',
        description: 'Implement a beautiful form with HTML and CSS and validation',
        status: 'Pending',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Build Login Form');
    expect(res.body.data.status).toBe('Pending');
  });

  it('should fail task creation if description is under 20 characters', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Short Desc Task',
        description: 'Too short',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('should fetch tasks for logged-in user', async () => {
    await Task.create({
      title: 'Task 1 Title Here',
      description: 'Detailed description for task 1 that is at least 20 chars',
      status: 'Pending',
      user: userId,
    });

    const res = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it('should update task status successfully', async () => {
    const task = await Task.create({
      title: 'Updating Task Title',
      description: 'Detailed description for task that is at least 20 characters long',
      status: 'Pending',
      user: userId,
    });

    const res = await request(app)
      .put(`/tasks/${task._id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        status: 'Completed',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('Completed');
  });

  it('should delete task successfully', async () => {
    const task = await Task.create({
      title: 'Deleting Task Title',
      description: 'Detailed description for task that is at least 20 characters long',
      status: 'Pending',
      user: userId,
    });

    const res = await request(app)
      .delete(`/tasks/${task._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);

    const checkTask = await Task.findById(task._id);
    expect(checkTask).toBeNull();
  });
});
