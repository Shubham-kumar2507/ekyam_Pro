const { google } = require('googleapis');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

const code = process.argv[2];

if (!code) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://mail.google.com/'],
  });
  console.log('\n=========================================');
  console.log('1. Visit this URL in your browser:');
  console.log(authUrl);
  console.log('=========================================\n');
  console.log('2. Sign in with ekyampro@gmail.com and click "Allow"');
  console.log('3. You will be redirected to OAuth Playground. Look at the URL and copy the "code=" parameter value.');
  console.log('4. Run this script again with the code: node get-refresh-token.js "YOUR_CODE_HERE"\n');
} else {
  console.log('Exchanging code for token...');
  oauth2Client.getToken(code).then(({ tokens }) => {
    console.log('\n✅ New Refresh Token:\n');
    console.log(tokens.refresh_token);
    console.log('\n=========================================');
    console.log('Update your backend/.env file (GOOGLE_REFRESH_TOKEN) with this new value.');
    console.log('Then restart your backend / Redeploy to Render.');
  }).catch(err => {
    console.error('Error fetching token. The code might be expired or invalid:', err.message);
  });
}
