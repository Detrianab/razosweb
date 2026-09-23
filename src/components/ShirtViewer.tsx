/* eslint-disable react/no-unknown-property */
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Center,
  ContactShadows,
  Decal,
  Environment,
  Html,
  Lightformer,
  useGLTF,
  useProgress,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";

export const SHIRT_MODEL_URL = "/models/shirt.glb";

const ROTATE_SPEED = 0.005;
const INERTIA = 0.925;
const PARALLAX_MAG = 0.06;
const EASE = 0.12;
const MIN_Z = 0.9;
const MAX_Z = 3.4;

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <span className="font-sans text-xs tracking-[0.35em] text-foreground/60">
        {Math.round(progress)}%
      </span>
    </Html>
  );
}

export type ViewerPlacement = {
  front: "big" | "small" | null;
  back: boolean;
};

type ShirtProps = {
  color: string;
  artUrl: string;
  placement: ViewerPlacement;
};

function Shirt({ color, artUrl, placement }: ShirtProps) {
  const { nodes, materials } = useGLTF(SHIRT_MODEL_URL);
  const texture = useTexture(artUrl);
  const target = useMemo(() => new THREE.Color(color), [color]);

  const geometry = (nodes["T_Shirt_male"] as THREE.Mesh).geometry;
  const material = materials["lambert1"] as THREE.MeshStandardMaterial;

  useLayoutEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    // Tela mate y plana: sin brillo ni relieve marcado, para que el estampado mande.
    material.roughness = 0.97;
    material.metalness = 0;
    material.normalScale = new THREE.Vector2(0.15, 0.15);
    material.envMapIntensity = 0.45;
  }, [texture, material]);

  useFrame(() => {
    material.color.lerp(target, 0.12);
  });

  const bigScale = 0.17;
  const smallScale = 0.07;

  return (
    <mesh castShadow receiveShadow geometry={geometry} material={material} dispose={null}>
      {placement.front === "big" ? (
        <Decal
          position={[0, 0.04, 0.15]}
          scale={[bigScale, bigScale, bigScale]}
          map={texture}
          depthTest
        />
      ) : null}
      {placement.front === "small" ? (
        <Decal
          position={[-0.06, 0.11, 0.14]}
          scale={[smallScale, smallScale, smallScale]}
          map={texture}
          depthTest
        />
      ) : null}
      {placement.back ? (
        <Decal
          position={[0, 0.05, -0.14]}
          rotation={[0, Math.PI, 0]}
          scale={[bigScale, bigScale, bigScale]}
          map={texture}
          depthTest
        />
      ) : null}
    </mesh>
  );
}


type RigProps = {
  children: React.ReactNode;
};

/** Manual drag rotation with inertia, pointer parallax and pinch/wheel zoom. */
function Rig({ children }: RigProps) {
  const group = useRef<THREE.Group>(null);
  const { gl, camera } = useThree();
  const vel = useRef({ x: 0, y: 0 });
  const parTarget = useRef({ x: 0, y: 0 });
  const par = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = gl.domElement;
    const pointers = new Map<number, { x: number; y: number }>();
    let dragging = false;
    let lx = 0;
    let ly = 0;
    let startDist = 0;
    let startZ = camera.position.z;

    const down = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [p1, p2] = [...pointers.values()];
        startDist = Math.hypot(p1!.x - p2!.x, p1!.y - p2!.y);
        startZ = camera.position.z;
        dragging = false;
        return;
      }
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      el.setPointerCapture(e.pointerId);
    };

    const move = (e: PointerEvent) => {
      const p = pointers.get(e.pointerId);
      if (p) {
        p.x = e.clientX;
        p.y = e.clientY;
      }
      if (pointers.size === 2 && startDist > 0) {
        const [p1, p2] = [...pointers.values()];
        const d = Math.hypot(p1!.x - p2!.x, p1!.y - p2!.y);
        camera.position.z = THREE.MathUtils.clamp((startZ * startDist) / d, MIN_Z, MAX_Z);
        return;
      }
      if (dragging && group.current) {
        const dx = e.clientX - lx;
        const dy = e.clientY - ly;
        lx = e.clientX;
        ly = e.clientY;
        group.current.rotation.y += dx * ROTATE_SPEED;
        group.current.rotation.x = THREE.MathUtils.clamp(
          group.current.rotation.x + dy * ROTATE_SPEED,
          -0.6,
          0.6,
        );
        vel.current = { x: dx * ROTATE_SPEED, y: dy * ROTATE_SPEED };
        return;
      }
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      parTarget.current = { x: -nx * PARALLAX_MAG, y: ny * PARALLAX_MAG };
    };

    const up = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) startDist = 0;
      if (pointers.size === 0) dragging = false;
    };

    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      camera.position.z = THREE.MathUtils.clamp(
        camera.position.z * Math.exp(dy * 0.0015),
        MIN_Z,
        MAX_Z,
      );
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("pointerleave", up);
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("pointerleave", up);
      el.removeEventListener("wheel", wheel);
    };
  }, [gl, camera]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;

    par.current.x += (parTarget.current.x - par.current.x) * EASE;
    par.current.y += (parTarget.current.y - par.current.y) * EASE;
    g.position.x = par.current.x;
    g.position.y = par.current.y * 0.5;

    g.rotation.y += vel.current.x;
    g.rotation.x = THREE.MathUtils.clamp(g.rotation.x + vel.current.y, -0.6, 0.6);
    vel.current.x *= INERTIA;
    vel.current.y *= INERTIA;
  });

  return <group ref={group}>{children}</group>;
}

export type ShirtViewerProps = ShirtProps;

export function ShirtViewer({ ...shirt }: ShirtViewerProps) {
  useEffect(() => {
    useGLTF.preload(SHIRT_MODEL_URL);
  }, []);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 26, position: [0, 0, 2.2], near: 0.1, far: 100 }}
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
      style={{ touchAction: "pan-y" }}
      className="cursor-grab active:cursor-grabbing"
    >
      <ambientLight intensity={0.95} />
      <directionalLight position={[0, 2.5, 5]} intensity={0.85} />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} />
      <Environment resolution={256}>
        <Lightformer intensity={1.2} position={[0, 4, 2]} scale={[12, 12, 1]} />
        <Lightformer
          intensity={0.6}
          color="#f0e6d2"
          position={[-5, 1, -1]}
          rotation-y={Math.PI / 2}
          scale={[16, 2, 1]}
        />
        <Lightformer
          intensity={0.5}
          color="#8fa3b8"
          position={[5, 0, 1]}
          rotation-y={-Math.PI / 2}
          scale={[16, 2, 1]}
        />
      </Environment>

      <Suspense fallback={<Loader />}>
        <Rig>
          <Center>
            {/* Corte oversize: hombros y cuerpo más anchos, caída más recta. */}
            <group scale={[1.14, 1.04, 1.1]}>
              <Shirt {...shirt} />
            </group>
          </Center>
        </Rig>
      </Suspense>

      <ContactShadows
        position={[0, -0.62, 0]}
        opacity={0.45}
        scale={5}
        blur={2.6}
        far={1.2}
        color="#000000"
      />
    </Canvas>
  );
}
