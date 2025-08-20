import { base } from '$app/paths';
import { redirect } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const url = event.url;
	const pathname = url.pathname;
	
	// 如果设置了base URL，且用户访问的是没有前缀的路径
	if (base && base !== '' && !pathname.startsWith(base)) {
		// 检查是否是API请求、静态资源或其他资源文件
		if (pathname.startsWith('/api') || 
			pathname.startsWith('/ollama') || 
			pathname.startsWith('/openai') || 
			pathname.startsWith('/static') ||
			pathname.startsWith('/favicon') ||
			pathname.includes('.') || // 包含扩展名的文件（如.js, .css, .png等）
			pathname.startsWith('/_app/')) { // SvelteKit内部资源
			// 这些请求不重定向，直接处理
			return resolve(event);
		}
		
		// 只对明确的页面路径进行重定向，且仅当请求是HTML页面时
		const isPageRequest = event.request.headers.get('accept')?.includes('text/html');
		
		if (isPageRequest && (
			pathname === '/' || 
			pathname.startsWith('/admin') || 
			pathname.startsWith('/workspace') || 
			pathname.startsWith('/notes') || 
			pathname.startsWith('/auth') ||
			pathname.startsWith('/playground') ||
			pathname.startsWith('/channels'))) {
			
			const newPath = base + pathname;
			const queryString = url.search;
			throw redirect(302, newPath + queryString);
		}
	}
	
	return resolve(event);
}
