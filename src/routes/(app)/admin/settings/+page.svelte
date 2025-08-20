<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { WEBUI_BASE_URL } from '$lib/constants';
	import Settings from '$lib/components/admin/Settings.svelte';

	onMount(() => {
		goto(WEBUI_BASE_URL + '/admin/settings/general');
	});
</script>

<Settings />
