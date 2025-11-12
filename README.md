# 导航网站项目 PRD

## 1. 项目愿景
- 为需要快速访问高频网站与工具的创作者、学生与职场人士，提供一个可定制、响应式、轻量的导航主页。
- 通过清晰的分类、智能推荐与键盘快捷操作，帮助用户在秒级完成信息检索，降低“找不到入口”的时间成本。

## 2. 用户画像 & 场景
| 角色 | 目标 | 核心痛点 | 使用场景 |
| --- | --- | --- | --- |
| 学习型用户 | 找到课程、题库、效率工具 | 书签凌乱、设备不同步 | 课前开启导航页面一键进入常用网站 |
| 内容创作者 | 快速切换写作/素材/发布平台 | 需要管理多平台链接 | 每天开机第一件事打开导航页 |
| 团队协作成员 | 访问内部系统、会议、文档 | 链接散落在 IM 或文档中 | 会议前打开导航页跳转所有内部资源 |

## 3. 需求概述
### 3.1 产品目标
1. **7 天内**交付 MVP，支持桌面 Web 访问。
2. 用户可在 **3 次点击内**找到任意预设站点。
3. 支持最少 3 个可编辑分类与 15+ 个站点条目。

### 3.2 用户故事
| 编号 | 用户故事 | 验收标准 |
| --- | --- | --- |
| US-01 | 作为学生，我想在首页看到学习类站点集合 | 默认展示“学习 / 效率 / 娱乐”三大分类，每类含至少 5 个链接 |
| US-02 | 作为创作者，我希望自定义站点并拖曳排序 | 支持站点新增、编辑、删除、拖拽排序并实时保存 |
| US-03 | 作为协作成员，我需要快速搜索站点 | 顶部支持模糊搜索并可键盘上下选择结果 |

## 4. 功能需求
### 4.1 MVP 功能列表
| 模块 | 功能 | 说明 | 优先级 |
| --- | --- | --- | --- |
| 主页布局 | 响应式网格 | 桌面 4 列、平板 3 列、手机 2 列 | P0 |
| 分类管理 | 预设 + 自定义分类 | 默认 3 类，可增删改名称 | P0 |
| 站点卡片 | 图标、名称、描述、快捷键 | 支持 favicon 抓取或自定义图标 | P0 |
| 搜索 | 顶部即时搜索 | 支持拼音、别名，键盘导航 | P0 |
| 主题切换 | 明/暗/跟随系统 | 记忆上次选择 | P1 |
| 数据持久化 | LocalStorage | 存储分类、站点与主题设置 | P0 |

### 4.2 迭代功能候选
- 登录同步（接第三方存储如 Supabase）。
- 推荐模块（基于标签或访问频次）。
- 小组件：每日灵感、番茄钟、待办。
- 导航分享：导出/导入设置。

## 5. 信息架构与页面结构
- **Header**：LOGO、搜索框、主题切换、设置入口。
- **Category Tabs**：横向 Tab 或侧栏展示分类，Tab 下方显示对应站点。
- **Site Grid**：卡片含图标、标题、副标题、收藏星标、快捷键提示。
- **Footer**：版权信息、反馈入口、社媒链接。

## 6. 交互流程
1. 打开站点 → 读取本地存储 → 渲染默认分类与站点。
2. 用户在搜索框输入关键词 → 实时过滤 → 键盘 Enter 打开链接（新标签）。
3. 点击“编辑模式” → 进入站点管理浮层 → 可增删改并拖拽排序 → 保存后刷新主视图。
4. 切换主题或分类 → 状态写入本地，刷新时保持。

## 7. 视觉与品牌基调
- **情绪**：明亮、轻盈、未来感，突出效率与陪伴感。
- **配色**：主色 #5C6AC4（克莱因蓝调），强调色 #FFB347，背景使用柔和渐变。
- **字体**：中文采用 `HarmonyOS Sans` / 英文 `Inter`，层次分明。
- **图标**：Flat + 微立体，保持统一圆角（8px）。

## 8. 技术方案
- **前端框架**：首选 React + Vite，若需更轻量可评估 SvelteKit。
- **状态管理**：轻量场景使用 Zustand 或内置 Context。
- **组件库**：Tailwind CSS + 自定义组件，减少 UI 搭建成本。
- **数据存储**：浏览器 LocalStorage（MVP），预留接口接入远端存储。
- **构建 & 部署**：Vite 打包，部署至 Vercel/静态空间；国内镜像或代理下载依赖。

