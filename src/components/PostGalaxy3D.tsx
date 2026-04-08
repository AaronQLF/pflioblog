"use client";

import {
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, Line, OrbitControls, Stars, Text } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "@/context/ThemeContext";
import galaxyPayload from "@/generated/post-galaxy-3d.json";

interface GalaxyPoint {
    slug: string;
    title: string;
    date: string;
    tags: string[];
    cluster: string;
    color: string;
    x: number;
    y: number;
    z: number;
}

interface Region {
    label: string;
    color: string;
    count: number;
    x: number;
    y: number;
    z: number;
}

interface LegendEntry {
    label: string;
    color: string;
    count: number;
}

interface GalaxyPayload {
    model: string;
    reduction: string;
    generatedAt: string;
    regions: Region[];
    legend: LegendEntry[];
    points: GalaxyPoint[];
}

const payload = galaxyPayload as GalaxyPayload;

function RegionLabels({ regions }: { regions: Region[] }) {
    return (
        <group>
            {regions.map((r) => (
                <Billboard
                    key={r.label}
                    position={[r.x, r.y + 0.6, r.z]}
                    follow
                    lockX={false}
                    lockY={false}
                    lockZ={false}
                >
                    <Text
                        fontSize={0.24}
                        color={r.color}
                        fillOpacity={0.25}
                        anchorX="center"
                        anchorY="middle"
                        letterSpacing={0.08}
                    >
                        {r.label.toLowerCase()}
                    </Text>
                </Billboard>
            ))}
        </group>
    );
}

function PostRay({
    point,
    dimmed,
    onNavigate,
    onHover,
}: {
    point: GalaxyPoint;
    dimmed: boolean;
    onNavigate: (slug: string) => void;
    onHover: (p: GalaxyPoint | null) => void;
}) {
    const [hovered, setHovered] = useState(false);
    const sphereRef = useRef<THREE.Mesh>(null);

    const end = useMemo(
        () => new THREE.Vector3(point.x, point.y, point.z),
        [point.x, point.y, point.z],
    );

    const { midpoint, quat, length } = useMemo(() => {
        const len = Math.max(end.length(), 1e-6);
        const d = end.clone().divideScalar(len);
        const mid = end.clone().multiplyScalar(0.5);
        const q = new THREE.Quaternion();
        q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
        return { midpoint: mid, quat: q, length: len };
    }, [end]);

    const baseColor = useMemo(() => new THREE.Color(point.color), [point.color]);

    const lineOpacity = dimmed ? 0.06 : hovered ? 0.7 : 0.3;
    const sphereScale = hovered ? 1.6 : 1;
    const emissiveIntensity = hovered ? 0.6 : 0.2;
    const sphereOpacity = dimmed ? 0.12 : 1;

    useFrame(() => {
        if (!sphereRef.current) return;
        const s = sphereRef.current.scale;
        const t = sphereScale;
        s.x += (t - s.x) * 0.12;
        s.y += (t - s.y) * 0.12;
        s.z += (t - s.z) * 0.12;
    });

    const onOver = (e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        setHovered(true);
        onHover(point);
        document.body.style.cursor = "pointer";
    };
    const onOut = () => {
        setHovered(false);
        onHover(null);
        document.body.style.cursor = "auto";
    };
    const onPick = (e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        onNavigate(point.slug);
    };

    return (
        <group>
            <Line
                points={[
                    [0, 0, 0],
                    [point.x, point.y, point.z],
                ]}
                color={point.color}
                lineWidth={hovered ? 2.2 : 1}
                transparent
                opacity={lineOpacity}
            />

            <mesh
                ref={sphereRef}
                position={[point.x, point.y, point.z]}
            >
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshStandardMaterial
                    color={baseColor}
                    emissive={baseColor}
                    emissiveIntensity={emissiveIntensity}
                    transparent
                    opacity={sphereOpacity}
                    toneMapped={false}
                />
            </mesh>

            <mesh
                position={[midpoint.x, midpoint.y, midpoint.z]}
                quaternion={quat}
                onPointerOver={onOver}
                onPointerOut={onOut}
                onClick={onPick}
                visible={false}
            >
                <cylinderGeometry args={[0.16, 0.16, length, 8]} />
                <meshBasicMaterial />
            </mesh>
        </group>
    );
}

function OriginGlow() {
    const ref = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        if (!ref.current) return;
        const s = 0.08 + Math.sin(clock.elapsedTime * 1.5) * 0.015;
        ref.current.scale.setScalar(s / 0.08);
    });
    return (
        <mesh ref={ref}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0.8}
                toneMapped={false}
            />
        </mesh>
    );
}

