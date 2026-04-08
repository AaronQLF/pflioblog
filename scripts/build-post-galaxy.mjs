/**
 * Build-time: local sentence embeddings (Xenova/all-MiniLM-L6-v2) + PCA → 3D coords.
 * Assigns each post a topic cluster with a color. Region centroids for labels.
 * Models cache under .cache/transformers (CI cache).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { pipeline, env } from '@xenova/transformers';
import { PCA } from 'ml-pca';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'content', 'blog');
const OUT_FILE = path.join(ROOT, 'src', 'generated', 'post-galaxy-3d.json');

const MODEL_ID = 'Xenova/all-MiniLM-L6-v2';
const MAX_BODY_CHARS = 8000;

env.cacheDir = path.join(ROOT, '.cache', 'transformers');

const PALETTE = [
    '#6ee7b7', // mint
    '#93c5fd', // blue
    '#fbbf24', // amber
    '#f87171', // coral
    '#c084fc', // purple
    '#67e8f9', // cyan
    '#fb923c', // orange
    '#f472b6', // pink
    '#a3e635', // lime
    '#fcd34d', // gold
];
const FALLBACK_COLOR = '#737373';

const SKIP_TAGS = new Set([
    'own exp', 'not technical', 'opinion',
]);
const OVERLY_BROAD_TAGS = new Set(['ai', 'research']);

function truncate(s, n) {
    if (s.length <= n) return s;
    return s.slice(0, n);
}

function buildDocText({ title, excerpt, content, tags }) {
    const tagStr = Array.isArray(tags) ? tags.join(' ') : '';
    const body = truncate(content.replace(/\s+/g, ' ').trim(), MAX_BODY_CHARS);
    return [title ?? '', excerpt ?? '', tagStr, body].filter(Boolean).join('\n\n');
}

function tensorRowsToMatrix(tensor) {
    const rows = tensor.dims[0];
    const cols = tensor.dims[1];
    const data = tensor.data;
    const mat = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        const o = i * cols;
        for (let j = 0; j < cols; j++) row.push(data[o + j]);
        mat.push(row);
    }
    return mat;
}

function computePcaScores(vectors) {
    const n = vectors.length;
    if (n === 0) return { coords: [], components: [] };
    if (n === 1) return { coords: [[0, 0, 0]], components: [] };

    const maxComp = Math.min(3, n - 1);
    const pca = new PCA(vectors, { center: true, scale: false });
    const projected = pca.predict(vectors, { nComponents: maxComp });
    const rows = projected.to2DArray();
    const explained = pca.getExplainedVariance();

    const coords = rows.map((row) => {
        const a = row[0] ?? 0;
        const b = row[1] ?? 0;
        const c = row[2] ?? 0;
        if (maxComp === 1) return [a, 0, 0];
        if (maxComp === 2) return [a, b, 0];
        return [a, b, c];
    });

    const axisNames = ['x', 'y', 'z'];
    const labels = ['PC1', 'PC2', 'PC3'];
    let cum = 0;
    const components = [];
    for (let i = 0; i < maxComp; i++) {
        const ev = explained[i] ?? 0;
        cum += ev;
        components.push({ id: labels[i], axis: axisNames[i], explainedVariance: ev, cumulativeVariance: cum });
    }
    return { coords, components };
}

function normalizeCoords(coords) {
    if (coords.length === 0) return [];
    const cx = coords.reduce((s, c) => s + c[0], 0) / coords.length;
    const cy = coords.reduce((s, c) => s + c[1], 0) / coords.length;
    const cz = coords.reduce((s, c) => s + c[2], 0) / coords.length;
    const centered = coords.map(([x, y, z]) => [x - cx, y - cy, z - cz]);
    let maxR = 0;
    for (const [x, y, z] of centered) maxR = Math.max(maxR, Math.hypot(x, y, z));
    const s = maxR > 1e-9 ? 5 / maxR : 1;
    return centered.map(([x, y, z]) => [x * s, y * s, z * s]);
}

/**
 * Build tag frequency, assign each post a "primary cluster" (most specific
 * non-generic tag), then assign colors and build region centroids.
 */
