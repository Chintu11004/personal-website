import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { navItems } from '../navItems';
import { collectNavTextureUrls } from './collectNavTextureUrls';

export function preloadNavTextures() {
  for (const url of collectNavTextureUrls(navItems)) {
    useLoader.preload(THREE.TextureLoader, url);
  }
}
