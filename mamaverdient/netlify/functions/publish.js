exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' },
      body: ''
    };
  }

  const token = process.env.GITHUB_TOKEN;
  const user  = process.env.GITHUB_USER;
  const repo  = process.env.GITHUB_REPO;
  const file  = process.env.GITHUB_FILE || 'index.html';
  const apiUrl = `https://api.github.com/repos/${user}/${repo}/contents/${file}`;
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };

  try {
    const body = JSON.parse(event.body || '{}');

    // Step 1: Get SHA
    if (body.getSha) {
      const res = await fetch(apiUrl, { headers });
      const data = await res.json();
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ sha: data.sha })
      };
    }

    // Step 2: Push file
    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: 'Update via MamaVerdient CMS',
        content: body.content,
        sha: body.sha
      })
    });
    const data = await res.json();

    return {
      statusCode: res.ok ? 200 : res.status,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(res.ok ? { success: true } : { error: data.message })
    };

  } catch(e) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message })
    };
  }
};
