const fs = require('fs');
const path = require('path');
const { v7: uuidv7 } = require('uuid');

const outFile = path.join(__dirname, 'profiles_2026.json');

const firstNames = ['James','Mary','John','Patricia','Robert','Jennifer','Michael','Linda','William','Elizabeth','David','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Charles','Karen'];
const lastNames = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin'];

const countries = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
  { code: 'AO', name: 'Angola' },
  { code: 'BJ', name: 'Benin' },
  { code: 'US', name: 'United States' },
  { code: 'GH', name: 'Ghana' }
];

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function ageGroupFor(age) {
  if (age <= 12) return 'child';
  if (age <= 17) return 'teenager';
  if (age <= 64) return 'adult';
  return 'senior';
}

function randomDateBetween(startYear = 2020, endYear = 2026) {
  const start = new Date(`${startYear}-01-01`).getTime();
  const end = new Date(`${endYear}-12-31`).getTime();
  return new Date(randInt(start, end)).toISOString();
}

function makeProfile(i) {
  const first = firstNames[randInt(0, firstNames.length - 1)];
  const last = lastNames[randInt(0, lastNames.length - 1)];
  const name = `${first} ${last}${i}`;
  const gender = Math.random() < 0.5 ? 'male' : 'female';
  const gender_probability = +(0.5 + Math.random() * 0.5).toFixed(3);
  const age = randInt(1, 90);
  const age_group = ageGroupFor(age);
  const country = countries[randInt(0, countries.length - 1)];
  const country_probability = +(0.4 + Math.random() * 0.6).toFixed(3);
  const created_at = randomDateBetween(2020, 2026);

  return {
    id: uuidv7(),
    name,
    gender,
    gender_probability,
    age,
    age_group,
    country_id: country.code,
    country_name: country.name,
    country_probability,
    created_at
  };
}

function generate(n = 2026) {
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(makeProfile(i + 1));
  }
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2), 'utf8');
  console.log('Generated', n, 'profiles to', outFile);
}

generate(2026);
