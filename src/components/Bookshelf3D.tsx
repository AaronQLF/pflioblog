"use client";

import {
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type MutableRefObject,
    type RefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, RoundedBox } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { useTheme } from "@/context/ThemeContext";
import { BOOKS, type Book } from "@/data/books";
import { buildTextures, type BookTextures } from "@/lib/bookCovers";

const SHELF_Y = 0.34;
const GAP = 0.045;
const SHELVED_Z = -0.64;
const PRESENTED_Z = 0.52;
const BROWSE_POS = new THREE.Vector3(0, 1.42, 6.65);
const BROWSE_TARGET = new THREE.Vector3(0, 1.28, 0.15);
/** The inspect panel takes the right of the frame, so the book slides left. */
const FOCUS_SHIFT = -0.95;

interface Slot {
    book: Book;
    index: number;
    x: number;
    coverWidth: number;
}

const smooth = (t: number) => {
    const c = THREE.MathUtils.clamp(t, 0, 1);
    return c * c * (3 - 2 * c);
};

function buildSlots(): Slot[] {
    let cursor = 0;
    return BOOKS.map((book, index) => {
        cursor += book.thickness * 0.5;
        const slot: Slot = {
            book,
            index,
            x: cursor,
            coverWidth: THREE.MathUtils.clamp(book.height * book.coverAspect, 1.05, 1.85),
        };
        cursor += book.thickness * 0.5 + GAP;
        return slot;
    });
}

interface Palette {
    hemiSky: string;
    hemiGround: string;
    hemiIntensity: number;
    key: string;
    keyIntensity: number;
    rim: string;
    rimIntensity: number;
    bounce: string;
    shelf: string;
    shadow: number;
}

const PALETTES: Record<"light" | "dark", Palette> = {
    light: {
        hemiSky: "#ffffff",
        hemiGround: "#8a7a6a",
        hemiIntensity: 2.3,
        key: "#fff6e7",
        keyIntensity: 3.4,
        rim: "#c8d5e5",
        rimIntensity: 1.7,
        bounce: "#d79b72",
        shelf: "#ded5bf",
        shadow: 0.28,
    },
    dark: {
        hemiSky: "#9aa0ad",
        hemiGround: "#232220",
        hemiIntensity: 1.5,
        key: "#e8dcc8",
        keyIntensity: 2.6,
        rim: "#5a6a85",
        rimIntensity: 1.6,
        bounce: "#d4764a",
        shelf: "#26302a",
        shadow: 0.5,
    },
};

