import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Eye, RotateCcw } from 'lucide-react';

interface Cpr3DSceneProps {
  currentStep: number;
  isCompressing: boolean;
  compressionCount: number;
  arCameraEnabled: boolean;
  isArFullscreen?: boolean;
  onToggleAr?: () => void;
  onCompressPress?: () => void;
}

export const Cpr3DScene: React.FC<Cpr3DSceneProps> = ({
  currentStep,
  isCompressing,
  compressionCount,
  arCameraEnabled,
  isArFullscreen = false,
  onToggleAr,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const heartMeshRef = useRef<THREE.Mesh | null>(null);
  const targetRingRef = useRef<THREE.Mesh | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [loadingProgress, setLoadingProgress] = useState<number | null>(0);
  const [modelLoaded, setModelLoaded] = useState<boolean>(false);
  const [activeModelName, setActiveModelName] = useState<string>('cpr_new.glb');
  const [animationCount, setAnimationCount] = useState<number>(0);
  const [cameraStreamActive, setCameraStreamActive] = useState<boolean>(false);

  // Initialize Real AR Camera Video Stream
  useEffect(() => {
    if (arCameraEnabled && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setCameraStreamActive(true);
          }
        })
        .catch(() => {
          setCameraStreamActive(false);
        });
    }
  }, [arCameraEnabled]);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 360;
    const height = containerRef.current.clientHeight || (isArFullscreen ? 600 : 260);

    const scene = new THREE.Scene();
    
    // Zoomed out camera position so the ENTIRE model is fully visible
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 3.8, 5.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // OrbitControls: Allows touch drag rotation and pinch zoom!
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.minDistance = 2.5;
    controls.maxDistance = 10.0;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Green AR Spatial Floor Grid
    const gridHelper = new THREE.GridHelper(10, 24, 0x00E676, 0x94A3B8);
    gridHelper.position.y = -0.55;
    scene.add(gridHelper);

    // Shadow Plane
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.ShadowMaterial({ opacity: 0.3 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.54;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Bright Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.4);
    mainLight.position.set(5, 10, 6);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xE0E7FF, 1.4);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Glowing 3D Heart Target for Step 6/7
    const targetRing = new THREE.Mesh(
      new THREE.RingGeometry(0.28, 0.36, 32),
      new THREE.MeshBasicMaterial({ color: 0x00E676, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
    );
    targetRing.rotation.x = -Math.PI / 2;
    targetRing.position.set(0, 0.22, 0.05);
    scene.add(targetRing);
    targetRingRef.current = targetRing;

    const heartMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xEF4444, emissive: 0xEF4444, emissiveIntensity: 0.7 })
    );
    heartMesh.position.set(0, 0.22, 0.05);
    scene.add(heartMesh);
    heartMeshRef.current = heartMesh;

    // Procedural Fallback Model Pair
    const proceduralPair = new THREE.Group();
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.25 });
    const rescuerSkinMat = new THREE.MeshStandardMaterial({ color: 0x384766, roughness: 0.25 });

    const pTorso = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.4, 0.42), skinMat);
    pTorso.rotation.x = Math.PI / 2;
    pTorso.castShadow = true;
    proceduralPair.add(pTorso);

    const pHead = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 32), skinMat);
    pHead.position.set(0, 0.1, -0.9);
    proceduralPair.add(pHead);

    const rescuerGroup = new THREE.Group();
    rescuerGroup.position.set(0.6, 0.35, 0);

    const rTorso = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.0, 0.45), rescuerSkinMat);
    rTorso.rotation.x = 0.4;
    rescuerGroup.add(rTorso);

    const rHead = new THREE.Mesh(new THREE.SphereGeometry(0.23, 32, 32), rescuerSkinMat);
    rHead.position.set(-0.15, 0.85, -0.2);
    rescuerGroup.add(rHead);

    proceduralPair.add(rescuerGroup);
    scene.add(proceduralPair);
    modelGroupRef.current = proceduralPair;

    // Load Primary Model: /cpr_new.glb with perfect framing
    const loadCprNewGlb = () => {
      const loader = new GLTFLoader();
      loader.load(
        '/cpr_new.glb',
        (gltf) => {
          setLoadingProgress(100);
          setModelLoaded(true);
          setActiveModelName('cpr_new.glb (Animated CPR)');
          scene.remove(proceduralPair);

          const model = gltf.scene;

          if (gltf.animations && gltf.animations.length > 0) {
            setAnimationCount(gltf.animations.length);
            const mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => {
              const action = mixer.clipAction(clip);
              action.reset();
              action.setEffectiveWeight(1.0);
              action.setEffectiveTimeScale(1.0);
              action.play();
            });
            mixerRef.current = mixer;
          }

          // Exact Bounding Box Calculation for Perfect Full View
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 1.9 / (maxDim || 1);
          model.scale.setScalar(scale);

          box.setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          model.position.sub(center);
          model.position.y += 0.15;

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              const mesh = child as THREE.Mesh;
              if (mesh.material) {
                const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
                if (mat) {
                  mat.side = THREE.DoubleSide;
                  mat.needsUpdate = true;
                }
              }
            }
          });

          scene.add(model);
          modelGroupRef.current = model;
        },
        (xhr) => {
          if (xhr.total > 0) {
            setLoadingProgress(Math.round((xhr.loaded / xhr.total) * 100));
          } else {
            setLoadingProgress((prev) => Math.min(98, (prev || 0) + 5));
          }
        },
        (err) => {
          console.warn('cpr_new.glb load error, fallback to cpr1.fbx...', err);
          loadCpr1Fbx();
        }
      );
    };

    const loadCpr1Fbx = () => {
      const fbxLoader = new FBXLoader();
      fbxLoader.load(
        '/cpr1.fbx',
        (fbx) => {
          setLoadingProgress(100);
          setModelLoaded(true);
          setActiveModelName('cpr1.fbx');
          scene.remove(proceduralPair);

          if (fbx.animations && fbx.animations.length > 0) {
            setAnimationCount(fbx.animations.length);
            const mixer = new THREE.AnimationMixer(fbx);
            fbx.animations.forEach((clip) => {
              mixer.clipAction(clip).play();
            });
            mixerRef.current = mixer;
          }

          const box = new THREE.Box3().setFromObject(fbx);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 1.9 / (maxDim || 1);
          fbx.scale.setScalar(scale);

          box.setFromObject(fbx);
          const center = box.getCenter(new THREE.Vector3());
          fbx.position.sub(center);
          fbx.position.y += 0.15;

          scene.add(fbx);
          modelGroupRef.current = fbx;
        },
        (xhr) => {
          if (xhr.total > 0) {
            setLoadingProgress(Math.round((xhr.loaded / xhr.total) * 100));
          }
        },
        (err) => {
          console.warn('FBX fallback failed, using procedural CPR pair', err);
          setLoadingProgress(null);
        }
      );
    };

    loadCprNewGlb();

    // Render & Animation Clock Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      if (heartMeshRef.current) {
        const pulse = 1 + Math.sin(elapsedTime * 8) * 0.15;
        heartMeshRef.current.scale.setScalar(pulse);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement) renderer.domElement.remove();
      renderer.dispose();
    };
  }, [isArFullscreen]);

  useEffect(() => {
    if (heartMeshRef.current) heartMeshRef.current.visible = currentStep >= 6;
    if (targetRingRef.current) targetRingRef.current.visible = currentStep >= 6;
  }, [currentStep]);

  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 3.8, 5.5);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <View style={[styles.container, isArFullscreen && styles.fullscreenContainer]}>
      {/* Background Camera Video Stream */}
      <video
        ref={videoRef}
        playsInline
        muted
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: cameraStreamActive ? (isArFullscreen ? 0.65 : 0.45) : 0,
          zIndex: 0,
        }}
      />

      {/* Top Overlay Banner */}
      <View style={styles.cameraOverlay}>
        <Text style={styles.cameraText}>
          📷 {isArFullscreen ? 'AR Live Room Stream' : 'Full 3D CPR View'} ({activeModelName})
        </Text>
      </View>

      {/* Action Badges in Top Right */}
      <View style={styles.actionBadgeRow}>
        <TouchableOpacity style={styles.smallArBtn} onPress={handleResetCamera}>
          <RotateCcw size={12} color="#0F172A" />
        </TouchableOpacity>

        {onToggleAr && (
          <TouchableOpacity
            style={[styles.viewInArBtn, isArFullscreen && { backgroundColor: '#16A34A' }]}
            onPress={onToggleAr}
            activeOpacity={0.8}
          >
            <Eye size={12} color="#FFFFFF" />
            <Text style={styles.viewInArText}>
              {isArFullscreen ? 'Exit AR' : 'View in AR'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loadingProgress !== null && !modelLoaded && (
        <View style={styles.loadingBanner}>
          <Text style={styles.loadingText}>
            Loading 3D CPR Model (cpr_new.glb): {loadingProgress}%
          </Text>
        </View>
      )}

      {/* Touch drag prompt */}
      <View style={styles.touchPromptPill}>
        <Text style={styles.touchPromptText}>👆 Drag to rotate 3D model • Pinch to zoom</Text>
      </View>

      <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 270,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: 0,
    borderWidth: 0,
    zIndex: 0,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00E676',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
  },
  cameraText: {
    color: '#0F172A',
    fontSize: 9,
    fontWeight: '700',
  },
  actionBadgeRow: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smallArBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  viewInArBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284C7',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
  },
  viewInArText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  loadingBanner: {
    position: 'absolute',
    bottom: 28,
    left: 8,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  loadingText: {
    color: '#334155',
    fontSize: 9,
    fontWeight: '600',
  },
  touchPromptPill: {
    position: 'absolute',
    bottom: 6,
    alignSelf: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  touchPromptText: {
    color: '#E2E8F0',
    fontSize: 8,
    fontWeight: '500',
  },
});