function buildClusters(items, coords) {
    const tagFreq = new Map();
    for (const item of items) {
        for (const raw of item.tags) {
            const key = raw.toLowerCase();
            if (SKIP_TAGS.has(key)) continue;
            tagFreq.set(key, (tagFreq.get(key) ?? 0) + 1);
        }
    }

    const canonicalLabel = new Map();
    for (const item of items) {
        for (const t of item.tags) {
            const key = t.toLowerCase();
            if (!canonicalLabel.has(key)) canonicalLabel.set(key, t);
        }
    }

    for (const item of items) {
        const candidates = item.tags
            .map((t) => ({ key: t.toLowerCase() }))
            .filter(({ key }) => !SKIP_TAGS.has(key));

        const meaningful = candidates
            .filter(({ key }) => !OVERLY_BROAD_TAGS.has(key) && (tagFreq.get(key) ?? 0) >= 2)
            .sort((a, b) => (tagFreq.get(b.key) ?? 0) - (tagFreq.get(a.key) ?? 0));

        if (meaningful.length > 0) {
            item.cluster = canonicalLabel.get(meaningful[0].key);
        } else {
            const any = candidates
                .filter(({ key }) => (tagFreq.get(key) ?? 0) >= 2)
                .sort((a, b) => (tagFreq.get(b.key) ?? 0) - (tagFreq.get(a.key) ?? 0));
            item.cluster = any.length > 0 ? canonicalLabel.get(any[0].key) : (canonicalLabel.get(candidates[0]?.key) ?? 'Other');
        }
    }

    const clusterPosts = new Map();
    for (let i = 0; i < items.length; i++) {
        const c = items[i].cluster;
        if (!clusterPosts.has(c)) clusterPosts.set(c, []);
        clusterPosts.get(c).push(i);
    }

    const sorted = [...clusterPosts.entries()].sort((a, b) => b[1].length - a[1].length);

    const clusterColor = new Map();
    let ci = 0;
    for (const [name, indices] of sorted) {
        if (indices.length >= 2 && ci < PALETTE.length) {
            clusterColor.set(name, PALETTE[ci++]);
        } else {
            clusterColor.set(name, FALLBACK_COLOR);
        }
    }

    for (const item of items) {
        item.color = clusterColor.get(item.cluster) ?? FALLBACK_COLOR;
    }

    const MIN_DIST = 1.6;
    const MAX_REGIONS = 8;
    const regions = [];
    for (const [name, indices] of sorted) {
        if (indices.length < 2) continue;
        if (regions.length >= MAX_REGIONS) break;
        const cx = indices.reduce((s, i) => s + coords[i][0], 0) / indices.length;
        const cy = indices.reduce((s, i) => s + coords[i][1], 0) / indices.length;
        const cz = indices.reduce((s, i) => s + coords[i][2], 0) / indices.length;
        const tooClose = regions.some((r) => Math.hypot(r.x - cx, r.y - cy, r.z - cz) < MIN_DIST);
        if (tooClose) continue;
        regions.push({
            label: name,
            color: clusterColor.get(name),
            count: indices.length,
            x: cx, y: cy, z: cz,
        });
    }

    const legend = sorted
        .filter(([, indices]) => indices.length >= 2)
        .slice(0, PALETTE.length)
        .map(([name, indices]) => ({
            label: name,
            color: clusterColor.get(name),
            count: indices.length,
        }));

    return { regions, legend };
}

async function main() {
    if (!fs.existsSync(BLOG_DIR)) {
        console.error('Missing content/blog');
        process.exit(1);
    }

    const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));

    const items = files.map((f) => {
        const slug = f.replace(/\.md$/, '');
        const raw = fs.readFileSync(path.join(BLOG_DIR, f), 'utf-8');
        const { data, content } = matter(raw);
        const text = buildDocText({
            title: data.title, excerpt: data.excerpt, content, tags: data.tags,
        });
        const tags = (data.tags ?? []).map((t) => t.trim());
        return { slug, title: data.title ?? slug, date: data.date ?? '', tags, text };
    });

    if (items.length === 0) {
        console.error('No posts found.');
        process.exit(1);
    }

    console.log(`Embedding ${items.length} posts with ${MODEL_ID}…`);

    const extractor = await pipeline('feature-extraction', MODEL_ID);
    const texts = items.map((i) => i.text);
    const tensor = await extractor(texts, { pooling: 'mean', normalize: true });
    const vectors = tensorRowsToMatrix(tensor);

    const { coords: raw3d, components } = computePcaScores(vectors);
    const coords = normalizeCoords(raw3d);
    const { regions, legend } = buildClusters(items, coords);

    console.log(`  ${regions.length} regions, ${legend.length} legend entries`);

    const points = items.map((item, idx) => ({
        slug: item.slug,
        title: item.title,
        date: item.date,
        tags: item.tags,
        cluster: item.cluster,
        color: item.color,
        x: coords[idx][0],
        y: coords[idx][1],
        z: coords[idx][2],
    }));

    const payload = {
        model: MODEL_ID,
        reduction: 'pca-3-center-scale',
        generatedAt: new Date().toISOString(),
        axes: { components },
        regions,
        legend,
        points,
    };

    const outDir = path.dirname(OUT_FILE);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    console.log(`Wrote ${OUT_FILE}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
