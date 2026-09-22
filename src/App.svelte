<script lang="ts">
  import { dashboardStore } from './lib/sheetData';
  import ScatterPlot from './lib/ScatterPlot.svelte';

  $: data = $dashboardStore;

  const colors = {
    writing: '#aa3bff',
    code: '#2563eb',
    data: '#059669',
  };

  function formatTime(date: Date | null): string {
    if (!date) return '—';
    return date.toLocaleTimeString();
  }
</script>

<main>
  <header>
    <h1>Gen AI Usage Perceptions</h1>
    <p class="subtitle">
      Add a response in <a href="https://tinyurl.com/y5ss6tck" target="_blank">https://tinyurl.com/y5ss6tck</a>
    </p>
    <div class="status">
      <span class="dot" class:live={!data.error}></span>
      {#if data.error}
        <span class="status-text error">Error: {data.error}</span>
      {:else}
        <span class="status-text">
          {data.responseCount} response{data.responseCount === 1 ? '' : 's'} · last updated {formatTime(
            data.lastUpdated
          )}
        </span>
      {/if}
    </div>
  </header>

  {#if data.loading && data.responseCount === 0 && !data.error}
    <p class="empty">Loading spreadsheet data…</p>
  {:else if data.responseCount === 0 && !data.error}
    <p class="empty">No responses yet.</p>
  {/if}

  <section class="grid">
    <ScatterPlot title="Writing" points={data.writing} color={colors.writing} />
    <ScatterPlot title="Code" points={data.code} color={colors.code} />
    <ScatterPlot title="Data" points={data.data} color={colors.data} />
  </section>
</main>

<style>
  main {
    max-width: 1100px;
    margin: 0 auto;
    padding: 24px 24px 64px;
  }
  header {
    margin-bottom: 24px;
  }
  h1 {
    margin: 0 0 8px;
    font-size: 32px;
  }
  .subtitle {
    color: var(--text);
    max-width: 640px;
  }
  .status {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #9ca3af;
  }
  .dot.live {
    background: #22c55e;
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6);
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5);
    }
    70% {
      box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
    }
  }
  .status-text {
    font-size: 13px;
    color: var(--text);
  }
  .status-text.error {
    color: #dc2626;
  }
  .empty {
    color: var(--text);
    font-style: italic;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }
</style>
