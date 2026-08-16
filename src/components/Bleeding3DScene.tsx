import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Eye, RotateCcw, ZoomIn, ZoomOut, Plus, Minus, Play, Pause } from 'lucide-react';

interface Bleeding3DSceneProps {
  currentStep: number;
  isPressureApplied: boolean;
  pressureScore: number;
  arCameraEnabled: boolean;
  isArFullscreen?: boolean;
  onToggleAr?: () => void;
  onApplyPressure?: () => void;
}

export const Bleeding3DScene: React.FC<Bleeding3DSceneProps> = ({
  currentStep,
  isPressureApplied,
  pressureScore,
  arCameraEnabled,
  isArFullscreen = false,
  onToggleAr,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const bloodParticlesRef = useRef<THREE.Points | null>(null);
  const woundLightRef = useRef<THREE.PointLight | null>(null);
  const tourniquetMeshRef = useRef<THREE.Mesh | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [loadingProgress, setLoadingProgress] = useState<number | null>(0);
  const [modelLoaded, setModelLoaded] = useState<boolean>(false);
  const [activeModelName, setActiveModelName] = useState<string>('Bleeding.glb');
  const [cameraStreamActive, setCameraStreamActive] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [modelScaleFactor, setModelScaleFactor] = useState<number>(1.0);

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
    const height = containerRef.current.clientHeight || (isArFullscreen ? 600 : 280);

    const scene = new THREE.Scene();
    
    // Zoomed out camera position so the ENTIRE model is fully visible with no cutoffs
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2.8, 4.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Ensure touch actions work cleanly without page scroll interference
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // OrbitControls: Allows touch drag rotation and pinch zoom!
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 + 0.15;
    controls.minDistance = 0.8;
    controls.maxDistance = 15.0;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.4;
    controls.enableRotate = true;
    controls.rotateSpeed = 0.9;
    controls.enablePan = true;
    controls.panSpeed = 0.8;
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Shadow Plane (No visual grid lines)
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.ShadowMaterial({ opacity: 0.25 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.55;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(5, 10, 6);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xFFE4E6, 1.4);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Wound Red Glowing Light Source
    const woundLight = new THREE.PointLight(0xFF5252, 4, 4);
    woundLight.position.set(0.35, 0.2, 0.8);
    scene.add(woundLight);
    woundLightRef.current = woundLight;

    // Tourniquet / Dressing Band
    const bandGeo = new THREE.TorusGeometry(0.25, 0.06, 16, 32);
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0x00F0FF,
      emissive: 0x00F0FF,
      emissiveIntensity: 0.5,
    });
    const tourniquet = new THREE.Mesh(bandGeo, bandMat);
    tourniquet.rotation.x = Math.PI / 2;
    tourniquet.position.set(0.35, 0.15, 0.6);
    tourniquet.visible = false;
    scene.add(tourniquet);
    tourniquetMeshRef.current = tourniquet;

    // Blood Particle Emitter System
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0.35 + (Math.random() - 0.5) * 0.12;
      positions[i * 3 + 1] = 0.12 + Math.random() * 0.1;
      positions[i * 3 + 2] = 0.8 + (Math.random() - 0.5) * 0.12;

      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: 0.02 + Math.random() * 0.03,
        z: (Math.random() - 0.5) * 0.02,
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xFF1744,
      size: 0.07,
      transparent: true,
      opacity: 0.9,
    });
    const bloodParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(bloodParticles);
    bloodParticlesRef.current = bloodParticles;

    // Fallback Procedural Model Group
    const fallbackGroup = new THREE.Group();
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.3 });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.7, 0.45), torsoMat);
    torso.rotation.x = Math.PI / 2;
    fallbackGroup.add(torso);

    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 1.8, 32), torsoMat);
    rightLeg.rotation.x = Math.PI / 2;
    rightLeg.position.set(0.35, 0, 1.7);
    fallbackGroup.add(rightLeg);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 32, 32), torsoMat);
    head.position.set(0, 0.1, -1.1);
    fallbackGroup.add(head);

    scene.add(fallbackGroup);
    modelGroupRef.current = fallbackGroup;

    // Load User GLB Model (/Bleeding.glb)
    const loadBleedingGlb = () => {
      const loader = new GLTFLoader();
      loader.load(
        '/Bleeding.glb',
        (gltf) => {
          setLoadingProgress(100);
          setModelLoaded(true);
          setActiveModelName('Bleeding.glb (Animated)');
          scene.remove(fallbackGroup);

          const model = gltf.scene;

          if (gltf.animations && gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => {
              const action = mixer.clipAction(clip);
              action.reset();
              action.setLoop(THREE.LoopRepeat, Infinity);
              action.clampWhenFinished = false;
              action.setEffectiveWeight(1.0);
              action.setEffectiveTimeScale(1.0);
              action.play();
            });
            mixerRef.current = mixer;
          }

          // Exact Bounding Box Calculation for Perfect View
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 2.2 / (maxDim || 1);
          model.scale.setScalar(scale);

          box.setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          model.position.sub(center);
          model.position.y += 0.1;

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
            setLoadingProgress((prev) => Math.min(98, (prev || 0) + 10));
          }
        },
        (err) => {
          console.warn('Bleeding.glb error, trying bleeding.fbx...', err);
          loadBleedingFbx();
        }
      );
    };

    const loadBleedingFbx = () => {
      const fbxLoader = new FBXLoader();
      fbxLoader.load(
        '/bleeding.fbx',
        (fbx) => {
          setLoadingProgress(100);
          setModelLoaded(true);
          setActiveModelName('bleeding.fbx');
          scene.remove(fallbackGroup);

          const box = new THREE.Box3().setFromObject(fbx);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 2.2 / (maxDim || 1);
          fbx.scale.setScalar(scale);

          box.setFromObject(fbx);
          const center = box.getCenter(new THREE.Vector3());
          fbx.position.sub(center);
          fbx.position.y += 0.1;

          scene.add(fbx);
          modelGroupRef.current = fbx;
        },
        (xhr) => {
          if (xhr.total > 0) {
            setLoadingProgress(Math.round((xhr.loaded / xhr.total) * 100));
          }
        },
        (err) => {
          console.warn('FBX fallback failed, using procedural bleeding model', err);
          setLoadingProgress(null);
        }
      );
    };

    loadBleedingGlb();

    // Render & Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      // Animate blood flow particles if not fully bandaged
      if (bloodParticlesRef.current && currentStep < 6) {
        const posAttr = bloodParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const posArray = posAttr.array as Float32Array;

        for (let i = 0; i < particleCount; i++) {
          posArray[i * 3 + 1] += velocities[i].y;
          posArray[i * 3] += velocities[i].x;
          posArray[i * 3 + 2] += velocities[i].z;

          // Reset particle if it falls too far
          if (posArray[i * 3 + 1] > 0.45) {
            posArray[i * 3] = 0.35 + (Math.random() - 0.5) * 0.08;
            posArray[i * 3 + 1] = 0.12;
            posArray[i * 3 + 2] = 0.8 + (Math.random() - 0.5) * 0.08;
          }
        }
        posAttr.needsUpdate = true;
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

  // Adjust blood particles and tourniquet based on treatment step
  useEffect(() => {
    if (bloodParticlesRef.current) {
      bloodParticlesRef.current.visible = currentStep < 6;
    }
    if (tourniquetMeshRef.current) {
      tourniquetMeshRef.current.visible = currentStep >= 4;
    }
  }, [currentStep]);

  // Zoom and Scale Controls
  const handleZoomIn = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.multiplyScalar(0.8);
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.multiplyScalar(1.25);
      controlsRef.current.update();
    }
  };

  const handleScaleUp = () => {
    if (modelGroupRef.current) {
      modelGroupRef.current.scale.multiplyScalar(1.2);
      setModelScaleFactor((prev) => +(prev * 1.2).toFixed(1));
    }
  };

  const handleScaleDown = () => {
    if (modelGroupRef.current) {
      modelGroupRef.current.scale.multiplyScalar(0.833);
      setModelScaleFactor((prev) => +(prev * 0.833).toFixed(1));
    }
  };

  const handleTogglePlay = () => {
    if (mixerRef.current) {
      if (isPlaying) {
        mixerRef.current.timeScale = 0;
        setIsPlaying(false);
      } else {
        mixerRef.current.timeScale = 1;
        setIsPlaying(true);
      }
    }
  };

  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 2.8, 4.2);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
    if (modelGroupRef.current) {
      const box = new THREE.Box3().setFromObject(modelGroupRef.current);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        modelGroupRef.current.scale.setScalar(2.2 / maxDim);
        setModelScaleFactor(1.0);
      }
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

      {/* Top Floating Control Bar */}
      <View style={styles.topControlRow} pointerEvents="box-none">
        <View style={styles.modelTagBadge}>
          <Text style={styles.modelTagText}>
            {isArFullscreen ? 'AR Live' : '3D Wound'}
          </Text>
        </View>

        {/* Action Controls */}
        <View style={styles.rightActionsRow}>
          <TouchableOpacity style={styles.circleBtn} onPress={handleTogglePlay} activeOpacity={0.7}>
            {isPlaying ? <Pause size={13} color="#0F172A" /> : <Play size={13} color="#16A34A" />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.circleBtn} onPress={handleResetCamera} activeOpacity={0.7}>
            <RotateCcw size={13} color="#0F172A" />
          </TouchableOpacity>

          {onToggleAr && (
            <TouchableOpacity
              style={[styles.viewInArBtn, isArFullscreen && { backgroundColor: '#16A34A' }]}
              onPress={onToggleAr}
              activeOpacity={0.8}
            >
              <Eye size={12} color="#FFFFFF" />
              <Text style={styles.viewInArText}>
                {isArFullscreen ? 'Exit AR' : 'AR View'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Interactive Floating Zoom & Scale Panel on Right Side */}
      <View style={styles.zoomScalePanel} pointerEvents="box-none">
        <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomIn} activeOpacity={0.7}>
          <ZoomIn size={14} color="#0F172A" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomOut} activeOpacity={0.7}>
          <ZoomOut size={14} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.scaleDivider} />

        <TouchableOpacity style={styles.scaleBtn} onPress={handleScaleUp} activeOpacity={0.7}>
          <Plus size={13} color="#0F172A" />
          <Text style={styles.scaleBtnLabel}>Size</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.scaleBtn} onPress={handleScaleDown} activeOpacity={0.7}>
          <Minus size={13} color="#0F172A" />
          <Text style={styles.scaleBtnLabel}>Size</Text>
        </TouchableOpacity>
      </View>

      {loadingProgress !== null && !modelLoaded && (
        <View style={styles.loadingBanner}>
          <Text style={styles.loadingText}>
            Loading 3D Model: {loadingProgress}%
          </Text>
        </View>
      )}

      {/* Touch prompt */}
      <View style={styles.touchPromptPill} pointerEvents="none">
        <Text style={styles.touchPromptText}>👆 Drag to rotate • Pinch / buttons to resize</Text>
      </View>

      {/* 3D WebGL Canvas Div */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          zIndex: 1,
          touchAction: 'none',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 310,
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
  topControlRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modelTagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
  },
  modelTagText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '700',
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  circleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
  },
  viewInArBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284C7',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
  },
  viewInArText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  zoomScalePanel: {
    position: 'absolute',
    right: 10,
    top: 50,
    zIndex: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 14,
    padding: 4,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
  },
  zoomBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleDivider: {
    width: 20,
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 1,
  },
  scaleBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleBtnLabel: {
    fontSize: 6,
    fontWeight: '800',
    color: '#64748B',
    marginTop: -2,
  },
  loadingBanner: {
    position: 'absolute',
    top: '45%',
    left: '15%',
    right: '15%',
    zIndex: 25,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0284C7',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  touchPromptPill: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 4,
    borderRadius: 10,
    alignItems: 'center',
  },
  touchPromptText: {
    color: '#F8FAFC',
    fontSize: 9,
    fontWeight: '600',
  },
});
