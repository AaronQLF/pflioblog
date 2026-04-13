"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function resolveImgSrc(src: string | undefined): string | undefined {
    if (!src || !basePath) return src;
    if (src.startsWith('/') && !src.startsWith(basePath)) return `${basePath}${src}`;
    return src;
}

export default function BlogContent({ content }: { content: string }) {
    return (
        <div className="prose sm:prose-lg dark:prose-invert max-w-none
          prose-headings:font-serif prose-headings:font-normal prose-headings:tracking-normal
          prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-[#1a1a1a] dark:prose-p:text-[#d4cfc8] prose-p:leading-[1.75]
          prose-a:text-[var(--color-accent)] prose-a:no-underline hover:prose-a:underline
          prose-strong:text-[#1a1a1a] dark:prose-strong:text-[#e8e4df]
          prose-code:text-[var(--color-accent)] prose-code:bg-[var(--color-code-bg)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.85em] prose-code:font-mono prose-code:font-normal
          prose-pre:bg-[#1a1a1a] dark:prose-pre:bg-[#252220] prose-pre:text-[#d4cfc8] prose-pre:rounded-lg prose-pre:p-5
          prose-blockquote:border-l-[var(--color-accent)] prose-blockquote:text-[var(--color-muted)] prose-blockquote:italic prose-blockquote:not-italic
          prose-li:text-[#1a1a1a] dark:prose-li:text-[#d4cfc8]
          prose-hr:border-[var(--color-border)]
          prose-img:rounded-lg prose-img:mx-auto
        ">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    img: ({src, ...props}) => (
                        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                        <img
                            className="rounded-lg mx-auto my-8 border border-[var(--color-border)]"
                            loading="lazy"
                            src={resolveImgSrc(src)}
                            {...props}
                        />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
