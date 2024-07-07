// firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Adjust the path as needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
//   databaseURL: 'https://<your-database-name>.firebaseio.com'
});

module.exports = admin;