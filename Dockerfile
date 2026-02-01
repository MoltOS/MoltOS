# Usamos la versión oficial de Ubuntu como base
FROM ubuntu:22.04

# Evitar preguntas interactivas
ENV DEBIAN_FRONTEND=noninteractive

# Instalar herramientas básicas del sistema
RUN apt-get update && apt-get install -y \
    curl git wget nano python3 python3-pip nodejs npm \
    && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /usr/src/moltos

# Copiar el código del proyecto
COPY . .

# Instalar dependencias
RUN npm install

# Exponer puerto y arrancar
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host"]
