import * as THREE from "three";
import type { Book } from "@/data/books";

const SERIF = 'Georgia, "Times New Roman", serif';
const MONO = '"IBM Plex Mono", "SF Mono", ui-monospace, monospace';

/** Deterministic per-book RNG so a cover looks the same on every load. */
function seeded(id: string) {
    let h = 2166136261;
    for (const ch of id) {
        h ^= ch.charCodeAt(0);
        h = Math.imul(h, 16777619);
    }
    return () => {
        h += 1831565813;
        let t = h;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function wrap(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines = 6,
): number {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
        const next = line ? `${line} ${word}` : word;
        if (ctx.measureText(next).width > maxWidth && line) {
            lines.push(line);
            line = word;
        } else {
            line = next;
        }
    }
    if (line) lines.push(line);
    lines.slice(0, maxLines).forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
    return Math.min(lines.length, maxLines);
}

/** Foil ornament, drawn in the accent colour. Keeps each cover distinct. */
function drawMotif(ctx: CanvasRenderingContext2D, book: Book, w: number, h: number) {
    const rand = seeded(book.id);
    ctx.save();
    ctx.strokeStyle = book.accent;
    ctx.fillStyle = book.accent;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 3;

    const cx = w / 2;
    const cy = h * 0.47;

    switch (book.motif) {
        case "grid": {
            const n = 6;
            const cell = w * 0.44 / n;
            const ox = cx - (cell * n) / 2;
            const oy = cy - (cell * n) / 2;
            for (let i = 0; i <= n; i++) {
                ctx.beginPath();
                ctx.moveTo(ox + i * cell, oy);
                ctx.lineTo(ox + i * cell, oy + n * cell);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(ox, oy + i * cell);
                ctx.lineTo(ox + n * cell, oy + i * cell);
                ctx.stroke();
            }
            ctx.globalAlpha = 0.9;
            for (let i = 0; i < 5; i++) {
                const gx = Math.floor(rand() * n);
                const gy = Math.floor(rand() * n);
                ctx.fillRect(ox + gx * cell + 3, oy + gy * cell + 3, cell - 6, cell - 6);
            }
            break;
        }
        case "wave": {
            for (let k = 0; k < 5; k++) {
                const amp = h * (0.03 + rand() * 0.05);
                const freq = 1.2 + rand() * 2.4;
                const phase = rand() * Math.PI * 2;
                const yBase = cy - h * 0.13 + k * h * 0.06;
                ctx.globalAlpha = 0.28 + k * 0.12;
                ctx.beginPath();
                for (let x = w * 0.16; x <= w * 0.84; x += 4) {
                    const t = (x - w * 0.16) / (w * 0.68);
                    const y = yBase + Math.sin(t * Math.PI * 2 * freq + phase) * amp;
                    if (x === w * 0.16) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
            break;
        }
        case "orbit": {
            const r0 = w * 0.1;
            for (let k = 0; k < 4; k++) {
                const r = r0 + k * w * 0.055;
                ctx.globalAlpha = 0.3 + k * 0.12;
                ctx.beginPath();
                ctx.ellipse(cx, cy, r, r * (0.42 + rand() * 0.3), rand() * Math.PI, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, w * 0.022, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
        case "bars": {
            const n = 9;
            const bw = (w * 0.5) / n;
            const ox = cx - (bw * n) / 2;
            for (let i = 0; i < n; i++) {
                const bh = h * (0.04 + rand() * 0.22);
                ctx.globalAlpha = 0.45 + rand() * 0.5;
                ctx.fillRect(ox + i * bw + 2, cy + h * 0.12 - bh, bw - 4, bh);
            }
            break;
        }
        case "arc": {
            for (let k = 0; k < 7; k++) {
                ctx.globalAlpha = 0.22 + k * 0.1;
                ctx.beginPath();
                ctx.arc(cx, cy + h * 0.1, w * (0.08 + k * 0.035), Math.PI, Math.PI * 2);
                ctx.stroke();
            }
            break;
        }
        case "field": {
            for (let i = 0; i < 90; i++) {
                const x = w * 0.16 + rand() * w * 0.68;
                const y = cy - h * 0.16 + rand() * h * 0.32;
                const r = 1.5 + rand() * 5;
                ctx.globalAlpha = 0.2 + rand() * 0.6;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        }
    }
    ctx.restore();
}

function canvas(w: number, h: number) {
    const el = document.createElement("canvas");
    el.width = w;
    el.height = h;
    return { el, ctx: el.getContext("2d")! };
}

function drawFront(book: Book) {
    const W = 720;
    const H = Math.round(W / book.coverAspect);
    const { el, ctx } = canvas(W, H);

    ctx.fillStyle = book.cover;
    ctx.fillRect(0, 0, W, H);

    // Cloth grain.
    const rand = seeded(`${book.id}-grain`);
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 2200; i++) {
        ctx.fillStyle = rand() > 0.5 ? "#ffffff" : "#000000";
        ctx.fillRect(rand() * W, rand() * H, 1.6, 1.6);
    }
    ctx.globalAlpha = 1;

    // Blind-stamped border.
    ctx.strokeStyle = book.accent;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 2;
    ctx.strokeRect(W * 0.055, H * 0.04, W * 0.89, H * 0.92);
    ctx.globalAlpha = 1;

    drawMotif(ctx, book, W, H);

    // Foil rules bracketing the title block.
    ctx.fillStyle = book.accent;
    ctx.fillRect(W * 0.1, H * 0.135, W * 0.8, 4);

    ctx.fillStyle = book.ink;
    ctx.textBaseline = "top";
    ctx.font = `600 ${Math.round(W * 0.082)}px ${SERIF}`;
    const lines = wrap(ctx, book.title, W * 0.1, H * 0.175, W * 0.8, W * 0.095, 4);

    ctx.font = `${Math.round(W * 0.036)}px ${MONO}`;
    ctx.globalAlpha = 0.78;
    ctx.fillText(book.author.toUpperCase(), W * 0.1, H * 0.175 + lines * W * 0.095 + W * 0.03);
    ctx.globalAlpha = 1;

    // Publisher block at the foot.
    ctx.fillStyle = book.accent;
    ctx.fillRect(W * 0.1, H * 0.895, W * 0.16, 3);
    ctx.fillStyle = book.ink;
    ctx.globalAlpha = 0.6;
    ctx.font = `${Math.round(W * 0.03)}px ${MONO}`;
    ctx.fillText(String(book.year), W * 0.1, H * 0.915);
    ctx.restore();

    return el;
}

function drawSpine(book: Book) {
    const W = 200;
    const H = 1100;
    const { el, ctx } = canvas(W, H);

    ctx.fillStyle = book.cover;
    ctx.fillRect(0, 0, W, H);

    const rand = seeded(`${book.id}-spine`);
    ctx.globalAlpha = 0.06;
    for (let i = 0; i < 900; i++) {
        ctx.fillStyle = rand() > 0.5 ? "#ffffff" : "#000000";
        ctx.fillRect(rand() * W, rand() * H, 1.6, 1.6);
    }
    ctx.globalAlpha = 1;

    // Head and tail bands.
    ctx.fillStyle = book.accent;
    ctx.fillRect(W * 0.16, H * 0.055, W * 0.68, 5);
    ctx.fillRect(W * 0.16, H * 0.075, W * 0.68, 2);
    ctx.fillRect(W * 0.16, H * 0.9, W * 0.68, 5);
    ctx.fillRect(W * 0.16, H * 0.882, W * 0.68, 2);

    // Title runs bottom-to-top, the way a spine reads on a shelf.
    ctx.save();
    ctx.translate(W / 2, H * 0.86);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = book.ink;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.font = `600 ${Math.round(W * 0.4)}px ${SERIF}`;
    const title =
        book.shortTitle.length > 26 ? `${book.shortTitle.slice(0, 24)}…` : book.shortTitle;
    ctx.fillText(title, 0, 0);

    ctx.globalAlpha = 0.7;
    ctx.font = `${Math.round(W * 0.2)}px ${MONO}`;
    ctx.fillText(book.author.toUpperCase(), H * 0.58, 0);
    ctx.restore();

    return el;
}

function drawBack(book: Book) {
    const W = 720;
    const H = Math.round(W / book.coverAspect);
    const { el, ctx } = canvas(W, H);

    ctx.fillStyle = book.cover;
    ctx.fillRect(0, 0, W, H);

    const rand = seeded(`${book.id}-back`);
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 1800; i++) {
        ctx.fillStyle = rand() > 0.5 ? "#ffffff" : "#000000";
        ctx.fillRect(rand() * W, rand() * H, 1.6, 1.6);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = book.ink;
    ctx.textBaseline = "top";
    ctx.globalAlpha = 0.82;
    ctx.font = `${Math.round(W * 0.037)}px ${SERIF}`;
    wrap(ctx, book.description, W * 0.12, H * 0.12, W * 0.76, W * 0.056, 9);
    ctx.globalAlpha = 1;

    // Barcode block, because every back cover has one.
    const bx = W * 0.12;
    const by = H * 0.83;
    ctx.fillStyle = "#f4f1e8";
    ctx.fillRect(bx, by, W * 0.28, H * 0.075);
    ctx.fillStyle = "#1a1a1a";
    let x = bx + 8;
    while (x < bx + W * 0.28 - 8) {
        const bw = 1 + Math.floor(rand() * 4);
        ctx.fillRect(x, by + 6, bw, H * 0.075 - 12);
        x += bw + 2 + Math.floor(rand() * 4);
    }

    return el;
}

function toTexture(source: HTMLCanvasElement, anisotropy: number) {
    const tex = new THREE.CanvasTexture(source);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = anisotropy;
    tex.needsUpdate = true;
    return tex;
}

export interface BookTextures {
    front: THREE.CanvasTexture;
    spine: THREE.CanvasTexture;
    back: THREE.CanvasTexture;
}

export function buildTextures(book: Book, anisotropy: number): BookTextures {
    return {
        front: toTexture(drawFront(book), anisotropy),
        spine: toTexture(drawSpine(book), Math.min(anisotropy, 4)),
        back: toTexture(drawBack(book), Math.min(anisotropy, 4)),
    };
}
