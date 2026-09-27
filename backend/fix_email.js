require('dotenv').config();
const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ MONGODB_URI environment variable is missing.');
  process.exit(1);
}

mongoose.connect(mongoUri).then(async () => {
  // Fix email typo: hari@gmail.coom → hari@gmail.com
  const result = await mongoose.connection.db.collection('users').updateOne(
    { email: 'hari@gmail.coom' },
    { $set: { email: 'hari@gmail.com' } }
  );
  console.log(`Email fix: ${result.modifiedCount} document(s) updated`);

  // Verify fix
  const user = await mongoose.connection.db.collection('users').findOne({ email: 'hari@gmail.com' });
  console.log('Verified user:', user ? `${user.name} → ${user.email}` : 'NOT FOUND');

  // Show all users
  const all = await mongoose.connection.db.collection('users')
    .find({}, { projection: { name: 1, email: 1 } })
    .toArray();
  console.log('\nAll users in DB:');
  all.forEach(u => console.log(`  • ${u.name} — ${u.email}`));

  mongoose.disconnect();
}).catch(e => {
  console.error('DB Error:', e.message);
  process.exit(1);
});
