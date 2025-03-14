import { Plugin } from 'vite';
import { DefaultTheme } from 'vitepress';

interface SidebarOption {
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
     * 递归层数，默认以docs作为文档根目录
     * depth=1，则以docs下的子目录为文档根目录，解析docs子目录下的第一层目录，2为第二层目录，以此类推，一般以path的层级为准，如果path是docs目录，则为0，如果path是docs/article，则为1，如果path是docs/article/article1，则为2，如果path是docs/article/article1/article2，则为3，
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

/**
 * 从 md 文件中读取一级标题
 * @param markdownContent md 文件内容
 */
declare const getTitleFromMd: (mdContent: string) => string | undefined;
/**
 * 判断是否非法的序号
 *
 * @param index 序号
 */
declare const isIllegalIndex: (index: number) => boolean;
/**
 * 判断数组中是否存在某个元素，支持正则表达式
 *
 * @param arr 数组
 * @param name 元素
 */
declare const isSome: (arr: Array<string | RegExp>, name: string) => boolean;

declare function VitePluginVitePressSidebarResolve(option?: SidebarOption): Plugin & {
    name: string;
};

export { type SidebarOption, VitePluginVitePressSidebarResolve as default, getTitleFromMd, isIllegalIndex, isSome };
