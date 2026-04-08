"use client";

import dynamic from "next/dynamic";

const PostGalaxy3D = dynamic(() => import("./PostGalaxy3D"), {
    ssr: false,
    loading: () => (
        <div
            className="h-[min(72vh,580px)] w-full rounded-xl border border-[var(--color-border)] animate-pulse bg-[var(--color-surface)]"
            aria-hidden
        />
    ),
});

export default function PostGalaxy3DLoader() {
    return <PostGalaxy3D />;
}
