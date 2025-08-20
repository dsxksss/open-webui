<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	import Evaluations from '$lib/components/admin/Evaluations.svelte';
	import { WEBUI_BASE_URL } from '$lib/constants';

	onMount(() => {
		goto(WEBUI_BASE_URL + '/admin/evaluations/leaderboard');
	});
</script>

<Evaluations />
