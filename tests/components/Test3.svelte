<script>
import './CustomElement.js';

/**
 * @type {boolean}
 */
export let title;
</script>

<custom-element>
    Text
    {#if title}
        <h1 slot="children">Title</h1>
    {:else}
        <h2 slot="children">Subitle</h2>
    {/if}
    end
</custom-element>
