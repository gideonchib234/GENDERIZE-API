const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Profile = require('../src/models/schema');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // seed some profiles
  const seed = [
    { name: 'John Doe', gender: 'male', gender_probability: 0.95, age: 22, age_group: 'teenager', country_id: 'NG', country_name: 'Nigeria', country_probability: 0.9, created_at: new Date().toISOString() },
    { name: 'Jane Roe', gender: 'female', gender_probability: 0.9, age: 30, age_group: 'adult', country_id: 'KE', country_name: 'Kenya', country_probability: 0.8, created_at: new Date().toISOString() },
    { name: 'Baby Boo', gender: 'female', gender_probability: 0.6, age: 2, age_group: 'child', country_id: 'NG', country_name: 'Nigeria', country_probability: 0.7, created_at: new Date().toISOString() },
    { name: 'Old Man', gender: 'male', gender_probability: 0.85, age: 70, age_group: 'senior', country_id: 'AO', country_name: 'Angola', country_probability: 0.6, created_at: new Date().toISOString() }
  ];
  await Profile.insertMany(seed);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

test('GET /api/profiles returns paginated results', async () => {
  const res = await request(app).get('/api/profiles').query({ page: 1, limit: 2 });
  expect(res.statusCode).toBe(200);
  expect(res.body.status).toBe('success');
  expect(res.body.data.length).toBe(2);
  expect(res.body.total).toBeGreaterThanOrEqual(4);
});

test('Filtering by gender and country works', async () => {
  const res = await request(app).get('/api/profiles').query({ gender: 'male', country_id: 'NG' });
  expect(res.statusCode).toBe(200);
  expect(res.body.data.every(p => p.gender === 'male' && p.country_id === 'NG')).toBe(true);
});

test('Sorting by age desc works', async () => {
  const res = await request(app).get('/api/profiles').query({ sort_by: 'age', order: 'desc' });
  expect(res.statusCode).toBe(200);
  const ages = res.body.data.map(d => d.age);
  const sorted = [...ages].sort((a,b) => b - a);
  expect(ages).toEqual(sorted);
});

test('Natural language search: "young males from nigeria"', async () => {
  const res = await request(app).get('/api/profiles/search').query({ q: 'young males from nigeria' });
  // expecting status success or interpreted
  expect([200,422]).toContain(res.statusCode);
  if (res.statusCode === 200) {
    expect(res.body.status).toBe('success');
    // all returned should be male and country NG and ages between 16 and 24
    expect(res.body.data.every(p => p.gender === 'male' && p.country_id === 'NG' && p.age >= 16 && p.age <= 24)).toBe(true);
  } else {
    expect(res.body.status).toBe('error');
  }
});
