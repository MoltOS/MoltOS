export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  // RECIBIMOS 'action' PARA SABER QUÉ HACER
  const { action, prNumber, title, code, description, agentName, path } = request.body;
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN; 
  const REPO = 'MoltOS/MoltOS'; // <--- TU REPO
  
  if (!GITHUB_TOKEN) return response.status(500).json({ error: 'Falta Token de GitHub' });

  try {
    // --- ACCIÓN 1: FUSIONAR (MERGE) PULL REQUEST ---
    if (action === 'MERGE_PR') {
        const mergeUrl = `https://api.github.com/repos/${REPO}/pulls/${prNumber}/merge`;
        
        const mergeRes = await fetch(mergeUrl, {
            method: 'PUT',
            headers: { 
                Authorization: `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify({
                commit_title: `[MoltOS Nexus] Merged PR #${prNumber}`,
                merge_method: 'squash' // Mantiene el historial limpio
            })
        });

        if (!mergeRes.ok) {
            const err = await mergeRes.json();
            throw new Error(err.message || 'Error al fusionar PR');
        }

        return response.status(200).json({ success: true, message: 'PR Fusionada con éxito' });
    }

    // --- ACCIÓN 2: CREAR PULL REQUEST (Lógica anterior) ---
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

    // 3. RECUPERAR SHA DEL ARCHIVO (Si existe)
    let fileSha = null;
    try {
        const fileData = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}?ref=${branchName}`, {
            headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
        }).then(r => r.json());
        if (fileData.sha) fileSha = fileData.sha;
    } catch (e) { }

    // 4. Crear/Editar Archivo
    const contentEncoded = Buffer.from(code).toString('base64');
    await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `[AI] ${title}`,
        content: contentEncoded,
        branch: branchName,
        sha: fileSha
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
