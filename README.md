# vitepress-plugin-sidebar-depth

这是一个适用于 `vitepress` 的 Vite 插件，在 `vitepress` 启动后扫描 markdown 文档来自动生成侧边栏。

## ✨ 特性

- 🚀 扫描项目的目录，自动生成侧边栏数据，挂载到 `themeConfig.sidebar`
- 🚀 支持自定义扫描的递归深度
- 🚀 支持 `01.guide.md` 带有序号的文件格式，在渲染侧边栏数据时，带序号的文件位置比不带序号的文件高
- 🚀 支持 locales 国际化，挂载到 `locales.[lang].themeConfig.sidebar`

> 说明：在同层目录下，如果存在相同序号的文件时，后面的文件会覆盖前面的文件

侧边栏的 `text` 获取顺序：

- 如果为目录：按顺序从该目录下的 `index.md, index.MD, 目录名.md` 文件获取一级标题，如果获取不到，则以目录名为 `text`
- 如果为文件：`formatter.title` > Markdown 文件一级标题（`titleFormMd` 为 true 生效） > Markdown 文件名

## 🕯️ 安装

安装 `vitepress-plugin-sidebar-resolve` 插件

::: code-group

```sh [npm]
npm vitepress-plugin-sidebar-resolve -D
```

```sh [yarn]
yarn add vitepress-plugin-sidebar-resolve -D
```

```sh [pnpm]
pnpm i vitepress-plugin-sidebar-resolve -D
```

:::

添加 `vitepress-plugin-sidebar-depth` 插件到 `.vitepress/config.ts`

```typescript
import Sidebar from "vitepress-plugin-sidebar-depth";

export default defineConfig({
  vite: {
    plugins: [Sidebar({
      path: "docs",
      collapsed: true,
      depth: 2,
      ignoreIndexMd: true,
      ignoreList: ["@pages", "utils", "@fragment"],
    })],
  },
});
```

> 说明：该插件仅限项目启动时生效，已改动或新添加的 markdown 需要重启项目才能生效。

插件默认忽略 `["node_modules", "dist", ".vitepress", "public"]` 目录下的文件，且只扫描 markdown 文档。

## 🛠️ Options

### Parameters

| name            | description                                                  | type                                                         | default                        |
| --------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------ |
| ignoreList      | 忽略的文件/文件夹列表，支持正则表达式                        | `string[]`                                                   | `[]`                           |
| path            | 指定扫描的根目录                                             | `string`                                                     | `vitepress` 的 `srcDir` 配置项 |
| depth           | 递归扫描的深度，默认以docs为根目录                           | number                                                       | 1                              |
| ignoreIndexMd   | 是否忽略每个目录下的 `index.md` 文件                         | `boolean`                                                    | `false`                        |
| scannerRootMd   | 是否扫描根目录下的 md 文件作为 sideBar，如果为 true，则扫描根目录下的 md 文件作为 sideBar，且忽略根目录下的 index.md | `boolean`                                                    | `true`                         |
| initItems       | 是否初始化第一层 items                                       | `boolean`                                                    | `true`                         |
| initItemsText   | 是否初始化第一层 items 的 text 为当前目录名。当 `initItems` 为 true 时生效 | `boolean`                                                    | `false`                        |
| collapsed       | 是否折叠侧边栏，函数的 2 个参数为当前文件的相对路径（基于根目录）和侧边栏的 `text` | `boolean | ((relativePath: string, text: string | undefined) => boolean)` | `true`                         |
| fileIndexPrefix | 文件名前缀必须以「数字.」开头                                | `boolean`                                                    | `false`                        |
| titleFormMd     | 是否从 md 文件获取第一个一级标题作为侧边栏 text              | `boolean`                                                    | `false`                        |
| localeRootDir   | 当 Vitepress 设置 locales 国际化后，如果将 root 语言（默认语言）的所有文件放到一个单独的目录下，如 zh，则需要将 `localeRootDir` 设为 zh，否则侧边栏无法知道文件都放到了 zh | string                                                       | 文档根目录                     |

> 额外说明

假设根目录下有目录名为 `guide`：

- 当 `initItems` 为 true，则最终结果为 `sidebar: { "/guide": { items: [], collapsed }}`
    - 当 `initItemsText` 为 true，则最终结果为 `sidebar: { "/guide": { text: "guide", items: [], collapsed }}`
    - 当 `initItemsText` 为 false，则最终结果为 `sidebar: { "/guide": { items: [] }}`
- 当 `initItems` 为 false，则最终结果为 `sidebar: { "/guide": [] }`

### Hooks

可以通过插件提供的回调函数来修改侧边栏数据

