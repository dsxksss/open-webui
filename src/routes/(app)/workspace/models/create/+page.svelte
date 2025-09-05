<script>
	import { v4 as uuidv4 } from 'uuid';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { config, models, settings } from '$lib/stores';

	import { onMount, tick, getContext } from 'svelte';
	import { createNewModel, getModelById } from '$lib/apis/models';
	import { getModels } from '$lib/apis';

	import ModelEditor from '$lib/components/workspace/Models/ModelEditor.svelte';
	import { WEBUI_BASE_URL } from '$lib/constants';

	const i18n = getContext('i18n');

	const onSubmit = async (modelInfo) => {
		if ($models.find((m) => m.id === modelInfo.id)) {
			toast.error(
				`Error: A model with the ID '${modelInfo.id}' already exists. Please select a different ID to proceed.`
			);
			return;
		}

		if (modelInfo.id === '') {
			toast.error('Error: Model ID cannot be empty. Please enter a valid ID to proceed.');
			return;
		}

		if (modelInfo) {
			const res = await createNewModel(localStorage.token, {
				...modelInfo,
				meta: {
					...modelInfo.meta,
					profile_image_url: modelInfo.meta.profile_image_url ?? `${WEBUI_BASE_URL}/static/favicon.png`,
					suggestion_prompts: modelInfo.meta.suggestion_prompts
						? modelInfo.meta.suggestion_prompts.filter((prompt) => prompt.content !== '')
						: null
				},
				params: { ...modelInfo.params }
			}).catch((error) => {
				toast.error(`${error}`);
				return null;
			});

			if (res) {
				await models.set(
					await getModels(
						localStorage.token,
						$config?.features?.enable_direct_connections && ($settings?.directConnections ?? null)
					)
				);
				toast.success($i18n.t('Model created successfully!'));
				await goto(WEBUI_BASE_URL + '/workspace/models');
			}
		}
	};

	let model = null;

	onMount(async () => {
		window.addEventListener('message', async (event) => {
			// 过滤掉 React DevTools 和其他不相关的消息
			if (
				!['https://openwebui.com', 'https://www.openwebui.com', 'http://localhost:5173'].includes(
					event.origin
				)
			) {
				return;
			}

			// 忽略来自 React DevTools 或其他扩展的消息
			if (event.data?.source === 'react-devtools-content-script' || 
				event.data?.source === 'react-devtools-bridge' ||
				event.data?.source === 'react-devtools-hook') {
				return;
			}

			let data;
			// 检查 event.data 是否已经是对象
			if (typeof event.data === 'object' && event.data !== null) {
				data = event.data;
			} else if (typeof event.data === 'string') {
				try {
					data = JSON.parse(event.data);
				} catch (error) {
					console.error('Failed to parse event.data as JSON:', error);
					return;
				}
			} else {
				console.error('Unexpected event.data type:', typeof event.data);
				return;
			}

			// 只有在数据有意义时才处理
			if (data?.info) {
				data = data.info;
			}

			// 确保数据不是空对象且有实际内容
			if (data && Object.keys(data).length > 0 && !data.hello) {
				model = data;
			}
		});

		if (window.opener ?? false) {
			window.opener.postMessage('loaded', '*');
		}

		if (sessionStorage.model) {
			model = JSON.parse(sessionStorage.model);
			sessionStorage.removeItem('model');
		}
	});
</script>

{#key model}
	<ModelEditor {model} {onSubmit} />
{/key}
