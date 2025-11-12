import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import supabaseClient, { getSupabaseInfo, hasSupabaseConfig } from "./lib/supabaseClient";

const STORAGE_KEY = "nav-home-data";

const presetCategories = [
  {
    id: "learn",
    label: "学习进阶",
    emoji: "📚",
    description: "课程、题库与效率工具",
    accent: "from-brand/20 to-transparent",
    sites: [
      {
        id: "imooc",
        name: "慕课网",
        description: "实战课程与职业成长路径",
        tags: ["课程", "实战"],
        shortcut: "Shift+1",
        url: "https://www.imooc.com",
        emoji: "🎯",
      },
      {
        id: "leetcode",
        name: "LeetCode CN",
        description: "算法题库与竞赛",
        tags: ["算法", "竞赛"],
        shortcut: "Shift+2",
        url: "https://leetcode.cn",
        emoji: "🧠",
      },
      {
        id: "rsch",
        name: "ResearchRabbit",
        description: "文献可视化工具",
        tags: ["论文", "检索"],
        shortcut: "Shift+3",
        url: "https://www.researchrabbit.ai",
        emoji: "🔬",
      },
      {
        id: "notion-academy",
        name: "Notion Academy",
        description: "结构化学习模板库",
        tags: ["模板", "效率"],
        shortcut: "Shift+4",
        url: "https://www.notion.so",
        emoji: "🧩",
      },
      {
        id: "yuque",
        name: "语雀",
        description: "多端文档写作与协作",
        tags: ["文档", "云端"],
        shortcut: "Shift+5",
        url: "https://www.yuque.com",
        emoji: "📝",
      },
    ],
  },
  {
    id: "create",
    label: "创作灵感",
    emoji: "🎨",
    description: "写作、素材与分发平台",
    accent: "from-accent/30 to-transparent",
    sites: [
      {
        id: "figma",
        name: "Figma",
        description: "云端设计协作",
        tags: ["设计", "协作"],
        shortcut: "Ctrl+1",
        url: "https://www.figma.com",
        emoji: "✨",
      },
      {
        id: "pixabay",
        name: "Pixabay",
        description: "高清无版权素材库",
        tags: ["素材", "图库"],
        shortcut: "Ctrl+2",
        url: "https://pixabay.com",
        emoji: "🌈",
      },
      {
        id: "ark",
        name: "字节火山写作",
        description: "灵感卡片与排版",
        tags: ["写作", "AI"],
        shortcut: "Ctrl+3",
        url: "https://ark.bytedance.com",
        emoji: "🪄",
      },
      {
        id: "canva",
        name: "Canva",
        description: "快速视觉模板",
        tags: ["模板", "视觉"],
        shortcut: "Ctrl+4",
        url: "https://www.canva.cn",
        emoji: "🎞️",
      },
      {
        id: "xlog",
        name: "xLog",
        description: "Web3 博客与多平台分发",
        tags: ["发布", "博客"],
        shortcut: "Ctrl+5",
        url: "https://xlog.app",
        emoji: "🛰️",
      },
    ],
  },
  {
    id: "team",
    label: "团队协作",
    emoji: "🤝",
    description: "内部系统、会议与文档",
    accent: "from-emerald-400/20 to-transparent",
    sites: [
      {
        id: "feishu",
        name: "飞书",
        description: "即时沟通与视频会议",
        tags: ["会议", "IM"],
        shortcut: "Alt+1",
        url: "https://www.feishu.cn",
        emoji: "💬",
      },
      {
        id: "jira",
        name: "Jira",
        description: "需求与看板管理",
        tags: ["研发", "管理"],
        shortcut: "Alt+2",
        url: "https://www.atlassian.com/software/jira",
        emoji: "📋",
      },
      {
        id: "notion",
        name: "Notion Workspace",
        description: "团队知识库",
        tags: ["知识库", "协作"],
        shortcut: "Alt+3",
        url: "https://www.notion.so",
        emoji: "📚",
      },
      {
        id: "airtable",
        name: "Airtable",
        description: "数据驱动工作流",
        tags: ["数据表", "自动化"],
        shortcut: "Alt+4",
        url: "https://www.airtable.com",
        emoji: "🧾",
      },
      {
        id: "miro",
        name: "Miro",
        description: "在线白板与共创",
        tags: ["白板", "头脑风暴"],
        shortcut: "Alt+5",
        url: "https://miro.com",
        emoji: "🧠",
      },
    ],
  },
];

const quickSuggestions = [
  { id: "learn", label: "学习资源", keyword: "学习" },
  { id: "create", label: "创作灵感", keyword: "创作" },
  { id: "team", label: "团队协作", keyword: "团队" },
  { id: "fav", label: "收藏夹", keyword: "收藏" },
];

