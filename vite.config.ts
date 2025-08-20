import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import { viteStaticCopy } from 'vite-plugin-static-copy';

// 动态创建代理配置
function createProxyConfig() {
	const baseUrl = process.env.PUBLIC_BASE_URL || '';
	const backendUrl = 'http://127.0.0.1:8080';
	
	const proxy = {
		// 默认代理（无前缀）
		'/api': {
			target: backendUrl,
			changeOrigin: true
		},
		'/ollama': {
			target: backendUrl,
			changeOrigin: true,
			ws: true
		},
		'/openai': {
			target: backendUrl,
			changeOrigin: true
		},
		'/static': {
			target: backendUrl,
			changeOrigin: true
		}
	};
	
	// 如果有BASE_URL前缀，添加对应的代理规则
	if (baseUrl && baseUrl !== '') {
		const cleanBaseUrl = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`;
		
		proxy[`^${cleanBaseUrl}/api`] = {
			target: backendUrl,
			changeOrigin: true,
			rewrite: (path) => path.replace(new RegExp(`^${cleanBaseUrl}`), '')
		};
		
		proxy[`^${cleanBaseUrl}/ollama`] = {
			target: backendUrl,
			changeOrigin: true,
			ws: true,
			rewrite: (path) => path.replace(new RegExp(`^${cleanBaseUrl}`), '')
		};
		
		proxy[`^${cleanBaseUrl}/openai`] = {
			target: backendUrl,
			changeOrigin: true,
			rewrite: (path) => path.replace(new RegExp(`^${cleanBaseUrl}`), '')
		};
		
		proxy[`^${cleanBaseUrl}/static`] = {
			target: backendUrl,
			changeOrigin: true,
			rewrite: (path) => path.replace(new RegExp(`^${cleanBaseUrl}`), '')
		};
	}
	
	return proxy;
}

// /** @type {import('vite').Plugin} */
// const viteServerConfig = {
// 	name: 'log-request-middleware',
// 	configureServer(server) {
// 		server.middlewares.use((req, res, next) => {
// 			res.setHeader('Access-Control-Allow-Origin', '*');
// 			res.setHeader('Access-Control-Allow-Methods', 'GET');
// 			res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
// 			res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
// 			next();
// 		});
// 	}
// };

export default defineConfig({
	plugins: [
		sveltekit(),
		viteStaticCopy({
			targets: [
				{
					src: 'node_modules/onnxruntime-web/dist/*.jsep.*',

					dest: 'wasm'
				}
			]
		})
	],
	define: {
		APP_VERSION: JSON.stringify(process.env.npm_package_version),
		APP_BUILD_HASH: JSON.stringify(process.env.APP_BUILD_HASH || 'dev-build')
	},
	build: {
		sourcemap: true
	},
	worker: {
		format: 'es'
	},
	esbuild: {
		pure: ['console.log', 'console.debug']
	},
	server: {
		proxy: createProxyConfig()
	}
});