## 9. 关键指标
- DAU ≥ 30（团队试用阶段）。
- 站点点击成功率 ≥ 95%。
- 搜索平均响应时间 ≤ 150ms。
- 自定义站点留存率 ≥ 80%。

## 10. 里程碑与任务进度
| 阶段 | 内容 | 负责人 | 目标日期 | 状态 |
| --- | --- | --- | --- | --- |
| PRD & 需求确认 | 输出 PRD、更新 README | 🤖 AI 助手 | 进行中 | ✅ 已完成 |
| 设计草图 | 线框稿、视觉规范 | 待定 | T+2 天 | ⏳ 待开始 |
| 前端框架搭建 | 初始化项目、主题切换、分类展示 | 🤖 AI 助手 | T+4 天 | ✅ 已完成 |
| 站点管理（LocalStorage） | 新增/编辑/删除/拖拽 | 🤖 AI 助手 | T+7 天 | ✅ 已完成 |
| 测试 & 发布 | 自测 + 部署 | 待定 | T+9 天 | ⏳ 待开始 |
| Supabase 云同步 | 远端存储、权限控制 | 🤖 AI 助手 | T+10 天 | 🛠️ 进行中 |

## 11. 风险与对策
- **范围蔓延**：严格按照 MVP 清单迭代，新增需求需在 README 记录并评审。
- **视觉资源不足**：优先使用开源图标库（Iconify、Lucide），必要时外包设计。
- **交互复杂度**：拖拽、搜索需选成熟库（如 `dnd-kit`），避免重复造轮子。
- **依赖下载受限**：全程配置国内镜像（如 `npm config set registry https://registry.npmmirror.com`）。

