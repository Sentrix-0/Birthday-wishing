
import * as THREE from 'three';
import { ParticleTemplate } from './types';

export const GESTURE_MAP: Record<string, ParticleTemplate> = {
  'heart': ParticleTemplate.HEART,
  'peace': ParticleTemplate.FLOWER,
  'fist': ParticleTemplate.BLAST,
  'open': ParticleTemplate.FIREWORKS,
  'point': ParticleTemplate.DESIGN,
  'thumbs up': ParticleTemplate.SPIRAL
};

export const COLORS = [
  '#ff69b4', // Hot Pink
  '#dda0dd', // Plum
  '#ff1493', // Deep Pink
  '#e6e6fa', // Lavender
  '#fff0f5', // Lavender Blush
  '#ffd700', // Gold
  '#00ffff', // Cyan
  '#ff4500', // OrangeRed
];

export const generateShape = (template: ParticleTemplate, count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    let x = 0, y = 0, z = 0;

    switch (template) {
      case ParticleTemplate.HEART: {
        const t = Math.random() * Math.PI * 2;
        x = 16 * Math.pow(Math.sin(t), 3);
        y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        z = (Math.random() - 0.5) * 5;
        break;
      }
      case ParticleTemplate.FLOWER: {
        const t = Math.random() * Math.PI * 2;
        const petals = 6;
        const r = 15 * Math.cos(petals * t / 2);
        x = r * Math.cos(t);
        y = r * Math.sin(t);
        z = (Math.random() - 0.5) * 10;
        break;
      }
      case ParticleTemplate.FIREWORKS: {
        const r = 25 * Math.pow(Math.random(), 0.5);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        break;
      }
      case ParticleTemplate.BLAST: {
        const r = 40 * Math.random();
        const angle = Math.random() * Math.PI * 2;
        x = r * Math.cos(angle);
        y = (Math.random() - 0.5) * 50;
        z = r * Math.sin(angle);
        break;
      }
      case ParticleTemplate.DESIGN: {
        const index = i;
        const angle = index * 137.5;
        const r = 2.0 * Math.sqrt(index);
        x = r * Math.cos(angle * Math.PI / 180);
        y = r * Math.sin(angle * Math.PI / 180);
        z = (Math.random() - 0.5) * 4;
        break;
      }
      case ParticleTemplate.SPIRAL: {
        const t = (i / count) * Math.PI * 25;
        const r = (i / count) * 30;
        x = r * Math.cos(t);
        y = (i / count) * 60 - 30;
        z = r * Math.sin(t);
        break;
      }
      case ParticleTemplate.CAKE: {
        // Multi-tier cake
        const segment = i / count;
        if (segment < 0.5) {
          // Bottom Tier
          const r = 20;
          const h = 10;
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.sqrt(Math.random()) * r;
          x = dist * Math.cos(angle);
          y = (Math.random() * h) - 15;
          z = dist * Math.sin(angle);
        } else if (segment < 0.8) {
          // Top Tier
          const r = 12;
          const h = 8;
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.sqrt(Math.random()) * r;
          x = dist * Math.cos(angle);
          y = (Math.random() * h) - 5;
          z = dist * Math.sin(angle);
        } else {
          // Candles
          const candleCount = 5;
          const candleIndex = i % candleCount;
          const angle = (candleIndex / candleCount) * Math.PI * 2;
          const r = 8;
          x = r * Math.cos(angle);
          y = (Math.random() * 5) + 3;
          z = r * Math.sin(angle);
          // Add a little flame tip
          if (Math.random() > 0.8) y += 2;
        }
        break;
      }
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
  }
  
  return positions;
};
