import type { Plugin, ViteDevServer } from "vite";
import type { SidebarOption } from "./types";
import createSidebar, { log } from "./helper";
import { join } from "node:path";
import { DefaultTheme } from "vitepress";

export * from "./types";
export * from "./util";

export default function VitePluginVitePressSidebarResolve(option: SidebarOption = {}): Plugin & { name: string } {
  return {
    name: "vite-plugin-vitepress-sidebar-resolve",
    configureServer({ watcher, restart }: ViteDevServer) {
      const fsWatcher = watcher.add("*.md");
      // 监听文件系统事件
      fsWatcher.on("add", async path => {
        // 过滤非 .md 文件
        if (!path.endsWith(".md")) return;

        // 重启服务器并来更新侧边栏
        await restart();
      });

      fsWatcher.on("unlink", async path => {
        // 过滤非 .md 文件
        if (!path.endsWith(".md")) return;

        // 重启服务器并来更新侧边栏
        await restart();
      });
    },
    config(config: any) {
      const {
        site: { themeConfig = {}, locales = {} },
        srcDir,
      } = config.vitepress;
      const { path, ignoreList, localeRootDir } = option;
      const baseDir = path ? join(process.cwd(), path) : srcDir;

      // 国际化多语言 key 数组
      const localesKeys = Object.keys(locales).filter(key => key !== "root");
      // 如果不是多语言，直接自动生成结构化侧边栏
      if (!localesKeys.length) return setSideBar(themeConfig, createSidebar({ ...option, path: baseDir }));

      // 国际化处理，针对每个语言的目录进行单独的扫描（除了 root）
      localesKeys.forEach(localesKey => {
        const sidebar: DefaultTheme.SidebarMulti = createSidebar(
          { ...option, path: `${baseDir}/${localesKey}` },
          localesKey
        );
        setSideBar(locales[localesKey].themeConfig, sidebar);
      });

      // 如果指定了 root 的目录，则扫描指定目录
      const rootDir = localeRootDir ? `/${localeRootDir}` : "";
      // 对 root 根目录的 sidebar 进行单独的扫描，且不扫描其他语言目录
      const rootSideBar = createSidebar({
        ...option,
        path: `${baseDir}${rootDir}`,
        ignoreList: [...(ignoreList || []), ...localesKeys],
      });
      setSideBar(locales["root"].themeConfig, rootSideBar);
    },
  };
}

const setSideBar = (themeConfig: any, sidebar: DefaultTheme.SidebarMulti) => {
  // 防止 themeConfig 为 undefined
  themeConfig = themeConfig || {};
  themeConfig.sidebar = {
    ...sidebar,
    ...(Array.isArray(themeConfig.sidebar) ? log("Warning: 自定义 Sidebar 必须是对象形式") : themeConfig.sidebar),
  };

  log("injected sidebar data successfully. 注入侧边栏数据成功!", "green");
};
