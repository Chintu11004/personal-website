import * as THREE from 'three';

const SPARKLE_POOL_SIZE = 300;
const SPARKLE_LIFETIME = 2.0;
const SPARKLE_SPEED = 0.1;
const SPARKLE_SIZE = 0.1;

export function createSparkleSystem({ scene, clock, vertexShader, fragmentShader }) {
    const positions = new Float32Array(SPARKLE_POOL_SIZE * 3);
    const birthTimes = new Float32Array(SPARKLE_POOL_SIZE);
    const seeds = new Float32Array(SPARKLE_POOL_SIZE);
    const vectors = new Float32Array(SPARKLE_POOL_SIZE * 2);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aBirthTime', new THREE.BufferAttribute(birthTimes, 1));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute('aVector', new THREE.BufferAttribute(vectors, 2));

    const material = new THREE.ShaderMaterial({
        uniforms: {
            u_time: { value: 0 },
            u_lifetime: { value: SPARKLE_LIFETIME },
            u_speed: { value: SPARKLE_SPEED },
            u_size: { value: SPARKLE_SIZE },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    function spawnParticle(i, elapsedTime) {
        positions[i * 3] = (Math.random() - 0.5) * 4;
        positions[i * 3 + 1] = (0.3 * Math.sin(-elapsedTime * 0.2)) + (Math.random() - 0.5) * 0.75;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 1;

        birthTimes[i] = elapsedTime;
        seeds[i] = Math.random();

        const angle = Math.random() * Math.PI * 2;
        vectors[i * 2] = Math.cos(angle);
        vectors[i * 2 + 1] = Math.sin(angle);
    }

    const elapsedTime = clock.getElapsedTime();
    for (let i = 0; i < SPARKLE_POOL_SIZE; i++) {
        spawnParticle(i, elapsedTime - Math.random() * SPARKLE_LIFETIME);
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.aBirthTime.needsUpdate = true;
    geometry.attributes.aSeed.needsUpdate = true;
    geometry.attributes.aVector.needsUpdate = true;

    const points = new THREE.Points(geometry, material);
    points.renderOrder = 1;
    scene.add(points);

    function update(elapsedTime) {
        material.uniforms.u_time.value = elapsedTime;

        let needsRespawn = false;
        for (let i = 0; i < SPARKLE_POOL_SIZE; i++) {
            if (elapsedTime - birthTimes[i] > SPARKLE_LIFETIME) {
                spawnParticle(i, elapsedTime);
                needsRespawn = true;
            }
        }

        if (needsRespawn) {
            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.aBirthTime.needsUpdate = true;
            geometry.attributes.aVector.needsUpdate = true;
        }
    }

    return { points, update };
}
