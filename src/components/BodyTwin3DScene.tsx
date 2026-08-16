import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import * as THREE from 'three';

interface BodyTwin3DSceneProps {
  activeNode?: string;
  onSelectNode?: (nodeName: string) => void;
}

export const BodyTwin3DScene: React.FC<BodyTwin3DSceneProps> = ({
  activeNode,
  onSelectNode,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 360;
    const height = containerRef.current.clientHeight || 450;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 4.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(10, 20, 0x00F0FF, 0x0F172A);
    gridHelper.position.y = -1.6;
    scene.add(gridHelper);

    // Ambient & Directional Light
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0x00F0FF, 1.5);
    dirLight.position.set(2, 5, 4);
    scene.add(dirLight);

    // Holographic Human Group
    const humanGroup = new THREE.Group();

    // Wireframe / Hologram Torso
    const torsoGeo = new THREE.CylinderGeometry(0.5, 0.35, 1.4, 24, 12);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: 0x00F0FF,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.set(0, 0.2, 0);
    humanGroup.add(torso);

    // Inner Core Glow Spine
    const spineGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 16);
    const spineMat = new THREE.MeshBasicMaterial({ color: 0x00E676 });
    const spine = new THREE.Mesh(spineGeo, spineMat);
    spine.position.set(0, 0.1, 0);
    humanGroup.add(spine);

    // Head
    const headGeo = new THREE.IcosahedronGeometry(0.32, 2);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x00F0FF,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 1.25, 0);
    humanGroup.add(head);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.1, 0.08, 1.2, 12);
    const leftArm = new THREE.Mesh(armGeo, torsoMat);
    leftArm.position.set(-0.7, 0.2, 0);
    leftArm.rotation.z = 0.15;
    humanGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, torsoMat);
    rightArm.position.set(0.7, 0.2, 0);
    rightArm.rotation.z = -0.15;
    humanGroup.add(rightArm);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.12, 0.09, 1.5, 12);
    const leftLeg = new THREE.Mesh(legGeo, torsoMat);
    leftLeg.position.set(-0.25, -1.1, 0);
    humanGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, torsoMat);
    rightLeg.position.set(0.25, -1.1, 0);
    humanGroup.add(rightLeg);

    // Vital Node Hotspots:
    // 1. Heart Node (Red Pulse)
    const heartGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const heartMat = new THREE.MeshBasicMaterial({ color: 0xFF5252 });
    const heartNode = new THREE.Mesh(heartGeo, heartMat);
    heartNode.position.set(-0.1, 0.45, 0.2);
    humanGroup.add(heartNode);

    const heartLight = new THREE.PointLight(0xFF5252, 3, 2);
    heartLight.position.set(-0.1, 0.45, 0.2);
    humanGroup.add(heartLight);

    // 2. Brain Node (Cyan Glow)
    const brainNode = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x00F0FF })
    );
    brainNode.position.set(0, 1.3, 0);
    humanGroup.add(brainNode);

    // 3. Lungs Node (Blue Glow)
    const lungNode = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x3B82F6 })
    );
    lungNode.position.set(0.12, 0.45, 0.2);
    humanGroup.add(lungNode);

    scene.add(humanGroup);

    // Holographic Scan Line Ring
    const scanRingGeo = new THREE.RingGeometry(0.7, 0.75, 32);
    const scanRingMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
    scanRing.rotation.x = Math.PI / 2;
    scanRing.position.y = -1.5;
    scene.add(scanRing);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Continuous 360-degree slow holographic rotation
      humanGroup.rotation.y = elapsedTime * 0.4;

      // Scan ring moving up and down body
      scanRing.position.y = Math.sin(elapsedTime * 1.5) * 1.4;

      // Heartbeat pulse animation
      const heartPulse = 1 + Math.sin(elapsedTime * 6) * 0.2;
      heartNode.scale.set(heartPulse, heartPulse, heartPulse);
      heartLight.intensity = 2 + Math.sin(elapsedTime * 6) * 1.5;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement) renderer.domElement.remove();
      renderer.dispose();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.hologramTag}>
        <Text style={styles.hologramText}>⚡ HOLOGRAPHIC 3D TWIN • ACTIVE</Text>
      </View>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 260,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#070B14',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#102A45',
  },
  hologramTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00F0FF',
  },
  hologramText: {
    color: '#00F0FF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
