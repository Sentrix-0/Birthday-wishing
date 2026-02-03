
import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { ParticleTemplate } from '../types';
import { generateShape, COLORS } from '../constants';

interface SceneProps {
  template: ParticleTemplate;
  color: string;
  expansion: number;
}

const Scene: React.FC<SceneProps> = ({ template, color, expansion }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const targetPositionsRef = useRef<Float32Array | null>(null);

  const PARTICLE_COUNT = 8000;

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialization
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 60;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create Particles
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const initialPositions = generateShape(ParticleTemplate.HEART, PARTICLE_COUNT);
    targetPositionsRef.current = initialPositions;

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.5,
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // Starfield Background
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);
    for(let i=0; i<starCount*3; i++) starPositions[i] = (Math.random() - 0.5) * 400;
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ size: 0.1, color: 0xffffff });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (particlesRef.current && targetPositionsRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        const target = targetPositionsRef.current;
        
        for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
          // Smooth transition to target shape
          const diff = target[i] * expansion - positions[i];
          positions[i] += diff * 0.05;
          
          // Add subtle turbulence
          positions[i] += Math.sin(time + i) * 0.02;
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
        
        // Gentle rotation
        particlesRef.current.rotation.y += 0.005;
        particlesRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
      }

      stars.rotation.y -= 0.0005;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Update logic on props change
  useEffect(() => {
    if (particlesRef.current) {
      targetPositionsRef.current = generateShape(template, PARTICLE_COUNT);
      (particlesRef.current.material as THREE.PointsMaterial).color.set(color);
    }
  }, [template, color]);

  return <div ref={mountRef} className="absolute inset-0 z-0" />;
};

export default Scene;
