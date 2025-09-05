<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { prompts } from '$lib/stores';
	import { onMount, tick, getContext } from 'svelte';

	const i18n = getContext('i18n');

	import { createNewPrompt, getPrompts } from '$lib/apis/prompts';
	import PromptEditor from '$lib/components/workspace/Prompts/PromptEditor.svelte';
	import { WEBUI_BASE_URL } from '$lib/constants';

	let prompt: {
		title: string;
		command: string;
		content: string;
		access_control: any | null;
	} | null = null;

	let clone = false;

	const onSubmit = async (_prompt) => {
		const res = await createNewPrompt(localStorage.token, _prompt).catch((error) => {
			toast.error(`${error}`);
			return null;
		});

		if (res) {
			toast.success($i18n.t('Prompt created successfully'));

			await prompts.set(await getPrompts(localStorage.token));
			await goto(WEBUI_BASE_URL + '/workspace/prompts');
		}
	};

	onMount(async () => {
		window.addEventListener('message', async (event) => {
			if (
				!['https://openwebui.com', 'https://www.openwebui.com', 'http://localhost:5173'].includes(
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

			let _prompt;
			// 检查 event.data 是否已经是对象
			if (typeof event.data === 'object' && event.data !== null) {
				// 确保数据不是空对象且有实际内容
				if (Object.keys(event.data).length > 0 && !event.data.hello) {
					_prompt = event.data;
				} else {
					return;
				}
			} else if (typeof event.data === 'string') {
				try {
					_prompt = JSON.parse(event.data);
				} catch (error) {
					console.error('Failed to parse event.data as JSON:', error);
					return;
				}
			} else {
				console.error('Unexpected event.data type:', typeof event.data);
				return;
			}
			console.log('Received prompt via window message:', _prompt);

			clone = true;
			prompt = {
				title: _prompt?.title || '',
				command: _prompt?.command || '',
				content: _prompt?.content || '',
				access_control: null
			};
		});

		if (window.opener ?? false) {
			window.opener.postMessage('loaded', '*');
		}

		if (sessionStorage.prompt) {
			const _prompt = JSON.parse(sessionStorage.prompt);
			sessionStorage.removeItem('prompt');

			console.log('Received prompt via sessionStorage:', _prompt);

			clone = true;
			prompt = {
				title: _prompt.title,
				command: _prompt.command,
				content: _prompt.content,
				access_control: null
			};
		}
	});
</script>

{#key prompt}
	<PromptEditor {prompt} {onSubmit} {clone} />
{/key}
