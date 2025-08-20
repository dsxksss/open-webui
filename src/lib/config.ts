import { browser, dev } from '$app/environment';
import { base } from '$app/paths';

// 环境变量配置
export const PUBLIC_BASE_URL = browser 
  ? window.__PUBLIC_BASE_URL__ || '' 
  : '';

export const PUBLIC_API_BASE_URL = browser 
  ? window.__PUBLIC_API_BASE_URL__ || 'http://127.0.0.1:8080' 
  : 'http://127.0.0.1:8080';

export const PUBLIC_ENV = browser 
  ? window.__PUBLIC_ENV__ || 'development' 
  : 'development';

// 配置类
export class WebUIConfig {
  private static instance: WebUIConfig;
  
  public readonly isDev: boolean;
  public readonly basePath: string;
  public readonly baseUrl: string;
  public readonly hostname: string;
  
  private constructor() {
    this.isDev = dev;
    this.basePath = base;
    
    // 优先级: 环境变量 > 配置文件中的base > 默认值
    const configuredBase = PUBLIC_BASE_URL || this.basePath || '';
    
    if (browser) {
      // 浏览器环境：不包含hostname
      this.hostname = '';
      this.baseUrl = configuredBase;
    } else {
      // 服务器环境
      this.hostname = '';
      this.baseUrl = configuredBase;
    }
  }
  
  public static getInstance(): WebUIConfig {
    if (!WebUIConfig.instance) {
      WebUIConfig.instance = new WebUIConfig();
    }
    return WebUIConfig.instance;
  }
  
  // 获取完整的API URL
  public getApiUrl(path: string = ''): string {
    if (this.isDev && browser) {
      // 开发环境下使用相对路径，让Vite代理处理
      return path.startsWith('/') ? path : `/${path}`;
    }
    
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const cleanBase = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    
    return cleanPath ? `${cleanBase}/${cleanPath}` : cleanBase;
  }
  
  // 获取静态资源URL
  public getStaticUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return this.getApiUrl(`static/${cleanPath}`);
  }
  
  // 设置运行时配置（用于构建时或运行时动态配置）
  public static setRuntimeConfig(config: {
    baseUrl?: string;
    apiBaseUrl?: string;
    env?: string;
  }) {
    if (browser) {
      (window as any).__PUBLIC_BASE_URL__ = config.baseUrl;
      (window as any).__PUBLIC_API_BASE_URL__ = config.apiBaseUrl;
      (window as any).__PUBLIC_ENV__ = config.env;
      
      // 重新创建实例
      WebUIConfig.instance = new WebUIConfig();
    }
  }
}

// 导出单例实例
export const webUIConfig = WebUIConfig.getInstance();

// 向后兼容的常量导出
export const WEBUI_BASE_URL = webUIConfig.baseUrl;
export const WEBUI_HOSTNAME = webUIConfig.hostname;
export const WEBUI_HOSTNAME_PATH = webUIConfig.basePath;
