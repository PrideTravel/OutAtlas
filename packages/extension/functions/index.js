const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { OAuth2Client } = require('google-auth-library');

admin.initializeApp();

const client = new OAuth2Client();

exports.chromeAuthToken = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) { res.status(401).json({ error: 'Missing token' }); return; }

  try {
    const ticket = await client.verifyIdToken({ idToken: token });
    const { sub: uid, email } = ticket.getPayload();
    const customToken = await admin.auth().createCustomToken(uid, { email });
    res.json({ customToken });
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
});