## 12. 当前迭代：Supabase 云同步
- **开发分支**：`feature/supabase-sync`
- **交付内容**：
  - 将分类与站点数据的读写切换到 Supabase Postgres，并在请求失败时自动降级至内置预设 + LocalStorage。
  - 站点新增 / 编辑 / 删除 / 拖拽排序全部直连 Supabase，成功后刷新缓存，保持多端一致。
  - 在界面内展示“同步中 / 已离线 / 重试”状态提示，避免误判。
  - 接入 Supabase Auth，管理员登录后才能访问站点管理工作台，前端会精准提示登录状态及权限。
  - 环境变量统一使用 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`（可选 `VITE_SUPABASE_REDIRECT_URL`），兼容 Cloudflare Pages 注入方式。
- **验证**：`npm run lint`、`npm run build` + Supabase 读写冒烟测试。
- **后续建议**：
  - 设计冲突处理策略（本地临时编辑 vs. 远端最新），为多人协作做准备。
  - 评估性能监控与失败告警方案，方便部署后排查。

### 12.1 需求变更快照
- 2025-11-11：根据用户反馈，移除 Header 右侧提示卡片，主题切换改为右上角纯图标按钮，维持页面轻量感。
- 2025-11-11：同日追加指示，彻底删除 Header 区域，仅保留独立搜索框与右上角主题按钮，页面结构更极简。
- 2025-11-11：优化搜索区为渐变描边+快捷筛选 Chips，突出核心操作入口并强化可用性。
- 2025-11-11：新增顶部双 icon（主题/月亮 + 放大镜），搜索改为点击放大镜后弹出的浮动面板，默认保持极简视觉。
- 2025-11-11：上线纯前端站点管理工作台（新增/编辑/拖拽/重置，全部存入 LocalStorage）。
- 2025-11-12：确认 MVP 接入 Supabase，要求通过环境变量传入 URL 与 Token，并确保 Cloudflare Pages 部署可直接配置。
- 2025-11-12：新增“管理员权限”需求，站点管理入口以及所有 CRUD 操作需由 Supabase Auth 鉴权后且用户角色为 `admin` 才能触发。
- 2025-11-12：放大镜按钮触发的搜索体验调整为全屏弹窗，维持页面极简状态，避免占用主内容空间。

## 13. 站点管理（LocalStorage）
- **状态**：`feature/frontend-scaffold` 分支已交付，等待视觉验收。
- **核心能力**：
  - 右上角新增“编辑” icon，打开侧滑管理面板，可查看 3 大分类与其站点列表。
  - 面板内支持站点新增、编辑、删除，表单字段包含分类、链接、简介、标签、快捷键、Emoji。
  - 基于 `@dnd-kit/*` 的拖拽排序，分类内顺序实时保存；站点卡片在编辑模式下提供“编辑/删除”快捷操作。
  - “恢复默认”按钮可一键清空本地数据并回到预设清单，所有状态持久化在 `localStorage` 的 `nav-home-data` 键中。
- **依赖**：`@dnd-kit/core`、`@dnd-kit/sortable`、`@dnd-kit/modifiers`、`@dnd-kit/utilities`。
- **验证**：`npm run build`、`npm run lint`。
- **后续展望**：
  - 补充批量导入/导出配置能力，方便分享导航模板。
- 设计跨设备同步方案（如后续接 Supabase/Firebase）。

## 14. Supabase 云同步（进行中）
- **目标**：将站点/分类数据迁移至 Supabase Postgres，实现多人共享、远端持久化与后续权限控制。
- **当前重点**：
  - 远端读取失败时的自动降级逻辑，以及缓存刷新策略。
  - 站点排序、CRUD 操作的事务化与失败回滚提示。
- **环境变量**：
  - 本地开发：在根目录创建 `.env.local` 并配置以下键（已提供 `.env.example`）：
    ```
    VITE_SUPABASE_URL=https://xomknvyqnrigbxcdbjtx.supabase.co
    VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvbWtudnlxbnJpZ2J4Y2RianR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NTMzMjUsImV4cCI6MjA3ODMyOTMyNX0.3L1QOc1o3fgZBMnJxlL286uFvMhdWiKJ0JFzbtD-iZs
    VITE_SUPABASE_REDIRECT_URL=http://localhost:5173
    ```
  - Cloudflare Pages：进入项目 `Settings > Environment variables`，添加同名变量即可在构建与运行时生效，避免将密钥写入仓库。
  > 若需更细权限，请在 Supabase 控制台生成新的 anon/service key，避免泄露数据库 root 密码。
- **表结构建议**：
  ```sql
  create table public.categories (
    id text primary key,
    label text not null,
    emoji text,
    description text,
    sort_order int default 0
  );

  create table public.sites (
    id text primary key,
    category_id text references public.categories(id) on delete cascade,
    name text not null,
    description text,
    url text not null,
    tags text[],
    shortcut text,
    emoji text,
    sort_order int default 0,
    created_at timestamp with time zone default timezone('utc'::text, now())
  );
  ```
- **数据流**：
  - App 启动 → 尝试拉取 Supabase 分类/站点 → 成功则渲染远端数据，并缓存到 LocalStorage 作为兜底。
  - 若网络或 env 缺失则进入“离线模式”，使用本地预设+LocalStorage，并提示需要配置 Supabase。
  - 登录流程：管理员在前端输入邮箱 → Supabase 发送一次性 Magic Link → 登录成功后根据 `app_metadata.role` 判断是否为 admin；仅 admin 可打开站点管理与触发 CRUD。
  - CRUD & 拖拽操作均调用 Supabase API，成功后刷新内存态；失败会提示并回滚。

### 14.1 管理员鉴权要求
- **角色标记**：在 Supabase Dashboard → Authentication → Users 中选中管理员账号，编辑 `App metadata`，设置 `{"role": "admin"}`（或在 `roles` 数组中包含 `admin`）。
- **Magic Link 配置**：启用 Email OTP/Magic Link 登录，并在项目设置中允许前端域名；`VITE_SUPABASE_REDIRECT_URL` 可指定 Cloudflare Pages 最终 URL，未设置则默认取当前站点。
- **RLS 建议**：可针对 `sites` / `categories` 表编写 Policy，限制写入操作 `auth.jwt() ->> 'role' = 'admin'`；当前前端已做显式拦截，服务端策略可进一步兜底。
- **登出与状态**：前端会在导航区展示“管理员 / 访客”状态，提供登录入口与安全退出按钮，未登录时 action button 会提醒无法编辑。
- **任务拆解**：
  1. 引入 `@supabase/supabase-js`，封装客户端与错误处理。
  2. 改造现有站点管理逻辑，使其优先使用 Supabase，LocalStorage 仅作缓存。
  3. 增加同步状态提示（加载中、离线、失败重试等）。
  4. 更新测试/部署文档，确保 env 管理规范。

---
如需新增需求、设计或开发任务，请先沟通确认，并在 README 的相关章节同步记录。
