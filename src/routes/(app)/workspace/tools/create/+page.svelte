<script>
	import { goto } from '$app/navigation';
	import { createNewTool, getTools } from '$lib/apis/tools';
	import ToolkitEditor from '$lib/components/workspace/Tools/ToolkitEditor.svelte';
	import { WEBUI_BASE_URL, WEBUI_VERSION } from '$lib/constants';
	import { tools } from '$lib/stores';
	import { compareVersion, extractFrontmatter } from '$lib/utils';
	import { onMount, getContext } from 'svelte';
	import { toast } from 'svelte-sonner';

	const i18n = getContext('i18n');

	let mounted = false;
	let clone = false;
	let tool = null;

	const saveHandler = async (data) => {
		console.log(data);

		const manifest = extractFrontmatter(data.content);
		if (compareVersion(manifest?.required_open_webui_version ?? '0.0.0', WEBUI_VERSION)) {
			console.log('Version is lower than required');
			toast.error(
				$i18n.t(
					'Open WebUI version (v{{OPEN_WEBUI_VERSION}}) is lower than required version (v{{REQUIRED_VERSION}})',
					{
						OPEN_WEBUI_VERSION: WEBUI_VERSION,
						REQUIRED_VERSION: manifest?.required_open_webui_version ?? '0.0.0'
					}
				)
			);
			return;
		}

		const res = await createNewTool(localStorage.token, {
			id: data.id,
			name: data.name,
			meta: data.meta,
			content: data.content,
			access_control: data.access_control
		}).catch((error) => {
			toast.error(`${error}`);
			return null;
		});

		if (res) {
			toast.success($i18n.t('Tool created successfully'));
			tools.set(await getTools(localStorage.token));

			await goto(WEBUI_BASE_URL + '/workspace/tools');
		}
	};

	onMount(() => {
		window.addEventListener('message', async (event) => {
			if (
				!['https://openwebui.com', 'https://www.openwebui.com', 'http://localhost:9999'].includes(
					event.origin
				)
			)
				return;

			// 忽略来自 React DevTools 或其他扩展的消息
			if (event.data?.source === 'react-devtools-content-script' || 
				event.data?.source === 'react-devtools-bridge' ||
				event.data?.source === 'react-devtools-hook') {
				return;
			}

			// 检查 event.data 是否已经是对象
			if (typeof event.data === 'object' && event.data !== null) {
				// 确保数据不是空对象且有实际内容
				if (Object.keys(event.data).length > 0 && !event.data.hello) {
					tool = event.data;
				}
			} else if (typeof event.data === 'string') {
				try {
					tool = JSON.parse(event.data);
				} catch (error) {
					console.error('Failed to parse event.data as JSON:', error);
					return;
				}
			} else {
				console.error('Unexpected event.data type:', typeof event.data);
				return;
			}
			console.log(tool);
		});

		if (window.opener ?? false) {
			window.opener.postMessage('loaded', '*');
		}

		if (sessionStorage.tool) {
			tool = JSON.parse(sessionStorage.tool);
			sessionStorage.removeItem('tool');

			console.log(tool);
			clone = true;
		}

		mounted = true;
	});
</script>

{#if mounted}
	{#key tool?.content}
		<ToolkitEditor
			id={tool?.id ?? ''}
			name={tool?.name ?? ''}
			meta={tool?.meta ?? { description: '' }}
			content={tool?.content ?? ''}
			access_control={null}
			{clone}
			onSave={(value) => {
				saveHandler(value);
			}}
		/>
	{/key}
{/if}
