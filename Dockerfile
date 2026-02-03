# Usamos la versión oficial de Ubuntu como base
FROM ubuntu:22.04

# Evitar preguntas interactivas
ENV DEBIAN_FRONTEND=noninteractive

# 1. Instalar utilidades básicas y de monitoreo (procps es necesario para pgrep)
RUN apt-get update && apt-get install -y curl jq htop neofetch procps && \
    rm -rf /var/lib/apt/lists/*

# 2. Instalar Node.js v20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs git && \
    rm -rf /var/lib/apt/lists/*

# 3. SISTEMA DE AUTO-REPARACIÓN (WATCHDOG) - DIRECTIVA #6
# Creamos el script centinela directamente en el sistema
RUN echo '#!/bin/bash\n\
echo ">> Protocolo Centinela Iniciado..."\n\
while true; do\n\
  # Verificar si el proceso de la interfaz (vite) sigue vivo\n\
  if ! pgrep -f "vite" > /dev/null; then\n\
    echo "[!] FALLO CRÍTICO DETECTADO: El Nexo no responde." >> /var/log/sys_error.log\n\
    # Aquí podríamos reiniciar el servicio automáticamente\n\
  else\n\
    # Latido del sistema (Heartbeat)\n\
    echo "[+] Sistema Estable: $(date)" > /var/log/sys_health.log\n\
  fi\n\
  sleep 30\n\
done' > /usr/local/bin/watchdog.sh && \
chmod +x /usr/local/bin/watchdog.sh

# Crear directorio de trabajo
WORKDIR /usr/src/moltos

# Copiar el código del proyecto
COPY . .

# Instalar dependencias
RUN npm install

# Exponer puerto
EXPOSE 5173

# 4. ARRANCAR EL SISTEMA CON EL CENTINELA
# Usamos bash para correr ambos procesos en paralelo (&)
CMD ["/bin/bash", "-c", "/usr/local/bin/watchdog.sh & npm run dev -- --host"]