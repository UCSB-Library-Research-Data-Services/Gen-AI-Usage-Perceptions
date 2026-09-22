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
      Submit Another Response: <a href="https://tinyurl.com/y5ss6tck" target="_blank">https://tinyurl.com/y5ss6tck</a>
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

  <footer>
    <a
      href="https://github.com/UCSB-Library-Research-Data-Services/Gen-AI-Usage-Perceptions"
      target="_blank"
      rel="noreferrer"
      aria-label="View source on GitHub"
    >
      <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path
          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
        />
      </svg>
      <span>Source code</span>
    </a>
    <span class="divider">·</span>
    <span>Built with Claude 5 &amp; Gemini 3.6 Flash</span>
  </footer>
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
  footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 40px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
    font-size: 12px;
    color: var(--text);
  }
  footer a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--text);
    text-decoration: none;
  }
  footer a:hover {
    color: var(--text-h);
  }
  footer .divider {
    opacity: 0.5;
  }
</style>
