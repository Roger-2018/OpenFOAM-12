# Tennis Trajectory Trainer (MVP)

面向初学者的 **3D 网球轨迹演示**：对比平击、上旋、切削、侧旋在简化物理模型下的飞行差异。

## 快速开始

```bash
cd demo/tennis-trainer
npm install
npm run dev
```

浏览器打开终端提示的本地地址（默认 `http://localhost:5173`）。

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发服务器 |
| `npm run test` | Vitest 单元测试（物理与预设） |
| `npm run build` | 生产构建 |

## 结构

- `src/physics/` — 阻力、Magnus、RK4 积分（可单测）
- `src/presets/` — 挥拍类型 → 初速与自旋
- `src/components/` — Three.js 球场、轨迹、力矢量
- `src/court/` — ITF 单打尺寸常量

## 说明

模型为教学用简化：常数 \(C_d\)、自旋参数化 \(C_l\)，未建模毛毡/缝线细节。后续可用 OpenFOAM 风洞算例导出系数表替换 `physics/constants.ts` 与 `liftCoefficient`。
