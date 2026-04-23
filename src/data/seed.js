const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../database/db');
const Profile = require('../models/schema');

async function runSeed() {
  await connectDB();
  const file = path.join(__dirname, 'profiles_2026.json');
  if (!fs.existsSync(file)) {
    console.error('profiles_2026.json not found in src/data/. Please place the provided 2026 profiles file at:', file);
    process.exit(1);
  }
  const raw = fs.readFileSync(file, 'utf8');
  let items;
  try { items = JSON.parse(raw); } catch (e) { console.error('Invalid JSON in profiles_2026.json'); process.exit(1); }

  let inserted = 0;
  for (const it of items) {
    // normalize
    const doc = {
      id: it.id,
      name: it.name,
      gender: it.gender,
      gender_probability: Number(it.gender_probability) || 0,
      age: Number(it.age) || null,
      age_group: it.age_group,
      country_id: it.country_id ? it.country_id.toUpperCase() : undefined,
      country_name: it.country_name,
      country_probability: Number(it.country_probability) || 0,
      created_at: it.created_at ? new Date(it.created_at) : new Date()
    };

    try {
      await Profile.updateOne({ id: doc.id || { $exists: false }, name: doc.name }, { $setOnInsert: doc }, { upsert: true });
      inserted++;
    } catch (e) {
      // ignore duplicates or validation errors for now
    }
  }

  console.log('Seed completed. Processed:', items.length, 'Upsert attempts:', inserted);
  process.exit(0);
}

runSeed().catch(err => { console.error(err); process.exit(1); });
