<script lang="ts">
	import "@slick-kit/theme";
	import { Toast, toast } from '@slick-kit/toast';
	let { children } = $props()

const modules = import.meta.glob('$routes/**', { eager: true });

const folderNames = Object.keys(modules).map((path) => {
  const segments = path.split('/');
  return segments.slice(0, -1).join('/');
});

const uniqueFolderNames = [...new Set(folderNames)];

const transformedArray = uniqueFolderNames
  .map((folderName) => {
    const segments = folderName.split("/");
    const name = segments[segments.length - 1]
      .replace(/[-_]/g, " ")
      .replace(/\[.*?\]/g, "")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
		const link = "/" + segments.slice(2).join("/");
    return { name, link };
  })
  .filter((item) => item.name !== "(app)" && item.name !== "(site)")
	.filter((item) => !item.link.includes("["));

console.log(transformedArray);
</script>

<!-- If you would like to use the same layout in app and site, use this file -->
{@render children()}

<!--  
	SickToast -> just use any of these methods
	<button onclick={() => toast.send('Test Toast', {duration: 5000})}>Test Toast</button>
<button onclick={() => toast.warning('Test Toast')}>Test Toast</button>
<button onclick={() => toast.error('Test Toast')}>Test Toast</button>
<button onclick={() => toast.success('Test Toast')}>Test Toast</button>
<button onclick={() => toast.info('Test Toast')}>Test Toast</button>
-->
<Toast position={{ inline: 'end', block: 'end' }} offset={{ inline: '20px', block: '20px' }} />