const accentFallbacks = [
  "from-brand/20 to-transparent",
  "from-accent/30 to-transparent",
  "from-emerald-400/20 to-transparent",
  "from-slate-400/20 to-transparent",
];

const accentLookup = presetCategories.reduce((map, category, index) => {
  map.set(category.id, category.accent ?? accentFallbacks[index % accentFallbacks.length]);
  return map;
}, new Map());

const pickAccentClass = (categoryId, index) => accentLookup.get(categoryId) ?? accentFallbacks[index % accentFallbacks.length];

const createSupabaseSeed = () => {
  const categoryPayload = presetCategories.map((category, index) => ({
    id: category.id,
    label: category.label,
    description: category.description,
    emoji: category.emoji,
    sort_order: index,
  }));

  const sitePayload = presetCategories.flatMap((category) =>
    category.sites.map((site, index) => ({
      id: site.id,
      category_id: category.id,
      name: site.name,
      description: site.description,
      url: site.url,
      tags: site.tags ?? [],
      shortcut: site.shortcut ?? "-",
      emoji: site.emoji ?? "🔗",
      sort_order: index,
    }))
  );

  return { categoryPayload, sitePayload };
};

const seedSupabaseWithDefaults = async (client) => {
  if (!client) return new Error("Supabase client is not available");
  const { categoryPayload, sitePayload } = createSupabaseSeed();
  const { error: categoryError } = await client.from("categories").upsert(categoryPayload, { onConflict: "id" });
  if (categoryError) return categoryError;
  if (sitePayload.length === 0) return null;
  const { error: siteError } = await client.from("sites").insert(sitePayload);
  return siteError ?? null;
};

const fetchSupabaseSnapshot = async (client) => {
  if (!client) return { data: null, error: new Error("Supabase client missing") };
  const { data: categoryRows, error: categoryError } = await client
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });
  if (categoryError) {
    return { data: null, error: categoryError };
  }

  const { data: siteRows, error: siteError } = await client
    .from("sites")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (siteError) {
    return { data: null, error: siteError };
  }

  const categories = (categoryRows ?? []).map((row, index) => ({
    id: row.id,
    label: row.label,
    emoji: row.emoji ?? "📁",
    description: row.description ?? "",
    accent: pickAccentClass(row.id, index),
    sortOrder: row.sort_order ?? index,
    sites: [],
  }));

  const categoriesMap = new Map(categories.map((category) => [category.id, category]));

  (siteRows ?? []).forEach((site, index) => {
    const bucket = categoriesMap.get(site.category_id);
    if (!bucket) return;
    bucket.sites.push({
      id: site.id,
      name: site.name,
      description: site.description ?? "",
      url: site.url,
      tags: Array.isArray(site.tags) ? site.tags : [],
      shortcut: site.shortcut ?? "-",
      emoji: site.emoji ?? "🔗",
      sortOrder: site.sort_order ?? index,
    });
  });

  categories.forEach((category) => {
    category.sites.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  });

  return { data: categories, error: null };
};

const ADMIN_ROLE_FLAG = "admin";

const collectRoles = (meta = {}) => {
  const roles = new Set();
  const addRole = (value) => {
    if (typeof value === "string" && value.trim()) {
      roles.add(value.trim());
    }
  };
  addRole(meta.role);
  if (Array.isArray(meta.roles)) {
    meta.roles.forEach(addRole);
  }
  return Array.from(roles);
};

const isAdminUser = (user) => {
  if (!user) return false;
  const appRoles = collectRoles(user.app_metadata);
  const userRoles = collectRoles(user.user_metadata);
  return [...appRoles, ...userRoles].some((role) => role === ADMIN_ROLE_FLAG);
};

const toneClassMap = {
  success: "text-emerald-500 dark:text-emerald-300",
  error: "text-rose-500 dark:text-rose-300",
  info: "text-slate-500 dark:text-slate-300",
};

const getToneClass = (tone = "success") => toneClassMap[tone] ?? toneClassMap.success;

const cloneCategories = (list) =>
  list.map((category) => ({
    ...category,
    sites: category.sites.map((site) => ({ ...site })),
  }));

const loadInitialCategories = () => {
  if (typeof window === "undefined") return cloneCategories(presetCategories);
  const cached = window.localStorage.getItem(STORAGE_KEY);
  if (!cached) return cloneCategories(presetCategories);
  try {
    const parsed = JSON.parse(cached);
    if (!Array.isArray(parsed)) return cloneCategories(presetCategories);
    return cloneCategories(parsed);
  } catch (error) {
    console.warn("Failed to parse stored data", error);
    return cloneCategories(presetCategories);
  }
};

const createEmptyForm = (categoryId = presetCategories[0]?.id ?? "learn") => ({
  id: null,
  categoryId,
  name: "",
  description: "",
  url: "",
  tagsText: "",
  shortcut: "",
  emoji: "🔗",
});