function Scene({
    points,
    regions,
    hoveredCluster,
    onNavigate,
    onHover,
}: {
    points: GalaxyPoint[];
    regions: Region[];
    hoveredCluster: string | null;
    onNavigate: (slug: string) => void;
    onHover: (p: GalaxyPoint | null) => void;
}) {
    return (
        <>
            <color attach="background" args={["#050505"]} />
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.6} />

            <Stars
                radius={80}
                depth={50}
                count={1400}
                factor={2}
                saturation={0}
                fade
                speed={0.15}
            />

            <OriginGlow />
            <RegionLabels regions={regions} />

            <group>
                {points.map((p) => (
                    <PostRay
                        key={p.slug}
                        point={p}
                        dimmed={hoveredCluster !== null && p.cluster !== hoveredCluster}
                        onNavigate={onNavigate}
                        onHover={onHover}
                    />
                ))}
            </group>

            <OrbitControls
                enablePan
                enableZoom
                enableRotate
                minDistance={6}
                maxDistance={42}
                dampingFactor={0.08}
                enableDamping
                rotateSpeed={0.65}
                zoomSpeed={0.7}
            />
        </>
    );
}

function Legend({
    entries,
    hoveredCluster,
}: {
    entries: LegendEntry[];
    hoveredCluster: string | null;
}) {
    return (
        <div className="absolute top-3 right-3 pointer-events-none">
            <div className="flex flex-col gap-1">
                {entries.map((e) => (
                    <div
                        key={e.label}
                        className="flex items-center gap-1.5 transition-opacity duration-200"
                        style={{
                            opacity:
                                hoveredCluster === null || hoveredCluster === e.label
                                    ? 1
                                    : 0.25,
                        }}
                    >
                        <span
                            className="block h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: e.color }}
                        />
                        <span className="text-[10px] font-mono leading-none text-neutral-400 whitespace-nowrap">
                            {e.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function PostGalaxy3D() {
    const { theme } = useTheme();
    const router = useRouter();
    const [hovered, setHovered] = useState<GalaxyPoint | null>(null);

    const onNavigate = useCallback(
        (slug: string) => {
            router.push(`/blog/${slug}`);
        },
        [router],
    );

    const hoveredCluster = hovered?.cluster ?? null;
    const display = hovered;

    return (
        <div className="space-y-4">
            <div className="relative h-[min(72vh,580px)] w-full overflow-hidden rounded-xl border border-neutral-800 bg-[#050505] shadow-sm">
                <Canvas
                    gl={{
                        antialias: true,
                        alpha: false,
                        toneMapping: THREE.ACESFilmicToneMapping,
                    }}
                    camera={{
                        position: [0, 2, 16],
                        fov: 48,
                        near: 0.1,
                        far: 200,
                    }}
                >
                    <Suspense fallback={null}>
                        <Scene
                            points={payload.points}
                            regions={payload.regions}
                            hoveredCluster={hoveredCluster}
                            onNavigate={onNavigate}
                            onHover={setHovered}
                        />
                    </Suspense>
                </Canvas>

                <Legend
                    entries={payload.legend}
                    hoveredCluster={hoveredCluster}
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent px-4 pb-4 pt-16">
                    <div className="pointer-events-auto max-w-xl">
                        {display ? (
                            <div className="space-y-1">
                                <p className="font-serif text-lg italic leading-snug text-neutral-100">
                                    {display.title}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                        className="inline-block h-2 w-2 rounded-full"
                                        style={{ backgroundColor: display.color }}
                                    />
                                    <span className="font-mono text-[11px] text-neutral-500">
                                        {display.cluster}
                                    </span>
                                    <span className="text-neutral-700">·</span>
                                    <span className="font-mono text-[11px] text-neutral-500">
                                        {display.date}
                                    </span>
                                </div>
                                <Link
                                    href={`/blog/${display.slug}`}
                                    className="inline-block pt-1 text-sm text-[var(--color-accent)] underline-offset-4 hover:underline"
                                >
                                    Read post
                                </Link>
                            </div>
                        ) : (
                            <p className="text-[13px] text-neutral-600">
                                Posts as vectors in embedding space. Color is topic.
                                Nearby rays are semantically similar. Hover to
                                highlight a cluster, click to read.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <p className="text-xs leading-relaxed text-[var(--color-muted)] max-w-3xl">
                Local embeddings ({payload.model}) at build time, projected to
                three dimensions via PCA. Region labels sit at the centroid of
                their posts. 
            </p>
        </div>
    );
}
