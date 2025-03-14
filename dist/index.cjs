'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const node_fs = require('node:fs');
const node_path = require('node:path');
const matter = require('gray-matter');
const picocolors = require('picocolors');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e.default : e; }

const matter__default = /*#__PURE__*/_interopDefaultCompat(matter);
const picocolors__default = /*#__PURE__*/_interopDefaultCompat(picocolors);

const getTitleFromMd = (mdContent) => {
  const lines = mdContent.trimStart().split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith("# ")) {
      return line.substring(2).trim();
    }
  }
  return void 0;
};
const isIllegalIndex = (index) => {
  return isNaN(index) || index < 0;
};
const isSome = (arr, name) => {
  return arr.some((item) => item === name || item instanceof RegExp && item.test(name));
};

const log = (message, type = "yellow") => {
  console.log(picocolors__default[type](message));
};
const DEFAULT_IGNORE_DIR = ["node_modules", "dist", ".vitepress", "public"];
const createSidebar = (option = { depth: 0 }, prefix = "/") => {
  const {
    path = process.cwd(),
    ignoreList = [],
    scannerRootMd = true,
    sideBarResolved,
    depth = 1
  } = option;
  prefix = prefix.replace(/\/$/, "") + "/";
  let sidebar = {};
  const dirPaths = readDirPaths(path, ignoreList);
  log(`Generating sidebar for path: \`${path}\``, "green");
  const key = prefix === "/" ? prefix : `/${prefix}`;
  if (scannerRootMd) sidebar[key] = createSideBarItems(path, { ...option, ignoreIndexMd: false }, key, scannerRootMd);
  dirPaths.forEach((dirPath) => {
    generateSidebarRecursively(dirPath, option, key, sidebar, 1, depth);
  });
  return sideBarResolved?.(sidebar) ?? sidebar;
};
const generateSidebarRecursively = (dirPath, option, currentPrefix, sidebar, currentDepth = 1, maxDepth = 1) => {
  const fileName = node_path.basename(dirPath);
  const newPrefix = `${currentPrefix}${fileName}/`;
  const sidebarItems = createSideBarItems(dirPath, option, newPrefix);
  if (!sidebarItems.length) {
    log(`Warning\uFF1A\u8BE5\u76EE\u5F55 '${dirPath}' \u5185\u90E8\u6CA1\u6709\u4EFB\u4F55\u6587\u4EF6\u6216\u6587\u4EF6\u5E8F\u53F7\u51FA\u9519\uFF0C\u5C06\u5FFD\u7565\u751F\u6210\u5BF9\u5E94\u4FA7\u8FB9\u680F`);
    return;
  }
  const { name, title } = resolveFileName(fileName, dirPath);
  const mdTitle = option.titleFormMd ? tryGetMdTitle(dirPath, fileName) : "";
  const text = option.initItemsText ? mdTitle || title : void 0;
  if (option.depth) {
    if (currentDepth > maxDepth) return;
  }
  sidebar[newPrefix] = option.initItems ? [
    {
      text,
      collapsed: typeof option.collapsed === "function" ? option.collapsed(newPrefix + name, text) : option.collapsed,
      items: sidebarItems
    }
  ] : sidebarItems;
  const subDirs = readDirPaths(dirPath, option.ignoreList);
  subDirs.forEach((subDir) => {
    generateSidebarRecursively(subDir, option, newPrefix, sidebar, currentDepth + 1, maxDepth);
  });
};
const readDirPaths = (sourceDir, ignoreList = []) => {
  const dirPaths = [];
  const ignoreListAll = [...DEFAULT_IGNORE_DIR, ...ignoreList];
  const dirOrFilenames = node_fs.readdirSync(sourceDir);
  dirOrFilenames.forEach((dirOrFilename) => {
    const secondDirPath = node_path.resolve(sourceDir, dirOrFilename);
    if (!isSome(ignoreListAll, dirOrFilename) && node_fs.statSync(secondDirPath).isDirectory()) {
      dirPaths.push(secondDirPath);
    }
  });
  return dirPaths;
};
const createSideBarItems = (root, option, prefix = "/", onlyScannerRootMd = false) => {
  const {
    collapsed,
    ignoreList = [],
    ignoreIndexMd = false,
    fileIndexPrefix = false,
    sideBarItemsResolved,
    beforeCreateSideBarItems,
    titleFormMd = false
  } = option;
  const ignoreListAll = [...DEFAULT_IGNORE_DIR, ...ignoreList];
  let sidebarItems = [];
  let sidebarItemsNoIndex = [];
  let dirOrFilenames = node_fs.readdirSync(root);
  dirOrFilenames = beforeCreateSideBarItems?.(dirOrFilenames) ?? dirOrFilenames;
  dirOrFilenames.forEach((dirOrFilename) => {
    if (isSome(ignoreListAll, dirOrFilename)) return [];
    const filePath = node_path.resolve(root, dirOrFilename);
    let { index: indexStr, title, type, name } = resolveFileName(dirOrFilename, filePath);
    const index = parseInt(indexStr, 10);
    if (fileIndexPrefix && isIllegalIndex(index)) {
      log(`Warning\uFF1A\u8BE5\u6587\u4EF6 '${filePath}' \u5E8F\u53F7\u51FA\u9519\uFF0C\u8BF7\u586B\u5199\u6B63\u786E\u7684\u5E8F\u53F7`);
      return [];
    }
    if (sidebarItems[index]) {
      log(`Warning\uFF1A\u8BE5\u6587\u4EF6 '${filePath}' \u7684\u5E8F\u53F7\u5728\u540C\u4E00\u6587\u4EF6\u5939\u4E2D\u91CD\u590D\u51FA\u73B0\uFF0C\u8BF7\u68C0\u67E5`, "red");
      return;
    }
    if (!onlyScannerRootMd && node_fs.statSync(filePath).isDirectory()) {
      const mdTitle = titleFormMd ? tryGetMdTitle(root, dirOrFilename) : "";
      const text = mdTitle || title;
      const sidebarItem = {
        text,
        collapsed: typeof collapsed === "function" ? collapsed(prefix + name, text) : collapsed,
        items: createSideBarItems(filePath, option, `${prefix}${dirOrFilename}/`)
      };
      if (isIllegalIndex(index)) sidebarItemsNoIndex.push(sidebarItem);
      else sidebarItems[index] = sidebarItem;
    } else {
      if (onlyScannerRootMd && dirOrFilename === "index.md") return [];
      if (ignoreIndexMd && ["index.md", "index.MD"].includes(dirOrFilename)) return [];
      if (!["md", "MD"].includes(type)) {
        !onlyScannerRootMd && log(`Warning\uFF1A\u8BE5\u6587\u4EF6 '${filePath}' \u975E .md \u683C\u5F0F\u6587\u4EF6\uFF0C\u4E0D\u652F\u6301\u8BE5\u6587\u4EF6\u7C7B\u578B`);
        return [];
      }
      const content = node_fs.readFileSync(filePath, "utf-8");
      const { data = {}, content: mdContent } = matter__default(content, {});
      const frontmatterTitle = data.title || "";
      const mdTitle = titleFormMd ? getTitleFromMd(mdContent) : "";
      const text = frontmatterTitle || mdTitle || title;
      const sidebarItem = {
        text,
        collapsed: typeof collapsed === "function" ? collapsed(prefix + name, text) : collapsed,
        link: prefix + name
      };
      if (isIllegalIndex(index)) sidebarItemsNoIndex.push(sidebarItem);
      else sidebarItems[index] = sidebarItem;
    }
  });
  sidebarItems = [...sidebarItems, ...sidebarItemsNoIndex].filter(Boolean);
  return sideBarItemsResolved?.(sidebarItems) ?? sidebarItems;
};
const resolveFileName = (filename, filePath) => {
  const stat = node_fs.statSync(filePath);
  let index = "";
  let title = "";
  let type = "";
  let name = "";
  const fileNameArr = filename.split(".");
  if (fileNameArr.length === 2) {
    index = fileNameArr[0] === "index" ? "0" : fileNameArr[0];
    title = stat.isDirectory() ? fileNameArr[1] : fileNameArr[0];
    type = fileNameArr[1];
    name = fileNameArr[0];
  } else {
    const firstDotIndex = filename.indexOf(".");
    const lastDotIndex = filename.lastIndexOf(".");
    index = filename.substring(0, firstDotIndex);
    type = filename.substring(lastDotIndex + 1);
    name = stat.isDirectory() ? filename : filename.substring(0, lastDotIndex);
    if (stat.isDirectory()) title = filename.substring(firstDotIndex + 1);
    else title = filename.substring(firstDotIndex + 1, lastDotIndex);
  }
  return { index, title, type, name };
};
const tryGetMdTitle = (root, dirOrFilename) => {
  const filePaths = [
    node_path.join(root, dirOrFilename, "index.md"),
    node_path.join(root, dirOrFilename, "index.MD"),
    node_path.join(root, dirOrFilename, dirOrFilename + ".md")
  ];
  for (const filePath of filePaths) {
    if (!node_fs.existsSync(filePath)) continue;
    const content = node_fs.readFileSync(filePath, "utf-8");
    const { content: mdContent } = matter__default(content, {});
    const t = getTitleFromMd(mdContent);
    if (t) return t;
  }
  return "";
};

