<script lang="ts">
  import '../app.css';
  import Toast from '$lib/components/Toast.svelte';
  import SupportChat from '$lib/components/SupportChat.svelte';
</script>

<slot />
<Toast />
<SupportChat />