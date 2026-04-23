const mongoose = require('mongoose');
const { v7: uuidv7 } = require('uuid');

const ProfileSchema = new mongoose.Schema({
  id: { type: String, default: uuidv7, unique: true, index: true },
  name: { type: String, required: true, unique: true },
  gender: { type: String, enum: ['male', 'female'], index: true },
  gender_probability: { type: Number, default: 0, index: true },
  age: { type: Number, index: true },
  age_group: { type: String, enum: ['child', 'teenager', 'adult', 'senior'], index: true },
  country_id: { type: String, maxlength: 2, index: true },
  country_name: { type: String },
  country_probability: { type: Number, default: 0, index: true },
  created_at: { type: Date, default: Date.now, index: true }
}, { versionKey: false });

module.exports = mongoose.model('Profile', ProfileSchema);
