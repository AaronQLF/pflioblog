"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default function BlogContent({ content }: { content: string }) {
    return (
        <div className="prose prose-sm sm:prose dark:prose-invert max-w-none
      prose-headings:font-semibold prose-headings:tracking-tight
      prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
      prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
      prose-p:text-slate-700 dark:prose-p:text-zinc-300 prose-p:leading-relaxed
      prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
      prose-strong:text-black dark:prose-strong:text-white
      prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-blue-50 dark:prose-code:bg-blue-900/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.8em] prose-code:font-normal
      prose-pre:bg-zinc-900 prose-pre:text-zinc-100 prose-pre:rounded-xl prose-pre:p-5
      prose-blockquote:border-l-blue-400 prose-blockquote:text-slate-500 dark:prose-blockquote:text-zinc-400
      prose-li:text-slate-700 dark:prose-li:text-zinc-300
      prose-hr:border-slate-200 dark:prose-hr:border-zinc-700
    ">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
