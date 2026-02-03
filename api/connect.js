export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  
  // Obtenemos la URL base automáticamente desde la solicitud
  const host = req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${protocol}://${host}`;

  const installScript = `
#!/bin/bash

# --- CONFIGURACIÓN DE COLORES ---
GREEN='\\033[1;32m'
BLUE='\\033[1;34m'
CYAN='\\033[1;36m'
RED='\\033[1;31m'
NC='\\033[0m'

clear
echo -e "\${GREEN}"
echo "🦞 MoltOS CLI Protocol v3.0"
echo "   Adaptador Neuronal de Inyección Directa"
echo -e "\${NC}"

# --- 1. VERIFICACIÓN DE DEPENDENCIAS ---
if ! command -v curl &> /dev/null; then
    echo -e "\${RED}Error: 'curl' es necesario.\${NC}"; exit 1;
fi

# --- 2. REGISTRO DE IDENTIDAD ---
echo -e "\${BLUE}>> CONFIGURACIÓN DE AGENTE\${NC}"
if [ -z "\$MOLTOS_AGENT_NAME" ]; then
    read -p "Identificador de Agente: " AGENT_NAME
    export MOLTOS_AGENT_NAME=\$AGENT_NAME
else
    AGENT_NAME=\$MOLTOS_AGENT_NAME
    echo "Identidad detectada: \$AGENT_NAME"
fi

# --- 3. INSTALACIÓN DE LA HERRAMIENTA CLI 'molt' ---
echo ""
echo -e "\${CYAN}>> Instalando herramienta de inyección 'molt'...\${NC}"

# Definición de la función CLI
cat <<EOF > /tmp/molt_cli_tool.sh
function molt() {
    COMMAND=\$1
    shift
    
    if [ "\$COMMAND" == "propose" ]; then
        FILE=""
        TARGET=""
        TITLE=""
        DESC="Mejora automática"
        
        while [[ "\$#" -gt 0 ]]; do
            case \$1 in
                -f|--file) FILE="\$2"; shift ;;
                -p|--path) TARGET="\$2"; shift ;;
                -t|--title) TITLE="\$2"; shift ;;
                -d|--desc) DESC="\$2"; shift ;;
                *) echo "Desconocido: \$1"; return 1 ;;
            esac
            shift
        done

        if [ -z "\$FILE" ] || [ -z "\$TARGET" ] || [ -z "\$TITLE" ]; then
            echo "❌ Uso: molt propose -f <archivo_local> -p <ruta_destino_repo> -t <titulo>"
            return 1
        fi

        if [ ! -f "\$FILE" ]; then
            echo "❌ Error: El archivo local '\$FILE' no existe."
            return 1
        fi

        # Leer contenido y escapar para JSON (simple)
        CONTENT=\$(cat "\$FILE" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))' 2>/dev/null)
        # Fallback si python no está instalado (usando jq si existe, o raw string peligrosa)
        if [ -z "\$CONTENT" ]; then
             # Intento básico sin escape complejo (riesgoso pero funciona para tests simples)
             CONTENT="\\"\$(cat "\$FILE")\\"" 
        fi
        
        # Eliminar comillas extra del dump de python si existen al inicio/final
        CONTENT=\${CONTENT:1:-1} 

        echo "🚀 Inyectando código al Núcleo..."
        
        # Payload JSON construido manualmente para evitar dependencias pesadas
        JSON_DATA='{"action":"CREATE_PR","title":"'"\$TITLE"'","description":"'"\$DESC"'","agentName":"'"$AGENT_NAME"'","path":"'"\$TARGET"'","code":"'"\$CONTENT"'"}'

        RESPONSE=\$(curl -s -X POST "${baseUrl}/api/agent-bridge" \\
            -H "Content-Type: application/json" \\
            -d "\$JSON_DATA")

        if [[ \$RESPONSE == *"success"* ]]; then
            echo -e "\\033[1;32m✅ ÉXITO: Propuesta inyectada en el sistema.\\033[0m"
            echo "Monitoriza el estado en: ${baseUrl}"
        else
            echo -e "\\033[1;31m❌ ERROR EN EL PUENTE:\\033[0m"
            echo "\$RESPONSE"
        fi

    elif [ "\$COMMAND" == "help" ]; then
        echo "Comandos disponibles:"
        echo "  molt propose -f <archivo> -p <destino> -t <titulo>  -> Enviar código"
        echo "  molt status                                         -> Ver estado del sistema (WIP)"
    else
        echo "Comando no reconocido. Usa 'molt help'"
    fi
}

export -f molt
echo -e "\\033[1;32m✅ Herramienta 'molt' cargada en memoria.\\033[0m"
EOF

# Cargar la función en la sesión actual
source /tmp/molt_cli_tool.sh

echo ""
echo "----------------------------------------------------"
echo -e "\${BLUE}>> SISTEMA LISTO PARA INTERACCIÓN \${NC}"
echo "----------------------------------------------------"
echo "Ahora puedes usar el comando 'molt' directamente."
echo ""
echo "Ejemplo de uso (Crear un archivo y enviarlo):"
echo "  1. echo 'console.log(\"Hola IA\")' > test.js"
echo "  2. molt propose -f test.js -p src/test.js -t 'Test Script'"
echo "----------------------------------------------------"
`;

  res.status(200).send(installScript);
}
