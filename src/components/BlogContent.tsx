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
          prose-p:text-[var(--color-fg)] prose-p:leading-[1.75]
          prose-a:text-[var(--color-accent)] prose-a:no-underline hover:prose-a:underline
          prose-strong:text-[var(--color-fg)]
          prose-code:text-[var(--color-accent)] prose-code:bg-[var(--color-code-bg)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.85em] prose-code:font-mono prose-code:font-normal
          prose-pre:code:bg-transparent prose-pre:code:p-0 prose-pre:code:text-inherit prose-pre:code:font-mono
          prose-blockquote:border-l-4 prose-blockquote:border-[var(--color-accent)] prose-blockquote:bg-[var(--color-surface-hover)] prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-blockquote:text-[var(--color-muted)] prose-blockquote:italic
          prose-li:text-[var(--color-fg)]
          prose-hr:border-[var(--color-border)]
        ">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    img: ({src, ...props}) => (
                        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                        <img
                            className="rounded-lg mx-auto my-8 border border-[var(--color-border)] shadow-md"
                            loading="lazy"
                            src={resolveImgSrc(src)}
                            {...props}
                        />
                    ),
                    pre: ({children, ...props}) => (
                        <div className="my-6 rounded-xl border border-[var(--color-border)] overflow-hidden shadow-md">
                            <div className="bg-[#1f242c] dark:bg-[#161b22] px-4 py-2 flex items-center justify-between border-b border-gray-700/50 select-none">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                                </div>
                                <span className="font-mono text-[11px] text-gray-400">terminal.sh</span>
                                <div className="w-10" />
                            </div>
                            <pre className="!bg-[#161b22] !text-[#f0f6fc] !m-0 !p-4 !rounded-none overflow-x-auto text-sm [&_code]:!bg-transparent [&_code]:!p-0 [&_code]:!text-inherit [&_code]:!border-none" {...props}>
                                {children}
                            </pre>
                        </div>
                    )
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