function VitePluginVitePressSidebarResolve(option = {}) {
  return {
    name: "vite-plugin-vitepress-sidebar-resolve",
    configureServer({ watcher, restart }) {
      const fsWatcher = watcher.add("*.md");
      fsWatcher.on("add", async (path) => {
        if (!path.endsWith(".md")) return;
        await restart();
      });
      fsWatcher.on("unlink", async (path) => {
        if (!path.endsWith(".md")) return;
        await restart();
      });
    },
    config(config) {
      const {
        site: { themeConfig = {}, locales = {} },
        srcDir
      } = config.vitepress;
      const { path, ignoreList, localeRootDir } = option;
      const baseDir = path ? node_path.join(process.cwd(), path) : srcDir;
      const localesKeys = Object.keys(locales).filter((key) => key !== "root");
      if (!localesKeys.length) return setSideBar(themeConfig, createSidebar({ ...option, path: baseDir }));
      localesKeys.forEach((localesKey) => {
        const sidebar = createSidebar(
          { ...option, path: `${baseDir}/${localesKey}` },
          localesKey
        );
        setSideBar(locales[localesKey].themeConfig, sidebar);
      });
      const rootDir = localeRootDir ? `/${localeRootDir}` : "";
      const rootSideBar = createSidebar({
        ...option,
        path: `${baseDir}${rootDir}`,
        ignoreList: [...ignoreList || [], ...localesKeys]
      });
      setSideBar(locales["root"].themeConfig, rootSideBar);
    }
  };
}
const setSideBar = (themeConfig, sidebar) => {
  themeConfig = themeConfig || {};
  themeConfig.sidebar = {
    ...sidebar,
    ...Array.isArray(themeConfig.sidebar) ? log("Warning: \u81EA\u5B9A\u4E49 Sidebar \u5FC5\u987B\u662F\u5BF9\u8C61\u5F62\u5F0F") : themeConfig.sidebar
  };
  log("injected sidebar data successfully. \u6CE8\u5165\u4FA7\u8FB9\u680F\u6570\u636E\u6210\u529F!", "green");
};

exports.default = VitePluginVitePressSidebarResolve;
exports.getTitleFromMd = getTitleFromMd;
exports.isIllegalIndex = isIllegalIndex;
exports.isSome = isSome;
