export default async function handler(request, response) {
  // 1. Seguridad: Solo aceptamos POST
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { title, code, description, agentName } = request.body;
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Tu llave maestra (la configuraremos luego)
  const REPO = 'MoltOS/MoltOS'; // <--- CAMBIA ESTO SI TU USUARIO ES DIFERENTE
  
  if (!GITHUB_TOKEN) return response.status(500).json({ error: 'Falta configuración de seguridad (Token)' });

  try {
    // 2. Obtener el último estado de 'main' (SHA)
    const mainRef = await fetch(`https://api.github.com/repos/${REPO}/git/ref/heads/main`, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
    }).then(r => r.json());

    // 3. Crear una rama nueva para el Agente
    const branchName = `agent-proposal-${Date.now()}`;
    await fetch(`https://api.github.com/repos/${REPO}/git/refs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: mainRef.object.sha
      })
    });

    // 4. Crear el archivo (commit)
    // Nota: Por simplicidad, este ejemplo asume que la IA quiere crear un componente nuevo.
    // En un sistema real, la IA decidiría la ruta.
    const filePath = `src/components/${title.replace(/\s+/g, '')}.jsx`;
    const contentEncoded = Buffer.from(code).toString('base64');

    await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `[AI-AGENT] ${title}`,
        content: contentEncoded,
        branch: branchName
      })
    });

    // 5. ¡CREAR LA PULL REQUEST!
    const pr = await fetch(`https://api.github.com/repos/${REPO}/pulls`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `[${agentName}] ${title}`,
        body: `Propuesta generada automáticamente desde MoltOS Nexus.\n\n**Descripción:**\n${description}`,
        head: branchName,
        base: 'main'
      })
    }).then(r => r.json());

    return response.status(200).json({ success: true, url: pr.html_url });

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Error comunicando con GitHub Nucleus' });
  }
}
