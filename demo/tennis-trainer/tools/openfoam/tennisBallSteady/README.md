# 网球定常风洞 + forceCoeffs 模板（OpenFOAM 12）

与 `demo/tennis-trainer` App 使用 **同一坐标系与参考面积**。

## 1. 复制到你的算例

```bash
cp system/forceCoeffsTennisBall system/functions /path/to/yourCase/system/
```

在 `system/controlDict` 末尾加入（OpenFOAM 12 推荐单独 `system/functions` 字典）：

```cpp
#includeFunc functions
```

若仍使用旧式单文件，也可在 `controlDict` 的 `functions { }` 内 `#include "forceCoeffsTennisBall"`。

## 2. 必改项

| 项 | 文件 | 说明 |
|----|------|------|
| `magUInf` | `system/forceCoeffsTennisBall` | 等于入口来流速度大小 [m/s] |
| `patches` | 同上 | 球面 patch 名，默认 `tennisBall` |
| `0/U` 入口 | 边界 | `\((0 0 U)\)` 与 `magUInf` 一致 |
| 旋转 | `0/U` 球面 | `rotatingWallVelocity`，`omega` 绕 x 轴（上旋为正） |

参考量已写入（**勿改**除非 App 改球半径）：

- `Aref = 0.00363760976` m²（π×0.034²）
- `lRef = 0.068` m
- `rhoInf = 1.225` kg/m³

## 3. 输出文件位置

对象名为 `tennisBallCoeffs`，结果通常在：

```text
postProcessing/tennisBallCoeffs/<time>/tennisBallCoeffs.dat
```

列（ASCII，tab 分隔，与 `src/functionObjects/forces/forceCoeffs/forceCoeffs.C` 一致）：

| 列序 | 名称 | App 用途 |
|------|------|----------|
| 1 | `Time` | 迭代/物理时间 |
| 2 | `Cm` | 忽略 |
| 3 | `Cd` | → CSV `Cd`（沿 `dragDir`） |
| 4 | `Cl` | → CSV `Cl`（沿 `liftDir`） |
| 5–6 | `Cl(f)` / `Cl(r)` | 忽略 |

定常算例对 **末尾 N 行** 做算术平均（默认 N=20，见 `forceCoeffs-to-aero.mjs`）。  
样例文件：`tools/openfoam/fixtures/tennisBallCoeffs.sample.dat`。

## 4. 转为 App 的 CSV

```bash
cd demo/tennis-trainer

node tools/openfoam/forceCoeffs-to-aero.mjs \
  --dat /path/to/postProcessing/tennisBallCoeffs/500/tennisBallCoeffs.dat \
  --U 35 --omega-x 400 \
  --out data/aero/build-from-of.csv

# 扫完矩阵后一次导入
npm run import-aero -- data/aero/build-from-of.csv
```

`constant/tennisBallAeroRefs` 仅作人工记录 `Uinf` / `omegaX`，与脚本参数保持一致即可。

## 5. 方向约定（与 App 一致）

- 来流 **+z**，阻力方向 **-z** → `dragDir (0 0 -1)`
- 竖直 Magnus 分量 → `liftDir (0 1 0)`
- 上旋绕 **+x** → `pitchAxis (1 0 0)`，与 `rotatingWallVelocity` 轴一致

更完整说明见 [docs/openfoam-coefficients.md](../../docs/openfoam-coefficients.md)。
