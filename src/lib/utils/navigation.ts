import { goto as svelteGoto } from '$app/navigation';
import { WEBUI_BASE_URL } from '$lib/constants';

/**
 * 导航到指定路径，自动处理base URL前缀
 * @param path - 目标路径，如 '/admin/users'
 * @param options - goto选项
 */
export function navigateTo(path: string, options?: Parameters<typeof svelteGoto>[1]): Promise<void> {
	// 如果路径已经包含base URL，直接使用
	if (path.startsWith(WEBUI_BASE_URL)) {
		return svelteGoto(path, options);
	}
	
	// 否则添加base URL前缀
	const fullPath = WEBUI_BASE_URL + (path.startsWith('/') ? path : `/${path}`);
	return svelteGoto(fullPath, options);
}

/**
 * 获取带有base URL前缀的完整路径
 * @param path - 相对路径
 * @returns 完整路径
 */
export function getFullPath(path: string): string {
	if (path.startsWith(WEBUI_BASE_URL)) {
		return path;
	}
	
	return WEBUI_BASE_URL + (path.startsWith('/') ? path : `/${path}`);
}

/**
 * 检查当前路径是否匹配指定模式
 * @param pattern - 路径模式，如 '/admin/users'
 * @param currentPath - 当前路径（可选，默认使用当前页面路径）
 * @returns 是否匹配
 */
export function isCurrentPath(pattern: string, currentPath?: string): boolean {
	const fullPattern = getFullPath(pattern);
	const pathToCheck = currentPath || window.location.pathname;
	return pathToCheck.startsWith(fullPattern);
}
