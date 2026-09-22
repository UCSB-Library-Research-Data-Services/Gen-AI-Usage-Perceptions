<script lang="ts">
  import type { Point } from './sheetData';

  export let title: string;
  export let points: Point[] = [];
  export let color: string = '#aa3bff';
  export let xMax: number = 7;
  export let yMax: number = 10;
  export let xLabel: string = 'Frequency of use';
  export let yLabel: string = 'Accuracy';

  const width = 340;
  const height = 320;
  const margin = { top: 16, right: 16, bottom: 56, left: 56 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  // Behavioral profiles split at the midpoint of each axis.
  const midX = xMax / 2;
  const midY = yMax / 2;
  $: midXpx = margin.left + (midX / xMax) * plotW;
  $: midYpx = margin.top + plotH - (midY / yMax) * plotH;

  const QUADRANTS = [
    { key: 'lowLow', name: 'Skeptics', match: (x: number, y: number) => x < midX && y < midY, fill: '#9ca3af' },
    { key: 'lowHigh', name: 'Untapped potential', match: (x: number, y: number) => x < midX && y >= midY, fill: '#2563eb' },
    { key: 'highLow', name: 'Risky reliance', match: (x: number, y: number) => x >= midX && y < midY, fill: '#dc2626' },
    { key: 'highHigh', name: 'Embedded Practice', match: (x: number, y: number) => x >= midX && y >= midY, fill: '#16a34a' },
  ];

  $: quadrantCounts = QUADRANTS.map((q) => ({
    ...q,
    count: points.filter((p) => q.match(p.x, p.y)).length,
  }));

  interface Bubble {
    key: string;
    x: number;
    y: number;
    count: number;
    cx: number;
    cy: number;
    r: number;
  }

  $: bubbles = aggregate(points);

  const MIN_R = 8;
  const MAX_R = 28;

  function aggregate(pts: Point[]): Bubble[] {
    const counts = new Map<string, { x: number; y: number; count: number }>();
    for (const p of pts) {
      const key = `${p.x}-${p.y}`;
      const existing = counts.get(key);
      if (existing) existing.count += 1;
      else counts.set(key, { x: p.x, y: p.y, count: 1 });
    }
    const entries = Array.from(counts.values());
    const maxCount = entries.reduce((max, v) => Math.max(max, v.count), 1);

    return entries.map((v) => ({
      key: `${v.x}-${v.y}`,
      x: v.x,
      y: v.y,
      count: v.count,
      cx: margin.left + (v.x / xMax) * plotW,
      cy: margin.top + plotH - (v.y / yMax) * plotH,
      // Radius scales relative to the busiest coordinate in this chart, so size always reflects share of answers.
      r: maxCount === 1 ? MIN_R : MIN_R + (MAX_R - MIN_R) * ((v.count - 1) / (maxCount - 1)),
    }));
  }

  $: xTicks = Array.from({ length: xMax + 1 }, (_, i) => i);
  $: yTicks = Array.from({ length: yMax / 2 + 1 }, (_, i) => i * 2);
</script>

<div class="chart-card">
  <h3 style="color: {color}">{title}</h3>
  <svg viewBox="0 0 {width} {height}" role="img" aria-label="{title} scatter plot">
    <!-- quadrant backgrounds -->
    <rect x={margin.left} y={margin.top} width={midXpx - margin.left} height={midYpx - margin.top} fill={quadrantCounts[1].fill} fill-opacity="0.06" />
    <rect x={midXpx} y={margin.top} width={margin.left + plotW - midXpx} height={midYpx - margin.top} fill={quadrantCounts[3].fill} fill-opacity="0.06" />
    <rect x={margin.left} y={midYpx} width={midXpx - margin.left} height={margin.top + plotH - midYpx} fill={quadrantCounts[0].fill} fill-opacity="0.06" />
    <rect x={midXpx} y={midYpx} width={margin.left + plotW - midXpx} height={margin.top + plotH - midYpx} fill={quadrantCounts[2].fill} fill-opacity="0.06" />

    <!-- quadrant dividers -->
    <line x1={midXpx} y1={margin.top} x2={midXpx} y2={margin.top + plotH} class="quadrant-divider" />
    <line x1={margin.left} y1={midYpx} x2={margin.left + plotW} y2={midYpx} class="quadrant-divider" />

    <!-- quadrant labels -->
    <text x={margin.left + 6} y={margin.top + 12} class="quadrant-label" fill={quadrantCounts[1].fill}>{quadrantCounts[1].name} ({quadrantCounts[1].count})</text>
    <text x={margin.left + plotW - 6} y={margin.top + 12} text-anchor="end" class="quadrant-label" fill={quadrantCounts[3].fill}>{quadrantCounts[3].name} ({quadrantCounts[3].count})</text>
    <text x={margin.left + 6} y={margin.top + plotH - 6} class="quadrant-label" fill={quadrantCounts[0].fill}>{quadrantCounts[0].name} ({quadrantCounts[0].count})</text>
    <text x={margin.left + plotW - 6} y={margin.top + plotH - 6} text-anchor="end" class="quadrant-label" fill={quadrantCounts[2].fill}>{quadrantCounts[2].name} ({quadrantCounts[2].count})</text>

    <!-- gridlines -->
    {#each xTicks as tick}
      <line
        x1={margin.left + (tick / xMax) * plotW}
        y1={margin.top}
        x2={margin.left + (tick / xMax) * plotW}
        y2={margin.top + plotH}
        class="grid-line"
      />
      <text
        x={margin.left + (tick / xMax) * plotW}
        y={margin.top + plotH + 16}
        class="tick-label"
        text-anchor="middle">{tick}</text
      >
    {/each}
    {#each yTicks as tick}
      <line
        x1={margin.left}
        y1={margin.top + plotH - (tick / yMax) * plotH}
        x2={margin.left + plotW}
        y2={margin.top + plotH - (tick / yMax) * plotH}
        class="grid-line"
      />
      <text
        x={margin.left - 8}
        y={margin.top + plotH - (tick / yMax) * plotH + 4}
        class="tick-label"
        text-anchor="end">{tick}</text
      >
    {/each}

    <!-- axes -->
    <line
      x1={margin.left}
      y1={margin.top + plotH}
      x2={margin.left + plotW}
      y2={margin.top + plotH}
      class="axis-line"
    />
    <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + plotH} class="axis-line" />

    <!-- data points -->
    {#each bubbles as b (b.key)}
      <circle cx={b.cx} cy={b.cy} r={b.r} fill={color} fill-opacity="0.55" stroke={color} stroke-width="1.5">
        <title>{b.count} response{b.count > 1 ? 's' : ''} at ({b.x}, {b.y})</title>
      </circle>
      {#if b.count > 1}
        <text x={b.cx} y={b.cy + 4} text-anchor="middle" class="bubble-label">{b.count}</text>
      {/if}
    {/each}

    <!-- axis titles -->
    <text x={margin.left + plotW / 2} y={height - 6} text-anchor="middle" class="axis-title">{xLabel}</text>
    <text
      x={14}
      y={margin.top + plotH / 2}
      text-anchor="middle"
      class="axis-title"
      transform="rotate(-90, 14, {margin.top + plotH / 2})">{yLabel}</text
    >
  </svg>
  <p class="count">{points.length} response{points.length === 1 ? '' : 's'}</p>
</div>

<style>
  .chart-card {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    box-shadow: var(--shadow);
  }
  h3 {
    margin: 0 0 8px;
    font-size: 18px;
  }
  svg {
    width: 100%;
    height: auto;
    display: block;
  }
  .grid-line {
    stroke: var(--border);
    stroke-width: 1;
  }
  .axis-line {
    stroke: var(--text);
    stroke-width: 1.5;
  }
  .tick-label {
    fill: var(--text);
    font-size: 10px;
  }
  .bubble-label {
    fill: var(--text-h);
    font-size: 10px;
    font-weight: 600;
    pointer-events: none;
  }
  circle {
    transition:
      cx 0.5s ease,
      cy 0.5s ease,
      r 0.5s ease,
      fill-opacity 0.5s ease;
  }
  .axis-title {
    fill: var(--text);
    font-size: 12px;
    font-weight: 500;
  }
  .quadrant-divider {
    stroke: var(--border);
    stroke-width: 1;
    stroke-dasharray: 4 4;
  }
  .quadrant-label {
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    opacity: 0.75;
  }
  .count {
    margin-top: 6px;
    font-size: 12px;
    color: var(--text);
    text-align: right;
  }
</style>
