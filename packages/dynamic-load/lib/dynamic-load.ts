type IAsyncLoadResult = {
  name: string;
  success: boolean;
};

// 缓存已请求到的资源
const resourceCache = new Map<string, string>();
// 缓存发起中的请求
const asyncLoadQueue = new Map<string, Promise<IAsyncLoadResult>>();

type IResource = {
  url: string;
  name: string;
  /**
   * 加载失败后的重试次数
   */
  retry?: number;
  /**
   * 资源加载失败后报错等级
   * fatal: 致命的错误，加载失败后，会影响页面正常展示
   * error: 弱提醒，加载失败后，控制输出提示
   */
  level?: "fatal" | "error";
};

export type IDynamicLoad = IResource;

/**
 * @description 动态加载资源
 */
const dynamicLoad = (props: IDynamicLoad) => {
  const { url, name, retry, level } = props;

  if (asyncLoadQueue.has(url)) {
    return asyncLoadQueue.get(url)!;
  }

  const load = new Promise<IAsyncLoadResult>((resolve, reject) => {
    if (resourceCache.has(url)) return resolve({ name, success: true });

    // 动态创建 script 标签获取资源
    const script = document.createElement("script");
    // 并行加载，顺序执行
    script.async = false;
    script.setAttribute("src", url);
    document.head.appendChild(script);

    // 监听资源获取成功
    script.addEventListener("load", () => {
      // 缓存已请求的资源
      resourceCache.set(url, name);
      asyncLoadQueue.delete(url);
      document.head.removeChild(script);
      return resolve({ name, success: true });
    });

    // 监听资源获取失败
    script.addEventListener("error", (err) => {
      if (!retry) {
        if (level === "fatal") return reject(err);
        console.error(`Warning: ${name} load failed!`);
        return resolve({ name, success: false });
      }
      asyncLoadQueue.delete(url);
      document.head.removeChild(script);
      return dynamicLoad({ url, name, retry: retry - 1 });
    });
  });

  asyncLoadQueue.set(url, load);

  return load;
};

type IMultipleLoad = {
  resources: IResource[];
  /**
   * 加载失败后的重试次数
   */
  retry?: number;
};
// React.FC<{
//   [x: string]: unknown;
//   children: React.ReactNode;
// }>
export type IMultipleLoadResponse<T> = {
  components: Record<string, T>;
};
/**
 * @description
 * @param props
 */
export const multipleLoad = async <T>(
  props: IMultipleLoad
): Promise<IMultipleLoadResponse<T>> => {
  const { resources, retry } = props;
  const queue: Promise<IAsyncLoadResult>[] = [];

  for (const resource of resources) {
    queue.push(dynamicLoad({ ...resource, retry }));
  }

  try {
    const result = await Promise.all(queue);

    const components: IMultipleLoadResponse<T>["components"] = {};
    for (const component of result.filter((res) => res.success)) {
      const { name } = component;
      components[name] = (window as any)[name];
    }

    return { components };
  } catch (error) {
    throw error;
  }
};