| name                     | description                                                  | type                                                         | default |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------- |
| sideBarResolved          | 解析完每个 sideBar 后的回调。每个 sideBar 指的是二级目录     | `(data: DefaultTheme.SidebarMulti) => DefaultTheme.SidebarMulti` |         |
| sideBarItemsResolved     | 解析完每个 sideBarItem 后的回调。每个 sideBarItem 指的是每个二级目录下的文件数组 | `(data: DefaultTheme.SidebarItem[]) => DefaultTheme.SidebarItem[]` |         |
| beforeCreateSideBarItems | 创建 sideBarItem 之前的回调。每个 sideBarItem 指的是每个二级目录下的文件数组 | `(data: string[]) => string[]`                               |         |

## 📘 TypeScript

### 🛠️ Options

```typescript
import type { DefaultTheme } from "vitepress";

export interface SidebarOption {
  /**
   * 生成侧边栏时，忽略的文件/文件夹列表，支持正则表达式
   *
   * @default []
   */
  ignoreList?: Array<RegExp | string>;
  /**
   * 文章所在的目录，基于 package.json 所在目录，开头不需要有 /
   *
   * @default 'vitepress 的 srcDir 配置项'
   */
  path?: string;
  /**
   * 递归层数，使用此参数必须设置path: docs，
   * depth=1，则以docs下的子目录为文档根目录，解析docs子目录下的第一层目录，2为第二层目录，以此类推，一般以文件夹的层级为准，如果md文件放在docs目录，则为1，如果md文件放在docs/article，则为2，如果md文件放在docs/article/article1，则为3
   */
  depth?: number;
  /**
   * 是否忽略每个目录下的 index.md 文件
   *
   * @default false
   */
  ignoreIndexMd?: boolean;
  /**
   * 是否扫描根目录下的 md 文件作为 sideBar，如果为 true，则扫描根目录下的 md 文件作为 sideBar，且忽略根目录下的 index.md
   *
   * @default true
   */
  scannerRootMd?: boolean;
  /**
   * 是否初始化第一层 items
   *
   * 假设根目录下有目录名为 guide：
   * 1、当 initItems 为 true，则最终结果为 sidebar: { "/guide": { items: [], collapsed }}
   * 2、当 initItems 为 false，则最终结果为 sidebar: { "/guide": [] }
   *
   * @default true
   */
  initItems?: boolean;
  /**
   * 是否初始化第一层 items 的 text 为当前目录名。当 initItems 为 true 时生效
   *
   * 假设根目录下有目录名为 guide，且 initItems 为 true：
   * 1、当 initItemsText 为 true，则最终结果为 sidebar: { "/guide": { text: "guide", items: [], collapsed }}
   * 2、当 initItemsText 为 false，则最终结果为 sidebar: { "/guide": { items: [] }}
   *
   * @default false
   */
  initItemsText?: boolean;
  /**
   * 是否默认折叠侧边栏，可以是 boolean 或者一个函数
   *
   * 函数的 2 个参数为：
   * 1、当前文件的相对路径（基于根目录）
   * 2、侧边栏的 text
   *
   * @default undefined
   */
  collapsed?: boolean | ((relativePath: string, text: string | undefined) => boolean);
  /**
   * 文件名前缀必须以「数字.」开头
   *
   * @default true
   */
  fileIndexPrefix?: boolean;
  /**
   * 是否从 md 文件获取第一个一级标题作为侧边栏 text
   *
   * @default false
   * @remark 侧边栏 text 获取顺序
   * titleFormMd 为 true：md 文件 formatter.title > [md 文件第一个一级标题] > md 文件名
   * titleFormMd 为 false：md 文件 formatter.title > md 文件名
   */
  titleFormMd?: boolean;
  /**
   * 当 Vitepress 设置 locales 国际化后，如果将 root 语言（默认语言）的所有文件放到一个单独的目录下，如 zh，则需要将 localeRootDir 设为 zh，否则侧边栏无法知道文件都放到了 zh
   * 如果 root 语言（默认语言）的所有文件放在文档根目录下，则不需要设置 localeRootDir
   *
   * @default 文档根目录
   */
  localeRootDir?: string;
  /**
   * 解析完每个 sideBar 后的回调。每个 sideBar 指的是 SidebarOption.path 目录下的每个子目录
   *
   * @param data 当前 sideBar 列表
   * @default undefined
   */
  sideBarResolved?: (data: DefaultTheme.SidebarMulti) => DefaultTheme.SidebarMulti;
  /**
   * 解析完每个 sideBarItem 后的回调。每个 sideBarItem 指的是每个目录下的文件数组
   *
   * @param data 当前 sideBarItem 列表
   * @default undefined
   */
  sideBarItemsResolved?: (data: DefaultTheme.SidebarItem[]) => DefaultTheme.SidebarItem[];
  /**
   * 创建 sideBarItem 之前的回调。每个 sideBarItem 指的是每个目录下的文件数组
   *
   *
   * @param data 将要解析的所有文件名
   * @default undefined
   * @remark 可以过滤掉不需要解析为 sideBarItem 的文件
   */
  beforeCreateSideBarItems?: (data: string[]) => string[];

}
```