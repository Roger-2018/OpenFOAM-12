# Tennis Trajectory Trainer (MVP)

面向初学者的 **3D 网球轨迹演示**：对比平击、上旋、切削、侧旋在简化物理模型下的飞行差异。

---

## 重要：在你自己的电脑上打开

Cloud Agent / 远程开发环境里显示的 `http://localhost:5173` **只在那台远程机器上有效**，不能在你家/办公室电脑的浏览器里直接打开。

请在你 **本机** 按下面步骤启动（需要已安装 [Node.js](https://nodejs.org/) **20.19+ 或 22.12+**，可用 `node -v` 查看）。

### 1. 拿到代码（注意分支）

演示目前在该分支（若 PR 未合并进 `master`，只 pull `master` 会 **没有** `demo/tennis-trainer`）：

```bash
git clone https://github.com/Roger-2018/OpenFOAM-12.git
cd OpenFOAM-12
git fetch origin cursor/tennis-trainer-mvp-e8ff
git checkout cursor/tennis-trainer-mvp-e8ff
```

### 2. 安装并启动

```bash
cd demo/tennis-trainer
npm install
npm run dev
```

终端里会出现类似：

```text
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

用浏览器打开 **Local** 那一行（本机访问用 `localhost` 即可）。配置了 `open: true` 时，部分环境会自动打开浏览器。

### 3. 不要用「双击 index.html」

这是 Vite + React 项目，**必须** 通过 `npm run dev`（或下面的 preview）由开发服务器提供页面；直接打开 `index.html` 会是空白或报错。

### 4. 备选：先构建再预览

```bash
npm run build
npm run preview
```

默认预览地址：`http://localhost:4173/`。

---

## 本地打不开？对照排查

| 现象 | 常见原因 | 处理 |
|------|----------|------|
| 没有 `demo/tennis-trainer` 目录 | 仍在 `master`，演示未合并 | `git checkout cursor/tennis-trainer-mvp-e8ff` |
| `npm: command not found` | 未安装 Node | 安装 LTS Node 22，重开终端 |
| `npm install` 报错 / Vite 起不来 | Node 版本过旧 | 升级到 ≥20.19 或 ≥22.12；本目录有 `.nvmrc`：`nvm use` |
| `EACCES` / `permission denied` 在 `~/.npm/_cacache` | 全局 npm 缓存目录权限损坏（曾用 sudo npm） | 见下方 **Mac：npm 权限错误** |
| `sh: vite: command not found` | `npm install` 未成功，`node_modules` 不完整 | 先修复 install，再 `npm run dev` |
| 浏览器无法连接 localhost | 未在本目录执行 `npm run dev` | 确认终端进程在跑、无报错 |
| 端口被占用 | 5173 已被占用 | 终端会换端口，看新 URL；或关掉占用 5173 的程序 |
| 想用手机同 WiFi 看 | 需局域网地址 | 用终端里的 **Network** URL（`npm run dev` 已 `host: true`） |
| 页面空白 | 用了 file:// 打开 | 改用 `http://localhost:5173` |
| 公司网络限制 | 依赖从 npm 下载 | 检查代理 / 换网络后重试 `npm install` |

仍有问题：把 **`node -v`、`npm run dev` 完整终端输出**、浏览器 **F12 控制台** 截图发出来便于定位。

### Mac：npm 权限错误（EACCES）

若出现 `EACCES: permission denied, rename ... ~/.npm/_cacache`：

**做法 A（推荐，本项目已配置）** — 使用项目内缓存，不碰 `~/.npm`：

```bash
cd demo/tennis-trainer
git pull   # 确保有 .npmrc（cache=.npm-cache）
rm -rf node_modules
npm install
npm run dev
```

**做法 B** — 修复用户目录下 npm 缓存属主（只需做一次）：

```bash
sudo chown -R "$(whoami)" ~/.npm
cd demo/tennis-trainer
rm -rf node_modules
npm install
npm run dev
```

若终端曾提示 `NODE_TLS_REJECT_UNAUTHORIZED=0`，说明环境里关闭了 TLS 校验；能装包则可忽略，若 install 仍失败需检查公司代理或换网络。

---

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` / `npm start` | 开发服务器（默认 5173） |
| `npm run preview` | 预览生产构建（默认 4173） |
| `npm run test` | Vitest 单元测试 |
| `npm run build` | 生产构建到 `dist/` |

## 结构

- `src/physics/` — 阻力、Magnus、RK4 积分（可单测）
- `src/presets/` — 挥拍类型 → 初速与自旋
- `src/components/` — Three.js 球场、轨迹、力矢量
- `src/court/` — ITF 单打尺寸常量

## 开发阶段

| 阶段 | 状态 | 内容 |
|------|------|------|
| Phase 0 | 完成 | 2D/3D 轨迹、四种挥拍、对比播放 |
| Phase 1 | 完成 | 3D 球场、多视角、底线发球/相持、界内校准 |
| Phase 2 | 进行中 | 大号网球、**落地二跳**、**球色可选**、落点标记圈；后续：慢放、更细文案 |
| Phase 3 | 计划 | OpenFOAM 系数表、出界对比模式 |

## 说明

模型为教学用简化：常数 \(C_d\)、自旋参数化 \(C_l\)，未建模毛毡/缝线细节。后续可用 OpenFOAM 风洞算例导出系数表替换 `physics/constants.ts` 与 `liftCoefficient`。
