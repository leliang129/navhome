import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "nav-home-data";
const STORAGE_VERSION_KEY = "nav-home-data-version";
const DATA_VERSION = "2025-11-devops-v1";

const presetCategories = [
  {
    id: "mirrors",
    label: "软件源",
    emoji: "🛰️",
    description: "高校镜像、包仓库与加速节点",
    accent: "from-brand/20 to-transparent",
    sites: [
      {
        id: "mirror-tuna",
        name: "清华源",
        description: "TUNA 协会维护的开源镜像站",
        tags: ["软件源", "清华大学", "镜像站"],
        shortcut: "Shift+1",
        url: "https://mirrors.tuna.tsinghua.edu.cn/",
        emoji: "🏫",
      },
      {
        id: "mirror-aliyun",
        name: "阿里源",
        description: "阿里云官方镜像服务",
        tags: ["软件源", "阿里巴巴", "镜像站"],
        shortcut: "Shift+2",
        url: "https://mirrors.aliyun.com/",
        emoji: "🛒",
      },
      {
        id: "mirror-huawei",
        name: "华为源",
        description: "华为云镜像中心",
        tags: ["软件源", "华为", "镜像站"],
        shortcut: "Shift+3",
        url: "https://mirrors.huaweicloud.com/",
        emoji: "🚀",
      },
      {
        id: "maven-central",
        name: "Maven 中央仓库",
        description: "官方依赖搜索与下载",
        tags: ["Maven", "Repository", "Central"],
        shortcut: "Shift+4",
        url: "https://mvnrepository.com/",
        emoji: "📦",
      },
      {
        id: "maven-aliyun",
        name: "Maven 阿里仓库",
        description: "阿里云提供的 Maven 镜像",
        tags: ["Maven", "Repository", "阿里云"],
        shortcut: "Shift+5",
        url: "https://maven.aliyun.com/mvn/guide",
        emoji: "🧭",
      },
      {
        id: "npm-taobao",
        name: "NPM 淘宝源",
        description: "npmmirror 官方站点",
        tags: ["Package Manager", "Node.js", "npm"],
        shortcut: "Shift+6",
        url: "https://npmmirror.com/",
        emoji: "📦",
      },
    ],
  },
  {
    id: "containers",
    label: "虚拟化",
    emoji: "🐳",
    description: "Docker / K8s 及边缘工具",
    accent: "from-accent/30 to-transparent",
    sites: [
      {
        id: "dockerfile-ref",
        name: "Dockerfile 参考文档",
        description: "Deepzz 维护的中文指南",
        tags: ["Docker", "Container", "镜像构建"],
        shortcut: "Ctrl+1",
        url: "https://deepzz.com/post/dockerfile-reference.html",
        emoji: "📘",
      },
      {
        id: "composerize",
        name: "DockerCompose 生成",
        description: "一键把 CLI 转成 Compose",
        tags: ["docker", "compose", "多容器应用"],
        shortcut: "Ctrl+2",
        url: "https://www.composerize.com/",
        emoji: "🧩",
      },
      {
        id: "k3s-docs",
        name: "K3s",
        description: "轻量级 K8s 中文文档",
        tags: ["k3s", "kubernetes", "轻量级"],
        shortcut: "Ctrl+3",
        url: "https://docs.k3s.io/zh/",
        emoji: "🌱",
      },
      {
        id: "kind",
        name: "Kind",
        description: "本地 Docker 上跑 K8s",
        tags: ["kubernetes", "docker", "本地开发"],
        shortcut: "Ctrl+4",
        url: "https://kind.sigs.k8s.io/",
        emoji: "🧪",
      },
      {
        id: "k8s-api",
        name: "K8s API 文档",
        description: "官方 API 参考",
        tags: ["kubernetes", "API", "文档"],
        shortcut: "Ctrl+5",
        url: "https://kubernetes.io/docs/reference/kubernetes-api/",
        emoji: "📚",
      },
      {
        id: "artifact-hub",
        name: "Helm 仓库",
        description: "Artifact Hub chart 搜索",
        tags: ["kubernetes", "helm", "charts"],
        shortcut: "Ctrl+6",
        url: "https://artifacthub.io/",
        emoji: "🎯",
      },
      {
        id: "helm-docs",
        name: "Helm 文档",
        description: "Helm 官方站",
        tags: ["kubernetes", "helm", "包管理"],
        shortcut: "Ctrl+7",
        url: "https://helm.sh/",
        emoji: "📖",
      },
      {
        id: "registry-explorer",
        name: "Registry Explorer",
        description: "可视化查看镜像层",
        tags: ["kubernetes", "docker", "镜像分析"],
        shortcut: "Ctrl+8",
        url: "https://explore.ggcr.dev/",
        emoji: "🔍",
      },
      {
        id: "dodo-sync",
        name: "渡渡鸟镜像同步",
        description: "国内 Docker 镜像加速",
        tags: ["docker", "镜像同步", "加速"],
        shortcut: "Ctrl+9",
        url: "https://docker.aityp.com/",
        emoji: "⚡",
      },
    ],
  },
  {
    id: "toolkit",
    label: "工具箱",
    emoji: "🧰",
    description: "常用可视化与效率小工具",
    accent: "from-emerald-400/20 to-transparent",
    sites: [
      {
        id: "ctool",
        name: "常用工具合集",
        description: "开发 & 生活小工具集合",
        tags: ["开发工具", "在线工具", "实用工具"],
        shortcut: "Alt+1",
        url: "https://ctool.dev/",
        emoji: "🧮",
      },
      {
        id: "crontab",
        name: "Crontab 可视化",
        description: "生成 Cron 表达式",
        tags: ["crontab", "定时任务", "可视化"],
        shortcut: "Alt+2",
        url: "https://crontab-generator.org/",
        emoji: "⏰",
      },
      {
        id: "reference",
        name: "快速参考备忘录",
        description: "常用命令速查",
        tags: ["备忘录", "参考手册", "开发文档"],
        shortcut: "Alt+3",
        url: "https://wangchujiang.com/reference/",
        emoji: "📒",
      },
      {
        id: "todo",
        name: "在线待办清单",
        description: "极简网页 ToDo",
        tags: ["待办清单", "任务管理", "生产力工具"],
        shortcut: "Alt+4",
        url: "https://www.ricocc.com/todo/",
        emoji: "✅",
      },
      {
        id: "ip-test",
        name: "IP 测试工具",
        description: "多节点 Ping / Trace",
        tags: ["网络测试", "IP诊断", "网络工具"],
        shortcut: "Alt+5",
        url: "https://ping.sx/ping",
        emoji: "🌐",
      },
      {
        id: "excalidraw",
        name: "Excalidraw",
        description: "多人实时白板",
        tags: ["白板", "绘图工具", "协作"],
        shortcut: "Alt+6",
        url: "https://excalidraw.com/",
        emoji: "🖊️",
      },
      {
        id: "openjdk",
        name: "OpenJDK 镜像",
        description: "Eclipse Adoptium 中文站",
        tags: ["Java", "OpenJDK", "Eclipse"],
        shortcut: "Alt+7",
        url: "https://adoptium.net/zh-CN/",
        emoji: "☕",
      },
      {
        id: "jdk-store",
        name: "JDK 下载站",
        description: "快速下载多版本 JDK",
        tags: ["Java", "JDK", "下载"],
        shortcut: "Alt+8",
        url: "https://www.injdk.cn/",
        emoji: "📥",
      },
      {
        id: "openjdk-tuna",
        name: "OpenJDK 镜像站",
        description: "Adoptium 清华镜像",
        tags: ["Java", "OpenJDK", "镜像站"],
        shortcut: "Alt+9",
        url: "https://mirrors.tuna.tsinghua.edu.cn/Adoptium/",
        emoji: "🏛️",
      },
      {
        id: "curl-converter",
        name: "Curl 转换工具",
        description: "curl 命令转多语言",
        tags: ["curl", "HTTP", "代码生成"],
        shortcut: "Alt+0",
        url: "https://curlconverter.com/",
        emoji: "🧠",
      },
      {
        id: "temp-mail",
        name: "临时邮箱",
        description: "TempMail Plus",
        tags: ["临时邮箱", "隐私保护", "测试工具"],
        shortcut: "Alt+Shift+6",
        url: "https://tempmail.plus/zh/#!",
        emoji: "📮",
      },
      {
        id: "email-once",
        name: "Email Once",
        description: "一次性邮箱",
        tags: ["临时邮箱", "一次性邮箱", "测试工具"],
        shortcut: "Alt+Shift+7",
        url: "https://email-once.com/",
        emoji: "✉️",
      },
    ],
  },
  {
    id: "ai-hub",
    label: "AI集",
    emoji: "🤖",
    description: "AI 设计、自动化与智能体平台",
    accent: "from-fuchsia-400/30 to-transparent",
    sites: [
      {
        id: "lovart",
        name: "LOVART 设计",
        description: "AI 设计与素材合集",
        tags: ["AI", "工具", "合集"],
        shortcut: "Alt+Shift+1",
        url: "https://www.lovart.ai/",
        emoji: "🎨",
      },
      {
        id: "fastgpt",
        name: "FastGPT",
        description: "企业级问答与知识库",
        tags: ["AI", "工具", "知识库"],
        shortcut: "Alt+Shift+2",
        url: "https://fastgpt.io/zh",
        emoji: "⚙️",
      },
      {
        id: "n8n",
        name: "n8n",
        description: "开源自动化工作流",
        tags: ["AI", "工具", "自动化"],
        shortcut: "Alt+Shift+3",
        url: "https://github.com/n8n-io/n8n",
        emoji: "🔗",
      },
      {
        id: "dify",
        name: "Dify",
        description: "多模态智能体平台",
        tags: ["AI", "工具", "智能体"],
        shortcut: "Alt+Shift+4",
        url: "https://docs.dify.ai/zh-hans/introduction",
        emoji: "🪄",
      },
      {
        id: "chatgpt-aihub",
        name: "ChatGPT",
        description: "OpenAI 官方入口",
        tags: ["AI", "对话", "OpenAI"],
        shortcut: "Alt+Shift+5",
        url: "https://chatgpt.com/",
        emoji: "💬",
      },
      {
        id: "gemini",
        name: "Google Gemini",
        description: "Google 最新生成式模型",
        tags: ["AI", "Google", "多模态"],
        shortcut: "Alt+Shift+6",
        url: "https://gemini.google.com/",
        emoji: "🌌",
      },
    ],
  },
];