const parseTags = (text) =>
  text
    .split(/[\s,，、]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);

const generateSiteId = () => `site_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

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

const EditIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m4 20 1.17-4.68a2 2 0 0 1 .52-0.93L15.5 4.58a2 2 0 0 1 2.83 0l1.09 1.09a2 2 0 0 1 0 2.83L9.61 19.34a2 2 0 0 1-.93.52L4 20Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M13 6.5 17.5 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

function App() {
  const supabaseAvailable = hasSupabaseConfig && Boolean(supabaseClient);

  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem("nav-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [categories, setCategories] = useState(loadInitialCategories);
  const [activeCategory, setActiveCategory] = useState(presetCategories[0].id);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [siteForm, setSiteForm] = useState(() => createEmptyForm());
  const [editingSiteId, setEditingSiteId] = useState(null);
  const [editingSourceCategoryId, setEditingSourceCategoryId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState("success");
  const [syncState, setSyncState] = useState(() =>
    supabaseAvailable
      ? { status: "loading", message: "正在连接 Supabase..." }
      : { status: "local", message: "" }
  );
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);
  const [isActionSyncing, setIsActionSyncing] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authTone, setAuthTone] = useState("info");
  const [authMessage, setAuthMessage] = useState("");
  const [isSendingLink, setIsSendingLink] = useState(false);
  const isSupabaseMode = supabaseAvailable && isSupabaseReady;
  const canManageSites = !supabaseAvailable || isAdmin;
  const searchInputRef = useRef(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const syncSupabaseUser = useCallback((user) => {
    setSupabaseUser(user);
    setIsAdmin(isAdminUser(user));
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const info = getSupabaseInfo();
    console.info("[nav-home] Supabase 配置检测", {
      url: info.url,
      hasConfig: info.hasConfig,
    });
  }, []);

  const refreshFromSupabase = useCallback(
    async (loadingMessage = "正在刷新云端数据...", successMessage = "云端数据已就绪 ✅") => {
      if (!supabaseAvailable) return false;
      setSyncState({ status: "loading", message: loadingMessage });
      const snapshot = await fetchSupabaseSnapshot(supabaseClient);
      if (snapshot.error) {
        console.error("Failed to fetch Supabase data", snapshot.error);
        setSyncState({
          status: "error",
          message: "云端暂不可用，已回退至本地缓存，可稍后点击重试。",
        });
        setIsSupabaseReady(false);
        return false;
      }

      let records = snapshot.data ?? [];
      if (records.length === 0) {
        const seedError = await seedSupabaseWithDefaults(supabaseClient);
        if (seedError) {
          console.error("Failed to seed Supabase", seedError);
          setSyncState({
            status: "error",
            message: "云端暂无数据且初始化失败，请稍后重试或检查配置。",
          });
          setIsSupabaseReady(false);
          return false;
        }
        const retrySnapshot = await fetchSupabaseSnapshot(supabaseClient);
        if (retrySnapshot.error) {
          console.error("Failed to refetch Supabase after seeding", retrySnapshot.error);
          setSyncState({
            status: "error",
            message: "云端初始化后拉取失败，可稍后重试。",
          });
          setIsSupabaseReady(false);
          return false;
        }
        records = retrySnapshot.data ?? [];
      }

      setCategories(cloneCategories(records));
      setSyncState({ status: "ready", message: successMessage });
      setIsSupabaseReady(true);
      return true;
    },
    [supabaseAvailable]
  );

  const persistSupabaseSortOrder = useCallback(
    async (categoryId, orderedSites) => {
      if (!isSupabaseMode) return;
       if (!canManageSites) {
        setStatusTone("error");
        setStatusMessage("暂无权限同步排序");
        return;
      }
      setSyncState({ status: "loading", message: "正在同步排序..." });
      const payload = orderedSites.map((site, index) => ({ id: site.id, sort_order: index }));
      const { error } = await supabaseClient.from("sites").upsert(payload, { onConflict: "id" });
      if (error) {
        console.error("Failed to sync sort order", error);
        setSyncState({
          status: "error",
          message: "排序同步失败，已保留本地顺序，可稍后重试。",
        });
        return;
      }
      setSyncState({ status: "ready", message: "排序已同步至云端" });
    },
    [canManageSites, isSupabaseMode]
  );

  const handleSupabaseRetry = useCallback(() => {
    if (!supabaseAvailable) return;
    refreshFromSupabase("重新连接 Supabase...", "云端已恢复 ✅");
  }, [refreshFromSupabase, supabaseAvailable]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("nav-theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    if (!supabaseAvailable || !supabaseClient) return;
    let cancelled = false;
    const hydrateSession = async () => {
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) {
        console.error("无法获取 Supabase 会话", error);
        return;
      }
      if (!cancelled) {
        syncSupabaseUser(data.session?.user ?? null);
      }
    };
    hydrateSession();
    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        syncSupabaseUser(session?.user ?? null);
      }
    });
    return () => {
      cancelled = true;
      listener?.subscription?.unsubscribe();
    };
  }, [supabaseAvailable, syncSupabaseUser]);

  useEffect(() => {
    if (!supabaseAvailable) return;
    refreshFromSupabase("正在连接 Supabase...", "已从云端加载最新内容 ✅");
  }, [refreshFromSupabase, supabaseAvailable]);

  useEffect(() => {
    if (isAuthModalOpen && canManageSites) {
      setIsAuthModalOpen(false);
      setAuthEmail("");
      setAuthMessage("");
      setAuthTone("success");
      setStatusTone("success");
      setStatusMessage("管理员验证成功，已解锁站点管理 ✨");
    }
  }, [canManageSites, isAuthModalOpen]);

  useEffect(() => {
    if (!canManageSites && isEditorOpen) {
      setIsEditorOpen(false);
    }
  }, [canManageSites, isEditorOpen]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    }
  }, [categories]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
        setIsEditorOpen(false);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!categories.some((category) => category.id === activeCategory) && categories[0]) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    if (!categories.some((category) => category.id === siteForm.categoryId) && categories[0]) {
      setSiteForm((prev) => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories, siteForm.categoryId]);

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
    return allSites
      .filter(
        (site) =>
          site.name.toLowerCase().includes(term) ||
          site.description.toLowerCase().includes(term) ||
          site.tags?.some((tag) => tag.toLowerCase().includes(term))
      )
      .slice(0, 18);
  }, [searchTerm, activeCategory, categories, allSites]);

  const activeCategoryMeta = categories.find((category) => category.id === activeCategory);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const openEditor = () => {
    if (!canManageSites) {
      requestAdminAccess("登录管理员账号即可解锁站点管理 ✨");
      return;
    }
    setIsEditorOpen(true);
  };

  const handleDragEnd = (categoryId, event) => {
    const { active, over } = event;
    if (!canManageSites) {
      setStatusTone("error");
      setStatusMessage("暂无权限调整排序，请先登录管理员账号");
      return;
    }
    if (!over || active.id === over.id) return;
    let orderedSites = null;
    setCategories((prev) =>
      prev.map((category) => {
        if (category.id !== categoryId) return category;
        const oldIndex = category.sites.findIndex((site) => site.id === active.id);
        const newIndex = category.sites.findIndex((site) => site.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return category;
        const nextSites = arrayMove(category.sites, oldIndex, newIndex).map((site, index) => ({
          ...site,
          sortOrder: index,
        }));
        orderedSites = nextSites;
        return {
          ...category,
          sites: nextSites,
        };
      })
    );

    if (isSupabaseMode && orderedSites) {
      persistSupabaseSortOrder(categoryId, orderedSites);
    }
  };

  const handleEditSite = (site, categoryId) => {
    setIsEditorOpen(true);
    setEditingSiteId(site.id);
    setEditingSourceCategoryId(categoryId);
    setSiteForm({
      id: site.id,
      categoryId,
      name: site.name,
      description: site.description,
      url: site.url,
      tagsText: site.tags?.join(" ") ?? "",
      shortcut: site.shortcut ?? "",
      emoji: site.emoji ?? "🔗",
    });
  };

  const handleAddSiteShortcut = (categoryId) => {
    if (!canManageSites) {
      requestAdminAccess("需要管理员身份才能新增站点～");
      return;
    }
    setIsEditorOpen(true);
    setEditingSiteId(null);
    setEditingSourceCategoryId(categoryId);
    setSiteForm(createEmptyForm(categoryId));
  };

  const handleDeleteSite = async (categoryId, siteId) => {
    if (!canManageSites) {
      setStatusTone("error");
      setStatusMessage("暂无权限删除站点");
      return;
    }
    if (isSupabaseMode) {
      setStatusTone("info");
      setStatusMessage("正在删除云端站点...");
      const { error } = await supabaseClient.from("sites").delete().eq("id", siteId);
      if (error) {
        console.error("Failed to delete Supabase site", error);
        setStatusTone("error");
        setStatusMessage(`删除失败：${error.message}`);
        return;
      }
      await refreshFromSupabase("正在刷新云端数据...", "云端已删除站点 ✂️");
      setStatusTone("success");
      setStatusMessage("已删除站点 ✂️");
    } else {
      setCategories((prev) =>
        prev.map((category) =>
          category.id === categoryId
            ? { ...category, sites: category.sites.filter((site) => site.id !== siteId) }
            : category
        )
      );
      setStatusTone("success");
      setStatusMessage("已删除站点 ✂️");
    }

    if (editingSiteId === siteId) {
      setEditingSiteId(null);
      setSiteForm(createEmptyForm(categoryId));
    }
  };

  const handleResetDefaults = async () => {
    if (!canManageSites) {
      setStatusTone("error");
      setStatusMessage("暂无权限执行此操作");
      return;
    }
    if (isSupabaseMode) {
      setStatusTone("info");
      setStatusMessage("正在恢复默认数据...");
      const seedError = await seedSupabaseWithDefaults(supabaseClient);
      if (seedError) {
        console.error("Failed to restore defaults on Supabase", seedError);
        setStatusTone("error");
        setStatusMessage(`恢复失败：${seedError.message ?? seedError}`);
        return;
      }
      await refreshFromSupabase("正在加载默认数据...", "云端已恢复默认 ✨");
      const defaults = cloneCategories(presetCategories);
      setSiteForm(createEmptyForm(defaults[0]?.id));
      setEditingSiteId(null);
      setEditingSourceCategoryId(null);
      setStatusTone("success");
      setStatusMessage("已恢复默认数据 ✨");
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      return;
    }

    const defaults = cloneCategories(presetCategories);
    setCategories(defaults);
    setSiteForm(createEmptyForm(defaults[0]?.id));
    setEditingSiteId(null);
    setEditingSourceCategoryId(null);
    setStatusTone("success");
    setStatusMessage("已恢复默认数据 ✨");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const name = siteForm.name.trim();
    const url = siteForm.url.trim();
    if (!name || !url) {
      setStatusTone("error");
      setStatusMessage("名称和链接是必填项哦～");
      return;
    }
    const targetCategoryId = siteForm.categoryId || categories[0]?.id;
    if (!targetCategoryId) return;
    const tags = parseTags(siteForm.tagsText);
    const shortcut = siteForm.shortcut.trim();
    const emoji = siteForm.emoji?.trim() || "🔗";

    if (!canManageSites) {
      setStatusTone("error");
      setStatusMessage("暂无权限编辑站点，请先登录管理员账号");
      return;
    }

    if (isSupabaseMode) {
      setStatusTone("info");
      setStatusMessage(editingSiteId ? "正在更新云端站点..." : "正在新增云端站点...");
      setIsActionSyncing(true);
      try {
        const siteId = editingSiteId ?? generateSiteId();
        const payload = {
          name,
          description: siteForm.description.trim(),
          url,
          tags,
          shortcut: shortcut || "-",
          emoji,
          category_id: targetCategoryId,
        };

        let supabaseError = null;
        if (editingSiteId) {
          const { error } = await supabaseClient.from("sites").update(payload).eq("id", siteId);
          supabaseError = error;
        } else {
          const targetCategory = categories.find((category) => category.id === targetCategoryId);
          const { error } = await supabaseClient
            .from("sites")
            .insert({ ...payload, id: siteId, sort_order: targetCategory ? targetCategory.sites.length : 0 });
          supabaseError = error;
        }

        if (supabaseError) {
          throw supabaseError;
        }

        await refreshFromSupabase("正在刷新云端数据...", "云端已保存 ✅");
        setStatusTone("success");
        setStatusMessage(editingSiteId ? "已更新站点 ✅" : "已新增站点 💡");
        setEditingSiteId(null);
        setEditingSourceCategoryId(targetCategoryId);
        setSiteForm(createEmptyForm(targetCategoryId));
      } catch (error) {
        console.error("Failed to persist site to Supabase", error);
        setStatusTone("error");
        setStatusMessage(`云端操作失败：${error.message ?? error}`);
      } finally {
        setIsActionSyncing(false);
      }
      return;
    }

    setCategories((prev) => {
      const next = prev.map((category) => ({
        ...category,
        sites: [...category.sites],
      }));

      let previousIndex = null;
      if (editingSiteId && editingSourceCategoryId) {
        const sourceCategory = next.find((category) => category.id === editingSourceCategoryId);
        if (sourceCategory) {
          previousIndex = sourceCategory.sites.findIndex((site) => site.id === editingSiteId);
          sourceCategory.sites = sourceCategory.sites.filter((site) => site.id !== editingSiteId);
        }
      }

      const targetCategory = next.find((category) => category.id === targetCategoryId);
      if (!targetCategory) return next;
      const newSite = {
        id: editingSiteId ?? generateSiteId(),
        name,
        description: siteForm.description.trim(),
        url,
        tags,
        shortcut: shortcut || "-",
        emoji,
      };

      const insertIndex =
        editingSiteId && editingSourceCategoryId === targetCategoryId && previousIndex !== null
          ? Math.min(previousIndex, targetCategory.sites.length)
          : targetCategory.sites.length;

      targetCategory.sites.splice(insertIndex, 0, newSite);
      return next;
    });

    setStatusTone("success");
    setStatusMessage(editingSiteId ? "已更新站点 ✅" : "已新增站点 💡");
    setEditingSiteId(null);
    setEditingSourceCategoryId(targetCategoryId);
    setSiteForm(createEmptyForm(targetCategoryId));
  };

  const handleSignOut = async () => {
    if (!supabaseAvailable || !supabaseClient) return;
    await supabaseClient.auth.signOut();
    setIsEditorOpen(false);
    setStatusTone("info");
    setStatusMessage("已退出管理员身份");
  };

  const requestAdminAccess = (message = "输入管理员邮箱即可获取登录链接～") => {
    if (!supabaseAvailable) return;
    setIsAuthModalOpen(true);
    setAuthTone("info");
    setAuthMessage(message);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthTone("info");
    setAuthMessage("");
    setAuthEmail("");
  };

  const handleSendMagicLink = async (event) => {
    event.preventDefault();
    if (!supabaseAvailable || !supabaseClient) return;
    const email = authEmail.trim();
    if (!email) {
      setAuthTone("error");
      setAuthMessage("请输入有效的邮箱地址");
      return;
    }
    setIsSendingLink(true);
    setAuthTone("info");
    setAuthMessage("正在发送 Magic Link，请稍候...");
    const redirectTo =
      import.meta.env.VITE_SUPABASE_REDIRECT_URL ||
      (typeof window !== "undefined" ? window.location.origin : undefined);
    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    if (error) {
      console.error("Failed to send Magic Link", error);
      setAuthTone("error");
      setAuthMessage(`发送失败：${error.message}`);
    } else {
      setAuthTone("success");
      setAuthMessage("登录链接已发送，请检查邮箱完成验证");
    }
    setIsSendingLink(false);
  };

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
      onClick: () => setIsSearchOpen((prev) => !prev),
      isActive: isSearchOpen,
    },
    {
      id: "editor",
      label: "站点管理",
      icon: <EditIcon className="h-5 w-5" />,
      onClick: openEditor,
      isActive: isEditorOpen,
    },
  ];

  const syncStateToneClass = (() => {
    switch (syncState.status) {
      case "error":
        return "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100";
      case "loading":
        return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100";
      case "ready":
        return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100";
      default:
        return "border-slate-200 bg-white/60 text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300";
    }
  })();

  const editorSyncHint = isSupabaseMode
    ? "所有更改会实时写入 Supabase，并同步到本地缓存保障离线可用。"
    : supabaseAvailable
      ? "当前云端不可用，编辑结果仅保存到本地缓存，可稍后点击重试同步。"
      : "尚未配置 Supabase，数据默认保存在本地浏览器。";
  const adminStatusLabel = (() => {
    if (!supabaseAvailable) return "本地模式 · 默认可编辑";
    if (!supabaseUser) return "未登录 · 无法编辑站点";
    if (isAdmin) return `管理员 · ${supabaseUser.email}`;
    return `访客 · ${supabaseUser.email}`;
  })();
  const adminStatusTone = !supabaseAvailable ? "success" : isAdmin ? "success" : "info";
  const adminHelpText = !supabaseAvailable
    ? "未配置 Supabase 时默认允许编辑。"
    : isAdmin
      ? "已通过管理员验证，可放心管理站点。"
      : "仅 admin 角色可编辑，点击右侧登录或联系管理员添加权限。";
  const statusToneClass = getToneClass(statusTone);
  const authToneClass = getToneClass(authTone);
  const adminStatusClass = getToneClass(adminStatusTone);

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
              } ${button.id === "editor" && !canManageSites ? "opacity-70" : ""}`}
              aria-label={button.label}
              aria-pressed={button.isActive ?? false}
              title={button.id === "editor" && !canManageSites ? "管理员登录后才可编辑站点" : button.label}
            >
              {button.icon}
            </button>
          ))}
        </div>

        {syncState.message && (
          <div className={`rounded-2xl border px-4 py-3 text-xs sm:text-sm ${syncStateToneClass}`} role="status">
            <span>{syncState.message}</span>
            {syncState.status === "error" && supabaseAvailable && (
              <button
                type="button"
                onClick={handleSupabaseRetry}
                className="ml-3 underline decoration-dotted underline-offset-4"
              >
                重试连接
              </button>
            )}
            {syncState.status === "ready" && isSupabaseMode && (
              <span className="ml-3 font-semibold text-emerald-600 dark:text-emerald-300">Supabase 已连接</span>
            )}
          </div>
        )}

        {supabaseAvailable && (
          <div className="rounded-2xl border border-slate-200/90 bg-white/80 px-4 py-3 text-xs text-slate-500 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/70 dark:text-slate-200">
            <div className="flex flex-col gap-1">
              <span className={`text-sm font-semibold ${adminStatusClass}`}>{adminStatusLabel}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">{adminHelpText}</span>
              {!isAdmin && supabaseUser && (
                <span className="text-[11px] text-amber-600 dark:text-amber-300">当前账号尚未被标记为 admin，请联系管理员赋权。</span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {supabaseUser ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-full border border-slate-200 px-4 py-1 text-slate-600 transition hover:border-rose-300 hover:text-rose-500 dark:border-slate-700 dark:text-slate-200"
                >
                  退出登录
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => requestAdminAccess("请输入管理员邮箱，我们会发送登录链接～")}
                  className="rounded-full border border-slate-200 px-4 py-1 text-slate-600 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:text-slate-200"
                >
                  管理员登录
                </button>
              )}
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-dashed border-slate-200/80 bg-white/60 px-5 py-4 text-sm text-slate-500 shadow-inner dark:border-slate-800/80 dark:bg-slate-900/40 dark:text-slate-400">
          点击右上角放大镜或使用 <span className="font-semibold text-slate-700 dark:text-slate-200">⌘K / Ctrl+K</span> 打开全屏搜索面板。
        </div>

        <section aria-labelledby="category-tabs" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="category-tabs" className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              分类快跳
            </h2>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              {categories.length} 个分类 · {allSites.length}+ 站点
            </p>
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
                  className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm transition hover:-translate-y-0.5 ${
                    isActive
                      ? "border-transparent bg-slate-900 text-white shadow-glow dark:bg-white dark:text-slate-900"
                      : "border-slate-200/70 bg-white/60 text-slate-600 hover:border-brand/30 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200"
                  }`}
                >
                  <span className="text-lg" aria-hidden="true">
                    {category.emoji}
                  </span>
                  <span className="font-semibold">{category.label}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{category.description}</span>
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
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-sm text-brand underline-offset-4 hover:underline dark:text-accent"
              >
                清空搜索
              </button>
            )}
          </div>

          {displayedSites.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center text-slate-400 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-500">
              没找到相关站点，换个关键词或者切换分类吧～
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {displayedSites.map((site) => {
                const CardElement = isEditorOpen ? "div" : "a";
                const cardProps = isEditorOpen
                  ? {}
                  : {
                      href: site.url,
                      target: "_blank",
                      rel: "noreferrer",
                    };
                return (
                  <CardElement
                    key={site.id}
                    {...cardProps}
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
                    {isEditorOpen && (
                      <div className="absolute right-4 top-4 flex gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            handleEditSite(site, site.categoryId ?? activeCategory);
                          }}
                          className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs text-slate-500 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300"
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            handleDeleteSite(site.categoryId ?? activeCategory, site.id);
                          }}
                          className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs text-rose-500 transition hover:border-rose-400 hover:text-rose-500 dark:border-slate-700 dark:bg-slate-900/70"
                        >
                          删除
                        </button>
                      </div>
                    )}
                  </CardElement>
                );
              })}
            </div>
          )}
        </section>

        <footer className="flex flex-col justify-between gap-3 rounded-3xl border border-white/40 bg-white/70 px-6 py-5 text-sm text-slate-400 shadow-inner backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/70 dark:text-slate-500 md:flex-row md:items-center">
          <span>Nav Home · 一起把灵感与效率安排得明明白白 ✨</span>
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
                    placeholder="搜索课程、文档或工具（支持拼音/别名）"
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
                              <p>{site.categoryEmoji} {site.categoryLabel}</p>
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

      {isEditorOpen && (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/20 backdrop-blur-sm">
          <div className="h-full w-full max-w-xl overflow-y-auto rounded-l-3xl border-l border-white/40 bg-slate-50/95 p-6 shadow-2xl dark:border-slate-800/80 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">Edit Mode</p>
                <h4 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">站点管理工作台</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">{editorSyncHint}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:text-slate-300"
                >
                  恢复默认
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:text-slate-300"
                >
                  关闭
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {categories.map((category) => (
                <div key={category.id} className="space-y-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500">{category.emoji} {category.label}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{category.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddSiteShortcut(category.id)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:text-slate-300"
                    >
                      + 新增
                    </button>
                  </div>
                  <DndContext
                    key={`dnd-${category.id}`}
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                    onDragEnd={(event) => handleDragEnd(category.id, event)}
                  >
                    <SortableContext items={category.sites.map((site) => site.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-3">
                        {category.sites.length === 0 ? (
                          <p className="text-xs text-slate-400 dark:text-slate-500">暂无站点，点击“新增”丰富列表～</p>
                        ) : (
                          category.sites.map((site) => (
                            <SortableSiteRow
                              key={site.id}
                              site={site}
                              onEdit={() => handleEditSite(site, category.id)}
                              onDelete={() => handleDeleteSite(category.id, site.id)}
                            />
                          ))
                        )}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              ))}
            </div>

            <form onSubmit={handleFormSubmit} className="mt-6 space-y-4 rounded-3xl border border-dashed border-slate-300/80 bg-white/90 p-5 shadow-inner dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {editingSiteId ? "编辑站点" : "新增站点"}
              </p>
              <div className="grid gap-2">
                <label className="text-xs text-slate-400 dark:text-slate-500">所属分类</label>
                <select
                  value={siteForm.categoryId}
                  onChange={(event) => setSiteForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-slate-400 dark:text-slate-500">站点名称 *</label>
                <input
                  value={siteForm.name}
                  onChange={(event) => setSiteForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  placeholder="例如：Notion"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-slate-400 dark:text-slate-500">链接 URL *</label>
                <input
                  value={siteForm.url}
                  onChange={(event) => setSiteForm((prev) => ({ ...prev, url: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  placeholder="https://"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-slate-400 dark:text-slate-500">简介</label>
                <textarea
                  value={siteForm.description}
                  onChange={(event) => setSiteForm((prev) => ({ ...prev, description: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-slate-400 dark:text-slate-500">标签（空格或逗号分隔）</label>
                <input
                  value={siteForm.tagsText}
                  onChange={(event) => setSiteForm((prev) => ({ ...prev, tagsText: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  placeholder="效率 课程"
                />
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs text-slate-400 dark:text-slate-500">快捷键</label>
                  <input
                    value={siteForm.shortcut}
                    onChange={(event) => setSiteForm((prev) => ({ ...prev, shortcut: event.target.value }))}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    placeholder="Shift+6"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs text-slate-400 dark:text-slate-500">图标 Emoji</label>
                  <input
                    value={siteForm.emoji}
                    maxLength={2}
                    onChange={(event) => setSiteForm((prev) => ({ ...prev, emoji: event.target.value }))}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    placeholder="🔗"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isActionSyncing}
                  className={`flex-1 rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 dark:text-slate-900 ${
                    isActionSyncing
                      ? "cursor-not-allowed bg-slate-400/80 dark:bg-slate-700/70"
                      : "bg-slate-900 hover:bg-brand dark:bg-white"
                  }`}
                >
                  {editingSiteId ? "保存修改" : "新增站点"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingSiteId(null);
                    setSiteForm(createEmptyForm(siteForm.categoryId));
                    setStatusTone("success");
                    setStatusMessage("已清空表单");
                  }}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-500 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:text-slate-300"
                >
                  清空
                </button>
              </div>
              {statusMessage && (
                <p className={`text-xs ${statusToneClass}`}>
                  {statusMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {isAuthModalOpen && supabaseAvailable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/30 bg-white/95 p-6 shadow-2xl dark:border-slate-800/80 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">Admin Login</p>
                <h4 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">管理员登录</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">请输入在 Supabase 中被标记为 admin 的邮箱，我们会发送一次性登录链接。</p>
              </div>
              <button
                type="button"
                onClick={handleCloseAuthModal}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:text-slate-300"
              >
                关闭
              </button>
            </div>
            <form className="mt-6 space-y-4" onSubmit={handleSendMagicLink}>
              <div className="grid gap-2">
                <label className="text-xs text-slate-400 dark:text-slate-500">管理员邮箱 *</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-brand dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSendingLink}
                className={`w-full rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 dark:text-slate-900 ${
                  isSendingLink ? "cursor-not-allowed bg-slate-400/70 dark:bg-slate-700/70" : "bg-slate-900 hover:bg-brand dark:bg-white"
                }`}
              >
                {isSendingLink ? "发送中..." : "发送 Magic Link"}
              </button>
            </form>
            {authMessage && <p className={`mt-4 text-sm ${authToneClass}`}>{authMessage}</p>}
            <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
              登录成功后若仍无法编辑，请到 Supabase Dashboard → Authentication → Users 中确认该邮箱的 app_metadata / roles 包含 admin。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function SortableSiteRow({ site, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: site.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm shadow-sm dark:border-slate-800/80 dark:bg-slate-900/70"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="cursor-grab rounded-xl border border-transparent bg-slate-100 px-2 py-1 text-slate-400 transition hover:text-brand dark:bg-slate-800 dark:text-slate-500"
          {...listeners}
          {...attributes}
          aria-label="拖拽排序"
        >
          ☰
        </button>
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-100">{site.name}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{site.url}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          {site.shortcut}
        </span>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:text-slate-300"
        >
          编辑
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-full border border-slate-200 px-3 py-1 text-xs text-rose-500 transition hover:border-rose-400 hover:text-rose-500 dark:border-slate-700"
        >
          删除
        </button>
      </div>
    </div>
  );
}

export default App;
