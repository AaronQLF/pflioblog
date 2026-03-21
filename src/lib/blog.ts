import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    tags: string[];
    readingTime: number; // minutes
    content: string;
}

export type BlogPostMeta = Omit<BlogPost, 'content'>;

function getReadingTime(content: string): number {
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
}

export function getAllPostSlugs(): string[] {
    if (!fs.existsSync(BLOG_DIR)) return [];
    return fs
        .readdirSync(BLOG_DIR)
        .filter((f) => f.endsWith('.md'))
        .map((f) => f.replace(/\.md$/, ''));
}

export function getAllPosts(): BlogPostMeta[] {
    const slugs = getAllPostSlugs();
    return slugs
        .map((slug) => {
            const filePath = path.join(BLOG_DIR, `${slug}.md`);
            const raw = fs.readFileSync(filePath, 'utf-8');
            const { data, content } = matter(raw);
            return {
                slug,
                title: data.title ?? slug,
                date: data.date ?? '',
                excerpt: data.excerpt ?? '',
                tags: data.tags ?? [],
                readingTime: getReadingTime(content),
            };
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ── TF-IDF search index (computed at build time, serialized to client) ──

const STOP_WORDS = new Set([
    'a','an','the','and','or','but','in','on','at','to','for','of','with','by',
    'from','is','it','its','this','that','are','was','were','be','been','being',
    'have','has','had','do','does','did','will','would','shall','should','may',
    'might','must','can','could','not','no','nor','so','if','then','than','too',
    'very','just','about','above','after','again','all','also','am','any','as',
    'because','before','between','both','during','each','few','further','get',
    'got','he','her','here','him','his','how','i','into','me','more','most','my',
    'now','only','other','our','out','over','own','re','same','she','some','such',
    'them','there','these','they','through','under','until','up','us','we','what',
    'when','where','which','while','who','whom','why','you','your',
]);

function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

export interface TfIdfIndex {
    idf: Record<string, number>;
    docs: Record<string, Record<string, number>>;
}

export function buildSearchIndex(): TfIdfIndex {
    const slugs = getAllPostSlugs();
    const docTokens: Record<string, string[]> = {};
    const df: Record<string, number> = {};

    for (const slug of slugs) {
        const filePath = path.join(BLOG_DIR, `${slug}.md`);
        const raw = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(raw);

        const text = [
            data.title ?? '',
            data.title ?? '',
            data.excerpt ?? '',
            ...(data.tags ?? []),
            ...(data.tags ?? []),
            content,
        ].join(' ');

        const tokens = tokenize(text);
        docTokens[slug] = tokens;

        const unique = new Set(tokens);
        for (const term of unique) {
            df[term] = (df[term] ?? 0) + 1;
        }
    }

    const n = slugs.length;
    const idf: Record<string, number> = {};
    for (const [term, count] of Object.entries(df)) {
        idf[term] = Math.log(1 + n / count);
    }

    const docs: Record<string, Record<string, number>> = {};
    for (const [slug, tokens] of Object.entries(docTokens)) {
        const tf: Record<string, number> = {};
        for (const t of tokens) {
            tf[t] = (tf[t] ?? 0) + 1;
        }
        const maxTf = Math.max(...Object.values(tf));
        const vec: Record<string, number> = {};
        for (const [term, count] of Object.entries(tf)) {
            vec[term] = (0.5 + 0.5 * count / maxTf) * (idf[term] ?? 0);
        }
        docs[slug] = vec;
    }

    return { idf, docs };
}

export function getPostBySlug(slug: string): BlogPost | null {
    const filePath = path.join(BLOG_DIR, `${slug}.md`);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? '',
        excerpt: data.excerpt ?? '',
        tags: data.tags ?? [],
        readingTime: getReadingTime(content),
        content,
    };
}
