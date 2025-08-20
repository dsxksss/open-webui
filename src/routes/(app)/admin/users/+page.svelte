<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { WEBUI_BASE_URL } from '$lib/constants';

	import Users from '$lib/components/admin/Users.svelte';

	onMount(() => {
		goto(WEBUI_BASE_URL + '/admin/users/overview');
	});
</script>

<Users />
