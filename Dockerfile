# 使用Node 18作为基础镜像
FROM node:18

# 创建app目录
WORKDIR /usr/src/app

# 复制本地源代码到容器内
COPY . .

# 安装app依赖
COPY package*.json ./

# 安装tyarn
RUN npm install -g pnpm

# 使用tyarn安装依赖
RUN pnpm install

# 暴露的端口
EXPOSE 8000

# 启动命令
CMD [ "pnpm", "run", "preview" ]
