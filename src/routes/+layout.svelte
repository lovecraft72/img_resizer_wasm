<script>
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";

  let { children } = $props();
  export const prerender = false;
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
