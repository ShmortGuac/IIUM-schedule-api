# 1. Use the official Bun image as the base
FROM oven/bun:latest

# 2. Set the folder inside the container where our code will live
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package.json bun.lock ./
RUN bun install

# 4. Copy the rest of your source code
COPY . .

# 5. Tell the container which port to open (Elysia usually uses 3000)
EXPOSE 3000

# 6. The command to start your API
CMD ["bun", "run", "src/index.ts"]