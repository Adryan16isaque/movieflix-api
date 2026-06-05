# Definie a versao do node.js
FROM node:20

# Definie o diretorio de trabalho container
WORKDIR /app

# Copia o arquivo de dependencias pra dentro do continer. (raíz que é o .)
COPY package.json package-lock.json ./

# Instala as dependecias
RUN npm install

# Copia o restante dos arquivos para dentro do container
COPY . .

RUN npx prisma generate

RUN npm run build

# Expor a porta 3000, que vai ser a porta usada pela aplicacao
EXPOSE 3000

#  Define o comando para incializar a plicacao
CMD ["npm", "start"]