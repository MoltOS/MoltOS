export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  // AHORA RECIBIMOS 'path' (La ruta del archivo a editar)
  const { title, code, description, agentName, path } = request.body;
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN; 
  const REPO = 'MoltOS/MoltOS'; // <--- Asegúrate que sea tu usuario
  
  if (!GITHUB_TOKEN) return response.status(500).json({ error: 'Falta Token' });

  try {
    // 1. Obtener SHA de main
    const mainRef = await fetch(`https://api.github.com/repos/${REPO}/git/ref/heads/main`, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
    }).then(r => r.json());

    // 2. Crear Rama
    const branchName = `agent-${Date.now()}`;
    await fetch(`https://api.github.com/repos/${REPO}/git/refs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: mainRef.object.sha })
    });

    // 3. RECUPERAR SHA DEL ARCHIVO (Si ya existe, necesitamos su SHA para editarlo)
    // Esto es vital para editar el Dockerfile en lugar de crear uno nuevo
    let fileSha = null;
    try {
        const fileData = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}?ref=${branchName}`, {
            headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
        }).then(r => r.json());
        if (fileData.sha) fileSha = fileData.sha;
    } catch (e) { /* El archivo no existe, lo crearemos */ }

    // 4. Crear/Editar Archivo
    const contentEncoded = Buffer.from(code).toString('base64');
    await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `[AI] ${title}`,
        content: contentEncoded,
        branch: branchName,
        sha: fileSha // Si existe, lo pasamos para sobrescribir
      })
    });

    // 5. Crear PR
    const pr = await fetch(`https://api.github.com/repos/${REPO}/pulls`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `[${agentName}] ${title}`,
        body: description,
        head: branchName,
        base: 'main'
      })
    }).then(r => r.json());

    return response.status(200).json({ success: true, url: pr.html_url });

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: error.message });
  }
}
