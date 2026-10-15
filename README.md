<div align="center">

# Cover Studio

**从一个想法，到每一个图层。**

一个集 AI 生图、图片拆层和图层编辑于一体的轻量网页工作台。

**在线访问：[https://cover.aigce.com/](https://cover.aigce.com/)**

[在线体验](https://cover.aigce.com) · [快速开始](#快速开始) · [Cloudflare 部署](#cloudflare-部署) · [数据与隐私](#数据与隐私)

</div>

---

输入提示词生成封面或海报，将图片拆成透明图层，再拖动、缩放、调整叠放顺序，导出最终作品。支持 Python 本地运行与 Cloudflare Workers 部署，无需前端构建。

> 不填写 API Key 也可以点击「载入示例」，体验已有海报的 7 个图层。生成新图或重新拆层需要具备对应模型权限的蚂蚁数科 MaaS API Key。

## 功能特性

- **四个创作板块**：封面图、小红书、电商海报、自由创作，各自保留独立提示词与设置。
- **风格与模板**：集成 Punk 封面风格规则与 PONYO 小红书封面模板，支持查看、修改编译后的提示词。
- **生成与拆层**：从文字生成图片，或上传 PNG、JPEG、WebP 图片进行拆层，上传上限为 20 MB。
- **图层编辑**：拖动、等比缩放、显示与隐藏、锁定、重命名、拖拽排序，以及撤销和重做。
- **多比例导出**：支持原图、合成 PNG、单层 PNG 和原始图层 ZIP 下载。
- **素材库**：保存生成与拆层结果，支持筛选、重新载入、删除及当前页面撤销删除。
- **两种运行方式**：本地 Python 服务，或 Cloudflare Workers + Static Assets。

## 作品示例

<p align="center">
  <img src="static/example.png" alt="白茶香氛沐浴露电商海报示例" width="360">
</p>

仓库内附有这张海报及对应的 7 个拆分图层。载入后即可体验组合预览、拖动和导出，无需调用模型。

## 快速开始

### 环境要求

| 环境 | 用途 |
| --- | --- |
| Python 3.10+ | 本地服务，仅使用标准库，无需安装 Python 依赖 |
| Node.js 20+ 与 npm | 运行 JavaScript 检查及 Wrangler 部署 |
| MaaS API Key | 调用生图与拆层模型；查看内置示例无需 Key |

### 本地运行

下载仓库并解压，进入项目目录后执行：

```bash
cd cover-studio
python3 server.py
```

打开 [http://127.0.0.1:8765](http://127.0.0.1:8765)，在右上角「API 设置」填写自己的 Key。

自动打开浏览器，或指定其他端口：

```bash
python3 server.py --open
python3 server.py --port 8766
```

macOS 也可以双击仓库内的 `启动.command`。本地服务仅监听 `127.0.0.1`，公网部署请使用下面的 Workers 方案。

### 使用流程

1. **生成**：选择创作品类，填写提示词或载入预设，选择比例后生成图片。
2. **拆解**：点击「继续拆解图层」，也可以上传已有图片；确认图层规划后开始拆解。
3. **编辑**：在画布中选择图层，拖动位置、缩放大小，在右侧调整显隐和叠放顺序。
4. **导出**：下载原图、编辑后的合成 PNG、单层 PNG，或原始图层 ZIP。

## 图层操作

| 操作 | 使用方式 |
| --- | --- |
| 选择图层 | 点击画布中的元素，或右侧图层行 |
| 移动 | 拖动画布中的图层；按住 Alt 可关闭原位吸附 |
| 微调 | 方向键移动 1 px，Shift + 方向键移动 10 px |
| 缩放 | 拖动选框角点，或输入 10%–400% 的缩放比例 |
| 调整叠放 | 拖动图层行左侧手柄；右键菜单支持置顶、上移、下移和置底 |
| 显隐与锁定 | 点击图层行的眼睛或锁图标；Delete 可隐藏选中图层 |
| 撤销 / 重做 | macOS：⌘Z / ⇧⌘Z；Windows：Ctrl+Z / Ctrl+Shift+Z |
| 复位 | 使用「复位选中」或「全部复位」恢复位置与大小 |

图层列表上方覆盖下方。完整背景默认锁定，解锁后可以移动。导出合成图使用当前编辑状态，原始图层 ZIP 保留模型输出。

支持 `1:1`、`9:16`、`16:9`、`5:2`、`4:3`、`3:4` 等比例。切换导出比例会等比适配完整画面，比例不一致时留白，不拉伸图片。

## Cloudflare 部署

使用 **Workers + Static Assets** 同时提供网页与 API 转发。仅上传静态文件不能提供生图和拆层接口。

### 1. 登录并预览

在项目根目录执行：

```bash
npx wrangler login
npx wrangler dev
```

### 2. 发布

```bash
npx wrangler deploy
```

发布完成后，通过终端返回的地址访问。每位使用者在网页内填写自己的 MaaS Key，无需在 Worker 中配置统一的站长 Key。

### 3. 可选：指定账户与自定义域名

仓库中的 `wrangler.jsonc` 不包含个人账户或域名绑定。登录了多个账户时，添加自己的 `account_id`；需要绑定域名时，在原配置中添加：

```jsonc
{
  // 以下字段合并到已有配置中，保留 main、assets 等字段。
  "account_id": "YOUR_CLOUDFLARE_ACCOUNT_ID",
  "routes": [
    { "pattern": "cover.example.com", "custom_domain": true }
  ]
}
```

域名需要由所选 Cloudflare 账户管理。修改后重新运行 `npx wrangler deploy`。

## 数据与隐私

| 项目 | Python 本地模式 | Cloudflare 模式 |
| --- | --- | --- |
| API Key | 当前页面内存；可从本机 `.local-key` 载入 | 当前页面内存，刷新后需要重新填写 |
| 模型请求 | 由本地 Python 服务转发给 MaaS | 由 Worker 转发给 MaaS |
| 作品与任务记录 | 项目目录下的 `output/` | 当前浏览器的 IndexedDB |
| 跨设备同步 | 不支持 | 不支持 |

- API Key 不写入素材记录。Worker 不保存或回显 Key，仓库默认关闭 Worker 可观测日志。
- `.local-key`、`output/`、`.env` 和 `.dev.vars` 等本地文件已加入 `.gitignore`，不要将真实凭据提交到仓库。
- 线上作品没有设置自动到期时间。清理网站数据、使用其他浏览器或更换设备后，无法读取原浏览器中的作品；重要作品请及时下载。
- 素材库保存模型原始输出，拖动、缩放和显隐等编辑状态暂不自动保存到历史。请导出合成 PNG 保存编辑结果。
- 本地作品不会随部署上传到线上，浏览器素材库也不会自动同步到服务器。

## 模型接入

当前接入蚂蚁数科 MaaS 的两个图片模型：

| 能力 | 模型 | 上游接口 |
| --- | --- | --- |
| 文字生图 | `ming-image-0.1-design` | `POST /v1/images/generations` |
| 图片拆层 | `ming-image-0.1-design-layer` | `POST /v1/images/edits` |

接口地址为 `https://maas-api.antdigital.com`。本地实现位于 `server.py`，Cloudflare 实现位于 `cloudflare/worker.mjs`。更换服务商需要同时适配请求和响应格式。

生成和重新拆层会调用 MaaS，费用与权限以服务商规则为准。载入内置示例、查看历史作品和本地图层编辑不调用模型。

## 项目结构

```text
cover-studio/
├── static/                 # 网页、样式、示例图片及风格数据
│   ├── index.html
│   ├── app.js              # 创作流程与图层编辑器
│   ├── cloud.js            # 云端请求、IndexedDB 素材库与 ZIP 打包
│   └── style.css
├── cloudflare/
│   └── worker.mjs          # Cloudflare API 转发
├── vendor/                 # 第三方 skill 规则、来源和已有许可文件
├── server.py               # Python 本地服务
├── wrangler.jsonc          # Workers 与静态资源配置
├── test_*.mjs / cjs / py    # 检查脚本
└── 启动.command             # macOS 本地启动入口
```

## 开发与检查

前端使用原生 HTML、CSS、JavaScript，无需构建。在项目根目录运行：

```bash
node --check static/app.js
node --check static/cloud.js
node --test test_cloud.mjs
node test_ponyo.cjs
python3 -m unittest test_server.py
```

这些检查不需要真实 API Key，也不会调用付费模型。部署后可先访问 `/api/health` 检查服务，再用自己的 Key 验证一次生成与拆层。

## 已知限制

- 拆出的文字是像素图片，不能直接作为文本修改；当前未提供单图层 AI 修改。
- 模型可能将多个元素合并到同一层，或在背景中保留主体残影。实际层数、顺序与透明边缘需要检查。
- 生图比例通过提示词表达，模型实际输出尺寸不保证与选择一致。放大导出尺寸不会增加原图细节。
- 当前生成接口不支持参考图输入；上传图片用于拆层。
- 模型处理期间请保持页面打开。网络中断或上游服务错误可能导致请求失败。

## 第三方来源

本项目将以下 skill 的设计规则适配为网页中的提示词编译器，不会运行完整 Agent Skill。

| 来源 | 集成内容 | 固定版本 |
| --- | --- | --- |
| [Punk-Skill](https://github.com/adrianpunk/Punk-Skill) | 31 种封面与海报风格规则 | `v1.0.0-mit`，提交 `0380629c81b4cc6870722cb99fb6fe0ee416b56f` |
| [PONYO Cover Anchor System](https://github.com/ponyodong2026/ponyo-cover-anchor-system) | 小红书封面模板与排版规则 | 提交 `f03b7bc8c751e8b5e2e9ead66fd9aa16def22b84` |

Punk 集成仅使用上述 MIT 历史版本，不包含 v2.0.0+ 内容。原始来源与已有授权文件保留在 `vendor/`，Punk 许可证另见 [static/punk-license.txt](static/punk-license.txt)。

## 贡献

欢迎提交问题与改进建议。报告问题时，请附上运行方式、浏览器、复现步骤和不含敏感信息的报错；不要提交 API Key、私人图片或完整请求凭据。

## 许可证

项目原创代码尚未指定开源许可证。第三方内容按其各自上游许可使用，不能将第三方许可自动视为整个项目的许可。
