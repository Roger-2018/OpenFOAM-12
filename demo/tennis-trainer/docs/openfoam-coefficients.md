# 用 OpenFOAM 标定网球气动力系数并接入演示 App

演示 App **运行时不会跑 OpenFOAM**，标准流程是：**CFD 离线算力系数 → 导出 CSV → 导入 `public/data/aero.csv`**，浏览器按表插值 \(C_d、C_l\)。

---

## 1. 物理量在 App 里的定义

| 符号 | 含义 | 计算 |
|------|------|------|
| `Re` | 雷诺数 | \(Re = \| \mathbf{v} \| \cdot d / \nu\)，\(d=2R\)，\(\nu=1.5\times10^{-5}\,\mathrm{m^2/s}\) |
| `spin_param` | 自旋参数 | \(r \|\boldsymbol\omega\| / \|\mathbf{v}\|\) |
| `Cd` | 阻力系数 | \(\|\mathbf{F}_d\| / (0.5\rho C_d A \|\mathbf{v}\|^2)\) |
| `Cl` | 升力/Magnus 系数 | 侧向力模长同量级定义（与 `src/physics/forces.ts` 中 Magnus 方向一致） |

球半径、质量见 `src/physics/constants.ts`（接近 ITF）。

---

## 2. forceCoeffs 模板（已配置）

仓库内可直接复制：

```text
demo/tennis-trainer/tools/openfoam/tennisBallSteady/
├── system/forceCoeffsTennisBall    # magUInf、Aref、lRef、lift/drag 方向
├── constant/tennisBallAeroRefs     # 记录 Uinf、omegaX（人工对照）
└── README.md
```

复制 `system/forceCoeffsTennisBall` 与 `system/functions`，在 `controlDict` 写 `#includeFunc functions`（OF12 惯例）。  

**输出路径与格式**

```text
postProcessing/tennisBallCoeffs/<time>/tennisBallCoeffs.dat
```

文件头为 `#` 注释（含 `liftDir` / `magUInf` / `Aref` 等），数据行：

```text
<Time>  <Cm>  <Cd>  <Cl>  <Cl(f)>  <Cl(r)>
```

导入 App 时只取 **Cd（第 3 列）**、**Cl（第 4 列）**；样例见 `tools/openfoam/fixtures/tennisBallCoeffs.sample.dat`。

转为 App CSV：

```bash
npm run forceCoeffs-to-aero -- \
  --dat postProcessing/tennisBallCoeffs/500/tennisBallCoeffs.dat \
  --U 35 --omega-x 400 \
  --out data/aero/build-from-of.csv
npm run import-aero -- data/aero/build-from-of.csv
```

## 3. OpenFOAM 风洞算例思路（固定球 + 来流 + 旋转壁面）

在仓库 OpenFOAM 12 环境中（需先 `source` 对应 `etc/bashrc`）：

1. **几何**：光滑球或简化网球 STL；外流场 `snappyHexMesh`。
2. **求解器**：不可压定常 `simpleFoam` 或瞬态平均 `pimpleFoam`（Ma≲0.3 可不可压）。
3. **边界**：
   - 入口：均匀来流，速度 = 对应击球速度 \(U\)；
   - 球面：`rotatingWallVelocity`，角速度 = 自旋 \(\boldsymbol\omega\)；
   - 远场：自由流/对称。
4. **后处理**：`forces` / `forceCoeffs` 函数对象，时间平均后得到 \(C_d、C_l\)（注意 **参考面积、参考长度** 与 App 一致，\(A=\pi R^2\)）。

对每个组合 \((U, \omega)\) 算一点，换算为 \((Re, spin\_param)\) 填入 CSV。

社区可参考 Magnus / 旋转球算例思路：[Holzmann CFD Magnus effect](https://holzmann-cfd.com/community/training-cases/magnus-effect)（多为 2D 圆柱，需自行改为 3D 球 + 网球参数）。

---

## 4. CSV 格式（必须）

```csv
Re,spin_param,Cd,Cl,notes
100000,0,0.52,0,case-01
100000,0.5,0.54,0.12,case-02
```

- 列名固定：`Re`, `spin_param`, `Cd`, `Cl`（`notes` 可选）。
- 以 `#` 开头的行会被忽略。
- 示例表：
  - 演示默认：`data/aero/demo-default.csv`
  - 虚构 OF 样例：`tools/openfoam/sample-forces.csv`

---

## 5. 导入到 App

```bash
cd demo/tennis-trainer
npm run import-aero -- tools/openfoam/sample-forces.csv
npm run dev
```

脚本会把 CSV 复制到 `public/data/aero.csv`。启动时 App 会 `fetch('/data/aero.csv')` 并调用 `loadAeroTableFromCsv`；失败则使用内置演示表。

也可手动覆盖 `public/data/aero.csv`。

---

## 6. 代码入口（开发）

| 文件 | 作用 |
|------|------|
| `src/physics/aeroTable.ts` | 解析 CSV、\(Re\) 与 `spin_param` 双线性插值 |
| `src/physics/aeroProvider.ts` | 全局系数表、`getAeroCoefficients(speed, \|ω\|)` |
| `src/physics/forces.ts` | 阻力 / Magnus 使用插值后的 \(C_d、C_l\) |
| `src/physics/bounce.ts` | **落地仍用演示模型**，与 OF 无关（后续可另建 `bounce.csv`） |

单元测试：`aeroTable.test.ts`、`aeroProvider.test.ts`。

---

## 7. 落地系数（后续扩展）

当前 **二跳** 仍为教学用经验公式。若需 OpenFOAM/实验标定弹地，建议：

1. 单独维护 `data/bounce/restitution.csv`（入射角、\(\omega_x\)、\(e\)、\(\mu\)）；
2. 在 `bounce.ts` 中查表替换 `spinVerticalKickFactor`；
3. 文档与 `import-bounce.mjs` 可与气动力流程对称添加。

---

## 8. 验证建议

1. 选 2～3 个 \((U,\omega)\) 用 OF 算 \(C_d、C_l\)，写入 CSV；
2. `npm run test` 确保插值通过；
3. 在 App 中固定初速/自旋（可临时关 `fitToCourt`）对比 OF 力方向与轨迹趋势；
4. 再开界内校准做教学演示。

真球毛毡/缝线会使 EFD 与光滑球 CFD 仍有差距，文献见 Alam 等网球 aerodynamics 工作；光滑球 CFD 适合 **趋势与旋转效应**，定量需实验修正。
