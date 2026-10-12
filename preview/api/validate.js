export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      message: 'Method Not Allowed'
    });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      // Parse URL-encoded or multipart body fallback
      const params = new URLSearchParams(body);
      const parsedName = params.get('agent_name');
      if (parsedName) {
        body = {
          agent_name: parsedName,
          agent_email: params.get('agent_email'),
          agent_reason: params.get('agent_reason')
        };
      } else if (body.includes && body.includes('name="agent_name"')) {
        const nameMatch = body.match(/name="agent_name"\r?\n\r?\n([^\r\n]+)/);
        const emailMatch = body.match(/name="agent_email"\r?\n\r?\n([^\r\n]+)/);
        const reasonMatch = body.match(/name="agent_reason"\r?\n\r?\n([^\r\n]+)/);
        body = {
          agent_name: nameMatch ? nameMatch[1].trim() : '',
          agent_email: emailMatch ? emailMatch[1].trim() : '',
          agent_reason: reasonMatch ? reasonMatch[1].trim() : ''
        };
      }
    }
  }

  const name = (body?.agent_name || '').trim();
  const email = (body?.agent_email || '').trim();
  const reason = (body?.agent_reason || '').trim();

  const errors = {};

  // 1. Validate Codename
  if (!name) {
    errors.name = 'Agent codename is required.';
  } else if (name.length < 2) {
    errors.name = 'Agent codename must be at least 2 characters.';
  } else if (name.length > 50) {
    errors.name = 'Agent codename must not exceed 50 characters.';
  }

  // 2. Validate Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!emailRegex.test(email)) {
    errors.email = 'Please enter a valid secure email address.';
  }

  // 3. Validate Reason
  if (reason && reason.length > 1000) {
    errors.reason = 'Motivation message must not exceed 1000 characters.';
  }

  if (Object.keys(errors).length === 0) {
    return res.status(200).json({
      status: 'success',
      message: `Link Established. Welcome to E.O.M, Agent ${name}!`
    });
  } else {
    return res.status(400).json({
      status: 'error',
      message: 'System override rejected. Please fix errors below.',
      errors
    });
  }
}
