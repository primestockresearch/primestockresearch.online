// Vercel Serverless Function — Zoho CRM Lead Submission
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, phone, email, city, capital, segment } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // ===== Step 1: Get fresh Access Token using Refresh Token =====
    const tokenRes = await fetch('https://accounts.zoho.in/oauth/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: (process.env.ZOHO_REFRESH_TOKEN || '').trim(),
        client_id:     (process.env.ZOHO_CLIENT_ID || '').trim(),
        client_secret: (process.env.ZOHO_CLIENT_SECRET || '').trim(),
        grant_type:    'refresh_token'
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error('Token error:', tokenData);
      return res.status(500).json({ error: 'Failed to get Zoho access token', zohoError: tokenData, envCheck: { id: !!process.env.ZOHO_CLIENT_ID, secret: !!process.env.ZOHO_CLIENT_SECRET, refresh: !!process.env.ZOHO_REFRESH_TOKEN } });
    }

    // ===== Step 2: Create Lead in Zoho CRM =====
    const leadRes = await fetch('https://www.zohoapis.in/crm/v3/Leads', {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${tokenData.access_token}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({
        data: [{
          Last_Name:   name,
          Phone:       '+91' + phone,
          Email:       email,
          City:        city,
          Description: `Capital Range: ${capital || 'Not specified'}${segment ? ' | Segment: ' + segment : ''}`,
          Lead_Source: 'Web Site',
          Company:     'Individual Investor'
        }]
      })
    });

    const leadData = await leadRes.json();

    if (leadData.data && leadData.data[0] && leadData.data[0].status === 'success') {
      return res.status(200).json({ success: true, message: 'Lead created successfully' });
    } else {
      console.error('Lead creation error:', JSON.stringify(leadData));
      return res.status(500).json({ error: 'Failed to create lead in Zoho CRM', details: leadData });
    }
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: err.message });
  }
}