function Volume({
    slot,
    textures,
    scrollRef,
    focusRef,
    onPick,
}: {
    slot: Slot;
    textures: BookTextures;
    scrollRef: MutableRefObject<number>;
    focusRef: MutableRefObject<number>;
    onPick: (index: number) => void;
}) {
    const presentation = useRef<THREE.Group>(null);
    const { book, coverWidth } = slot;
    const t = book.thickness;

    useFrame(() => {
        const g = presentation.current;
        if (!g) return;

        // How "presented" this volume is: 1 when it is the one out front.
        const p = THREE.MathUtils.clamp(1 - Math.abs(scrollRef.current - slot.index), 0, 1);
        const out = smooth(Math.min(1, p * 1.55));
        // The turn only starts once the volume is clear of its neighbours.
        const turn = smooth((p - 0.5) / 0.5);
        const focus = focusRef.current * p;

        g.position.z = THREE.MathUtils.lerp(SHELVED_Z, PRESENTED_Z, out) + focus * 0.5;
        g.position.y = out * 0.05 + focus * 0.06;
        g.rotation.y = THREE.MathUtils.lerp(Math.PI / 2, 0, turn);
        g.scale.setScalar(1 + out * 0.035 + focus * 0.12);
    });

    const cloth = { color: book.cover, roughness: 0.78, metalness: 0.02 };

    return (
        <group position={[slot.x, SHELF_Y + book.height / 2, 0.04]}>
            <group
                ref={presentation}
                rotation={[0, Math.PI / 2, 0]}
                position={[0, 0, SHELVED_Z]}
            >
                {/* Page block */}
                <RoundedBox
                    args={[coverWidth - 0.075, book.height - 0.105, Math.max(0.08, t - 0.052)]}
                    radius={0.016}
                    smoothness={3}
                    castShadow
                >
                    <meshStandardMaterial color="#e9dfca" roughness={0.9} />
                </RoundedBox>

                {/* Boards */}
                <RoundedBox
                    args={[coverWidth, book.height, 0.034]}
                    radius={0.014}
                    smoothness={3}
                    position={[0, 0, t * 0.5]}
                    castShadow
                >
                    <meshStandardMaterial {...cloth} />
                </RoundedBox>
                <RoundedBox
                    args={[coverWidth, book.height, 0.034]}
                    radius={0.014}
                    smoothness={3}
                    position={[0, 0, -t * 0.5]}
                    castShadow
                >
                    <meshStandardMaterial {...cloth} />
                </RoundedBox>

                {/* Rounded spine */}
                <RoundedBox
                    args={[0.055, book.height - 0.01, t + 0.012]}
                    radius={0.017}
                    smoothness={3}
                    position={[-coverWidth * 0.5 + 0.022, 0, 0]}
                    castShadow
                >
                    <meshStandardMaterial {...cloth} />
                </RoundedBox>

                {/* Printed surfaces */}
                <mesh position={[0, 0, t * 0.5 + 0.019]}>
                    <planeGeometry args={[coverWidth - 0.065, book.height - 0.065]} />
                    <meshStandardMaterial map={textures.front} roughness={0.66} metalness={0.02} />
                </mesh>
                <mesh position={[0, 0, -t * 0.5 - 0.019]} rotation={[0, Math.PI, 0]}>
                    <planeGeometry args={[coverWidth - 0.065, book.height - 0.065]} />
                    <meshStandardMaterial map={textures.back} roughness={0.74} />
                </mesh>
                <mesh position={[-coverWidth * 0.5 - 0.012, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
                    <planeGeometry args={[t - 0.02, book.height - 0.04]} />
                    <meshStandardMaterial map={textures.spine} roughness={0.7} />
                </mesh>

                {/* Invisible pick proxy, slightly larger than the volume */}
                <mesh
                    visible={false}
                    onClick={(e) => {
                        e.stopPropagation();
                        onPick(slot.index);
                    }}
                    onPointerOver={(e) => {
                        e.stopPropagation();
                        document.body.style.cursor = "pointer";
                    }}
                    onPointerOut={() => {
                        document.body.style.cursor = "";
                    }}
                >
                    <boxGeometry args={[coverWidth, book.height, t + 0.07]} />
                </mesh>
            </group>
        </group>
    );
}

function Scene({
    slots,
    textures,
    scrollRef,
    targetRef,
    focusRef,
    focused,
    onPick,
    palette,
}: {
    slots: Slot[];
    textures: BookTextures[];
    scrollRef: MutableRefObject<number>;
    targetRef: MutableRefObject<number>;
    focusRef: MutableRefObject<number>;
    focused: boolean;
    onPick: (index: number) => void;
    palette: Palette;
}) {
    const run = useRef<THREE.Group>(null);
    const controls = useRef<OrbitControlsImpl>(null);
    const { camera, size } = useThree();
    const [orbiting, setOrbiting] = useState(false);

    const focusPos = useRef(new THREE.Vector3());
    const focusTarget = useRef(new THREE.Vector3());
    const browsePos = useRef(new THREE.Vector3());

    const span = slots[slots.length - 1].x + 1;

    useFrame((_, delta) => {
        const d = Math.min(delta, 0.05);
        const k = 1 - Math.pow(0.0016, d);

        scrollRef.current += (targetRef.current - scrollRef.current) * k;
        focusRef.current += ((focused ? 1 : 0) - focusRef.current) * k;

        // Slide the run so the presented volume sits at centre stage.
        const s = THREE.MathUtils.clamp(scrollRef.current, 0, slots.length - 1);
        const i0 = Math.floor(s);
        const i1 = Math.min(slots.length - 1, i0 + 1);
        const x = THREE.MathUtils.lerp(slots[i0].x, slots[i1].x, s - i0);
        const shift = focusRef.current * FOCUS_SHIFT;
        if (run.current) run.current.position.x = -x + shift;

        const bookY = SHELF_Y + slots[Math.round(s)].book.height / 2;
        focusTarget.current.set(shift, bookY, 0.2);
        focusPos.current.set(shift, bookY + 0.05, 3.35);

        if (focused) {
            if (orbiting) return;
            camera.position.lerp(focusPos.current, k);
            if (controls.current) {
                controls.current.target.lerp(focusTarget.current, k);
                controls.current.update();
            }
            if (camera.position.distanceTo(focusPos.current) < 0.04) setOrbiting(true);
            return;
        }

        if (orbiting) setOrbiting(false);
        // Narrow viewports need more distance to keep a volume framed.
        const aspect = size.width / Math.max(size.height, 1);
        const pull = THREE.MathUtils.clamp(1.55 / aspect, 1, 1.9);
        browsePos.current.set(BROWSE_POS.x, BROWSE_POS.y, BROWSE_POS.z * pull);
        camera.position.lerp(browsePos.current, k);
        camera.lookAt(BROWSE_TARGET);
        if (controls.current) controls.current.target.copy(BROWSE_TARGET);
    });

    return (
        <>
            <hemisphereLight
                intensity={palette.hemiIntensity}
                color={palette.hemiSky}
                groundColor={palette.hemiGround}
            />
            <directionalLight
                position={[-4.2, 7.4, 5.5]}
                intensity={palette.keyIntensity}
                color={palette.key}
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-bias={-0.0005}
            />
            <directionalLight
                position={[5, 3, -4]}
                intensity={palette.rimIntensity}
                color={palette.rim}
            />
            <pointLight
                position={[-3, 0.4, 3.2]}
                intensity={6}
                distance={10}
                decay={2}
                color={palette.bounce}
            />

            <group ref={run}>
                {/* Shelf board, running well past both ends of the collection */}
                <mesh position={[span / 2, SHELF_Y - 0.04, -0.12]} receiveShadow>
                    <boxGeometry args={[span + 8, 0.08, 1.9]} />
                    <meshStandardMaterial color={palette.shelf} roughness={0.94} />
                </mesh>

                {slots.map((slot, i) => (
                    <Volume
                        key={slot.book.id}
                        slot={slot}
                        textures={textures[i]}
                        scrollRef={scrollRef}
                        focusRef={focusRef}
                        onPick={onPick}
                    />
                ))}
            </group>

            <ContactShadows
                position={[0, SHELF_Y + 0.006, 0]}
                opacity={palette.shadow}
                scale={24}
                blur={2.6}
                far={2.2}
                resolution={512}
            />

            <OrbitControls
                ref={controls}
                enabled={focused && orbiting}
                enableDamping
                dampingFactor={0.075}
                enablePan={false}
                minDistance={2.4}
                maxDistance={6.5}
                minPolarAngle={Math.PI * 0.22}
                maxPolarAngle={Math.PI * 0.78}
            />
        </>
    );
}

/** Textures need a renderer for anisotropy, so they are built inside the Canvas. */
function SceneWithTextures(
    props: Omit<Parameters<typeof Scene>[0], "textures"> & { slots: Slot[] },
) {
    const gl = useThree((s) => s.gl);
    const textures = useMemo(() => {
        const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
        return props.slots.map((s) => buildTextures(s.book, aniso));
    }, [gl, props.slots]);

    useEffect(
        () => () => {
            for (const set of textures) {
                set.front.dispose();
                set.spine.dispose();
                set.back.dispose();
            }
        },
        [textures],
    );

    return <Scene {...props} textures={textures} />;
}

export default function Bookshelf3D() {
    const { theme } = useTheme();
    const slots = useMemo(buildSlots, []);
    const palette = PALETTES[theme === "dark" ? "dark" : "light"];

    const [index, setIndex] = useState(0);
    const [focused, setFocused] = useState(false);
    const scrollRef = useRef(0);
    const targetRef = useRef(0);
    const focusRef = useRef(0);
    const wrapRef = useRef<HTMLDivElement>(null);
    const drag = useRef({ active: false, id: -1, lastX: 0, travel: 0 });

    const go = useCallback((next: number) => {
        const clamped = THREE.MathUtils.clamp(next, 0, BOOKS.length - 1);
        targetRef.current = clamped;
        setIndex(Math.round(clamped));
    }, []);

    const onPick = useCallback(
        (i: number) => {
            if (drag.current.travel > 7) return;
            if (i === Math.round(targetRef.current)) setFocused(true);
            else go(i);
        },
        [go],
    );

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && focused) {
                setFocused(false);
                return;
            }
            if (focused) return;
            const active = document.activeElement;
            if (active && active !== document.body && !wrapRef.current?.contains(active)) return;
            if (e.key === "ArrowRight") go(Math.round(targetRef.current) + 1);
            if (e.key === "ArrowLeft") go(Math.round(targetRef.current) - 1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [focused, go]);

    const onPointerDown = (e: React.PointerEvent) => {
        if (focused) return;
        drag.current = { active: true, id: e.pointerId, lastX: e.clientX, travel: 0 };
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (focused || !drag.current.active || e.pointerId !== drag.current.id) return;
        const dx = e.clientX - drag.current.lastX;
        drag.current.lastX = e.clientX;
        drag.current.travel += Math.abs(dx);
        const width = wrapRef.current?.clientWidth ?? 800;
        go(targetRef.current - dx / Math.max(105, width * 0.11));
    };

    const endDrag = () => {
        if (!drag.current.active) return;
        drag.current.active = false;
        go(Math.round(targetRef.current));
        // Let the click handler see the travel, then reset on the next tick.
        setTimeout(() => (drag.current.travel = 0), 0);
    };

    const onWheel = (e: React.WheelEvent) => {
        if (focused || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        go(targetRef.current + e.deltaX * 0.0024);
    };

    const book = BOOKS[index];
    const hidden = focused ? "invisible opacity-0" : "opacity-100";

    return (
        <div className="space-y-3">
            <div
                ref={wrapRef}
                className={`relative h-[clamp(26rem,52vh,34rem)] w-full select-none ${
                    focused ? "" : "cursor-grab active:cursor-grabbing"
                }`}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onPointerLeave={endDrag}
                onWheel={onWheel}
            >
                <Canvas
                    dpr={[1, 2]}
                    shadows
                    gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
                    camera={{ fov: 27, position: [0, 1.42, 6.65], near: 0.08, far: 80 }}
                    onCreated={({ gl }) => {
                        gl.toneMapping = THREE.ACESFilmicToneMapping;
                        gl.toneMappingExposure = 1.03;
                    }}
                >
                    <Suspense fallback={null}>
                        <SceneWithTextures
                            slots={slots}
                            scrollRef={scrollRef}
                            targetRef={targetRef}
                            focusRef={focusRef}
                            focused={focused}
                            onPick={onPick}
                            palette={palette}
                        />
                    </Suspense>
                </Canvas>

                {/* Caption */}
                <div
                    className={`pointer-events-none absolute bottom-1 left-0 max-w-[55%] transition-all duration-300 ${
                        focused ? "invisible -translate-x-3 opacity-0" : "opacity-100"
                    }`}
                >
                    <p className="mb-1 font-mono text-[11px] tracking-[0.08em] text-[var(--color-muted)]">
                        {String(index + 1).padStart(2, "0")} / {String(BOOKS.length).padStart(2, "0")}
                    </p>
                    <p className="font-serif text-[1.35rem] leading-tight">{book.shortTitle}</p>
                    <p className="mb-2 text-[13px] text-[var(--color-muted)]">
                        {book.author}, {book.year}
                    </p>
                    <button
                        type="button"
                        onClick={() => setFocused(true)}
                        className="pointer-events-auto rounded border border-[var(--color-border)] bg-[var(--color-surface)]/80 px-3 py-1.5 font-mono text-[12px] transition-colors hover:border-[var(--color-muted)]"
                    >
                        Inspect <span aria-hidden>↗</span>
                    </button>
                </div>

                {/* Browse arrows */}
                {([-1, 1] as const).map((dir) => (
                    <button
                        key={dir}
                        type="button"
                        aria-label={dir < 0 ? "Previous book" : "Next book"}
                        disabled={dir < 0 ? index === 0 : index === BOOKS.length - 1}
                        onClick={() => go(Math.round(targetRef.current) + dir)}
                        className={`absolute top-[42%] z-[2] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-surface)]/80 font-mono text-sm transition-all duration-300 hover:border-[var(--color-muted)] disabled:opacity-25 ${
                            dir < 0 ? "left-0" : "right-0"
                        } ${hidden}`}
                    >
                        {dir < 0 ? "←" : "→"}
                    </button>
                ))}

                {/* Catalog ticks */}
                <div
                    className={`absolute bottom-2 right-0 flex items-end gap-[0.35rem] transition-opacity duration-300 ${hidden}`}
                    role="group"
                    aria-label="Catalog position"
                >
                    {BOOKS.map((b, i) => (
                        <button
                            key={b.id}
                            type="button"
                            aria-label={`Browse to ${b.title}`}
                            aria-current={i === index}
                            onClick={() => go(i)}
                            className="flex h-6 w-[14px] items-end justify-center"
                        >
                            <span
                                className={`w-[2px] transition-all duration-150 ${
                                    i === index
                                        ? "h-[18px] bg-[var(--color-accent)]"
                                        : "h-[10px] bg-[var(--color-border)] hover:bg-[var(--color-muted)]"
                                }`}
                            />
                        </button>
                    ))}
                </div>

                {/* Inspect panel */}
                <aside
                    aria-hidden={!focused}
                    className={`absolute inset-y-0 right-0 z-[3] flex w-[min(340px,48%)] flex-col gap-2 overflow-y-auto border-l border-[var(--color-border)] bg-[var(--color-bg)]/90 p-5 backdrop-blur-md transition-all duration-300 ${
                        focused ? "translate-x-0 opacity-100" : "invisible translate-x-4 opacity-0"
                    }`}
                >
                    <button
                        type="button"
                        onClick={() => setFocused(false)}
                        className="self-start font-mono text-[12px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]"
                    >
                        ← Back to shelf
                    </button>
                    <p className="font-serif text-[1.3rem] leading-snug">{book.title}</p>
                    <p className="text-[13px] text-[var(--color-muted)]">
                        {book.author}, {book.year}
                    </p>
                    <p className="text-[13px] leading-relaxed text-[var(--color-muted)]">
                        {book.description}
                    </p>
                    <a
                        href={book.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[12px] text-[var(--color-accent)] underline-offset-4 hover:underline"
                    >
                        View on Goodreads ↗
                    </a>
                    <p className="mt-auto font-mono text-[11px] text-[var(--color-muted)]">
                        drag to orbit · scroll to zoom · esc to close
                    </p>
                </aside>
            </div>

            <ul className="sr-only">
                {BOOKS.map((b) => (
                    <li key={b.id}>
                        {b.title} by {b.author} ({b.year}). {b.description}
                    </li>
                ))}
            </ul>
        </div>
    );
}