const quickSuggestions = [
  { id: "mirrors", label: "软件源", keyword: "软件源" },
  { id: "containers", label: "容器工具", keyword: "容器" },
  { id: "toolkit", label: "效率工具", keyword: "工具" },
  { id: "ai-hub", label: "AI 工具", keyword: "AI" },
];

const cloneCategories = (list) =>
  (list ?? []).map((category) => ({
    ...category,
    sites: (category.sites ?? []).map((site) => ({ ...site })),
  }));

const persistLocalCategories = (data) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.localStorage.setItem(STORAGE_VERSION_KEY, DATA_VERSION);
  } catch (error) {
    console.warn("Failed to persist categories", error);
  }
};

const seedPresetCategories = () => {
  const data = cloneCategories(presetCategories);
  persistLocalCategories(data);
  return data;
};

const loadInitialCategories = () => {
  if (typeof window === "undefined") return cloneCategories(presetCategories);
  const cachedVersion = window.localStorage.getItem(STORAGE_VERSION_KEY);
  const cached = window.localStorage.getItem(STORAGE_KEY);
  if (!cached || cachedVersion !== DATA_VERSION) {
    return seedPresetCategories();
  }
  try {
    const parsed = JSON.parse(cached);
    if (!Array.isArray(parsed)) return seedPresetCategories();
    const merged = cloneCategories(parsed);
    persistLocalCategories(merged);
    return merged;
  } catch (error) {
    console.warn("Failed to parse cached categories", error);
    return seedPresetCategories();
  }
};

const MoonIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M21 14.5A8.5 8.5 0 1 1 9.5 3c.3 0 .6.02.89.05A7 7 0 0 0 20 12.61c0 .63-.08 1.25-.23 1.83.42.03.84.06 1.23.06Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="18.5" cy="5.5" r="1" fill="currentColor" />
    <circle cx="20.5" cy="7" r="0.6" fill="currentColor" />
  </svg>
);

const SearchIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" />
    <path d="m15.5 15.5 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem("nav-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [categories] = useState(loadInitialCategories);
  const [activeCategory, setActiveCategory] = useState(presetCategories[0].id);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("nav-theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const allSites = useMemo(
    () =>
      categories.flatMap((category) =>
        category.sites.map((site) => ({
          ...site,
          categoryId: category.id,
          categoryLabel: category.label,
          categoryEmoji: category.emoji,
        }))
      ),
    [categories]
  );

  const displayedSites = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return categories.find((item) => item.id === activeCategory)?.sites ?? [];
    }
    return allSites.filter((site) => {
      const haystack = `${site.name} ${site.description}`.toLowerCase();
      const tagMatch = site.tags?.some((tag) => tag.toLowerCase().includes(term));
      return haystack.includes(term) || tagMatch;
    });
  }, [searchTerm, activeCategory, categories, allSites]);

  const activeCategoryMeta = categories.find((category) => category.id === activeCategory);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const actionButtons = [
    {
      id: "theme",
      label: "切换主题",
      icon: <MoonIcon className="h-5 w-5" />,
      onClick: toggleTheme,
    },
    {
      id: "search",
      label: isSearchOpen ? "收起搜索" : "打开搜索",
      icon: <SearchIcon className="h-5 w-5" />,
      onClick: () => setIsSearchOpen(true),
      isActive: isSearchOpen,
    },
  ];

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 md:px-6 lg:px-8 lg:py-14">
        <div className="flex justify-end gap-3">
          {actionButtons.map((button) => (
            <button
              key={button.id}
              type="button"
              onClick={button.onClick}
              className={`flex h-12 w-12 items-center justify-center rounded-full border border-transparent bg-white/80 text-slate-600 shadow-md ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:text-brand dark:bg-slate-900/80 dark:text-slate-200 dark:ring-white/10 dark:hover:text-accent ${
                button.isActive ? "scale-105 text-brand dark:text-accent" : ""
              }`}
              aria-label={button.label}
            >
              {button.icon}
            </button>
          ))}
        </div>

        <section aria-labelledby="category-tabs" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="category-tabs" className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              分类快跳
            </h2>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              {categories.length} 个分类 · {allSites.length}+ 站点
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-xs text-brand underline-offset-4 hover:underline dark:text-accent"
              >
                清空搜索
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const isActive = category.id === activeCategory && !searchTerm;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category.id);
                    setSearchTerm("");
                  }}
                  className={`flex w-full max-w-xs flex-1 items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm transition hover:-translate-y-0.5 ${
                    isActive
                      ? "border-transparent bg-slate-900 text-white shadow-glow dark:bg-white dark:text-slate-900"
                      : "border-slate-200/70 bg-white/60 text-slate-600 hover:border-brand/30 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200"
                  }`}
                >
                  <span className="text-lg" aria-hidden="true">
                    {category.emoji}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-semibold">{category.label}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{category.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-4" aria-live="polite">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">
                {searchTerm ? "搜索结果" : "精选推荐"}
              </p>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                {searchTerm ? `匹配到 ${displayedSites.length} 个站点` : `${activeCategoryMeta?.emoji ?? ""} ${activeCategoryMeta?.label}`}
              </h3>
            </div>
            {!searchTerm && (
              <p className="text-xs text-slate-400 dark:text-slate-500">点击任意卡片将在新标签打开站点</p>
            )}
          </div>

          {displayedSites.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center text-slate-400 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-500">
              没找到相关站点，换个关键词或者切换分类吧～
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {displayedSites.map((site) => (
                <a
                  key={site.id}
                  href={site.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl" aria-hidden="true">
                        {site.emoji ?? "🔗"}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{site.name}</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500">{site.description}</p>
                      </div>
                    </div>
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-300">
                      {site.shortcut}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {site.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 transition group-hover:bg-brand/10 group-hover:text-brand dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-accent/20 dark:group-hover:text-accent"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  {searchTerm && (
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {site.categoryEmoji} 属于 {site.categoryLabel}
                    </p>
                  )}
                </a>
              ))}
            </div>
          )}
        </section>

        <footer className="flex flex-col justify-between gap-3 rounded-3xl border border-white/40 bg-white/70 px-6 py-5 text-sm text-slate-400 shadow-inner backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/70 dark:text-slate-500 md:flex-row md:items-center">
          <span>Nav Home · 让常用站点触手可及 ✨</span>
          <span>最后更新：{new Date().toLocaleDateString("zh-CN")}</span>
        </footer>
      </div>

      {isSearchOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 px-4 py-10 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="全局搜索面板"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsSearchOpen(false);
            }
          }}
        >
          <div className="w-full max-w-4xl rounded-[34px] bg-gradient-to-r from-brand/40 via-white to-accent/40 p-[1px] shadow-2xl dark:from-brand/60 dark:via-slate-900 dark:to-accent/50">
            <div className="rounded-[32px] bg-white/95 dark:bg-slate-900/95">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">Search</p>
                  <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">全局搜索</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">实时过滤 30+ 站点，回车可立即打开</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:text-slate-300"
                >
                  关闭
                </button>
              </div>
              <div className="flex flex-col gap-4 px-6 py-5">
                <div className="flex items-center gap-3 rounded-3xl border border-slate-100 bg-white/80 px-4 py-3 shadow-inner dark:border-slate-800 dark:bg-slate-900/70">
                  <span className="text-xl text-slate-400 dark:text-slate-500" aria-hidden="true">
                    🔍
                  </span>
                  <label className="sr-only" htmlFor="modal-nav-search">
                    搜索站点
                  </label>
                  <input
                    id="modal-nav-search"
                    ref={searchInputRef}
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="搜索镜像站、K8s、AI 工具..."
                    className="flex-1 border-none bg-transparent text-lg text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100"
                  />
                  <span className="hidden select-none items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 md:inline-flex">
                    ⌘K / Ctrl+K
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                  <span className="font-semibold uppercase tracking-widest">快捷筛选</span>
                  {quickSuggestions.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setSearchTerm(item.keyword)}
                      className="rounded-full bg-slate-100/90 px-3 py-1 text-slate-500 transition hover:bg-brand/10 hover:text-brand dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-accent/20 dark:hover:text-accent"
                    >
                      #{item.label}
                    </button>
                  ))}
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
                  {searchTerm ? `匹配到 ${displayedSites.length} 个站点` : "输入关键词或选择上方标签开始搜索"}
                </div>
                <div className="max-h-[360px] overflow-y-auto rounded-2xl border border-slate-100 bg-white/90 shadow-inner dark:border-slate-800 dark:bg-slate-900/80">
                  {displayedSites.length === 0 ? (
                    <p className="px-4 py-12 text-center text-sm text-slate-400 dark:text-slate-500">暂未匹配到站点，换个关键词试试吧～</p>
                  ) : (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                      {displayedSites.map((site) => (
                        <li key={site.id}>
                          <a
                            href={site.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-brand/5 dark:hover:bg-accent/10"
                            onClick={() => setIsSearchOpen(false)}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl" aria-hidden="true">{site.emoji ?? "🔗"}</span>
                              <div>
                                <p className="text-base font-semibold text-slate-900 dark:text-white">{site.name}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">{site.description}</p>
                              </div>
                            </div>
                            <div className="text-right text-xs text-slate-400 dark:text-slate-500">
                              <p>
                                {site.categoryEmoji} {site.categoryLabel}
                              </p>
                              <p>{site.shortcut}</p>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
