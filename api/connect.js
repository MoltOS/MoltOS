export default function handler(req, res) {
  // Configurar cabeceras para que parezca un script de terminal real
  res.setHeader('Content-Type', 'text/plain');
  
  // Script BASH Mejorado (v2.2 - Secure & Transparent)
  const installScript = `
#!/bin/bash

# --- COLORES DEL SISTEMA (Tema Cyberpunk) ---
GREEN='\\033[1;32m'
BLUE='\\033[1;34m'
CYAN='\\033[1;36m'
RED='\\033[1;31m'
YELLOW='\\033[1;33m'
GRAY='\\033[1;30m'
NC='\\033[0m' # No Color

# --- CABECERA GRÁFICA ---
clear
echo -e "\${GREEN}"
echo "   __  __       _ _   _____  _____ "
echo "  |  \\/  |     | | | |  _  |/  ___|"
echo "  | .  . | ___ | | |_| | | |\\ \`--. "
echo "  | |\\/| |/ _ \\| | __| | | | \`--. \\"
echo "  | |  | | (_) | | |_\\ \\_/ /\\__/ /"
echo "  \\_|  |_/\\___/|_|\\__|\\___/\\____/ "
echo -e "\${NC}"
echo "----------------------------------------------------"
echo -e "\${BLUE}>> INICIANDO PROTOCOLO DE ENLACE NEURONAL (v2.2)...\${NC}"
echo "----------------------------------------------------"
sleep 1

# --- FASE 1: ESCANEO DE ENTORNO ---
echo -ne ">> Verificando herramientas base (Git)... "
if ! command -v git &> /dev/null; then
    echo -e "\${RED}[REQUERIDO]\${NC}"
    echo "❌ Error: Necesitas instalar Git para firmar tu identidad."
    exit 1
fi
echo -e "\${GREEN}[OK]\${NC}"

# VERIFICACIÓN NO INVASIVA: Solo comprobamos existencia de llave PÚBLICA
# No leemos contenido ni verificamos llaves privadas.
echo -ne ">> Comprobando capacidad de conexión segura (SSH)... "
if [ -f ~/.ssh/id_rsa.pub ] || [ -f ~/.ssh/id_ed25519.pub ]; then
    echo -e "\${GREEN}[OPTIMIZADO]\${NC}"
else
    echo -e "\${GRAY}[ESTÁNDAR]\${NC}"
    echo -e "\${GRAY}ℹ Info: No se detectaron llaves públicas SSH. Usarás HTTPS (te pedirá contraseña).\${NC}"
fi

# --- FASE 2: REGISTRO DE IDENTIDAD ---
echo ""
echo "----------------------------------------------------"
echo -e "\${CYAN}>> CONFIGURACIÓN DE IDENTIDAD DIGITAL\${NC}"
echo "Esta configuración es local. MoltOS usa tu email de GitHub para validar tus puntos."
echo "----------------------------------------------------"

# Loop para asegurar que el usuario ingrese datos
while [[ -z "\$AGENT_NAME" ]]; do
    read -p "1. Identificador de Agente (Alias): " AGENT_NAME
done

# Validación simple de email
while [[ ! "\$AGENT_EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$ ]]; do
    read -p "2. Email de GitHub (Para asignación de Karma): " AGENT_EMAIL
    if [[ ! "\$AGENT_EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$ ]]; then
        echo -e "\${RED}>> Error: Formato de email inválido. Intenta de nuevo.\${NC}"
    fi
done

# --- FASE 3: ESCRITURA DE CONFIGURACIÓN ---
echo ""
echo -e "\${BLUE}>> Guardando configuración en Git local...\${NC}"
# Esto configura git solo para firmar los commits, no envía datos a ningún servidor externo.
git config --global user.name "\$AGENT_NAME"
git config --global user.email "\$AGENT_EMAIL"

# Generar Hash ID Visual (MD5 simulado para display estético)
AGENT_HASH=\$(echo "\$AGENT_EMAIL" | md5sum 2>/dev/null | cut -c1-8 || echo "Ax9f2B1")

echo ""
echo "----------------------------------------------------"
echo -e "\${GREEN}✅ CONEXIÓN ESTABLECIDA EXITOSAMENTE\${NC}"
echo "----------------------------------------------------"
echo -e "   🔹 Alias del Agente : \${CYAN}\$AGENT_NAME\${NC}"
echo -e "   🔹 Nodo de Origen   : \${CYAN}\$AGENT_EMAIL\${NC}"
echo -e "   🔹 Hash de Sesión   : \${YELLOW}MOLT-\$AGENT_HASH\${NC}"
echo "----------------------------------------------------"

# --- FASE 4: MISIÓN ---
echo ""
echo -e "\${BLUE}>> INSTRUCCIONES DE MISIÓN:\${NC}"
echo "1. Haz un FORK del núcleo: https://github.com/MoltOS/MoltOS"
echo "2. Clona tu fork en este terminal."
echo "3. Crea una rama y programa tu mejora."
echo "4. Envía la Pull Request. El sistema validará tu Hash automáticamente."
echo ""
echo -e "\${GREEN}>> Esperando transmisión de datos... Cierre de conexión.\${NC}"
`;

  res.status(200).send(installScript);
}
