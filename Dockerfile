# Usamos la versión oficial de Ubuntu como base
FROM ubuntu:22.04

# Evitar preguntas interactivas
ENV DEBIAN_FRONTEND=noninteractive

# 1. Instalar utilidades básicas Y CMATRIX (LA PRUEBA)
RUN apt-get update && apt-get install -y curl cmatrix

# 2. Instalar Node.js v20 (URL limpia y corregida)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs git wget nano python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /usr/src/moltos

# Copiar el código del proyecto
COPY . .

# Instalar dependencias
RUN npm install

# Exponer puerto y arrancar
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]