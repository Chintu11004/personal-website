import * as THREE from 'three';
//import { createSparkleSystem } from './sparkles.js';

const CAMERA = {
    frustumSize: 10,
    position: [-0.09479328005746984, 0.01034594383217302, 2.230247723145003],
    target: [0, 0, 0],
    zoom: 6.264789413459975,
};

async function init() {
    const scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(
        -CAMERA.frustumSize * aspect / 2,
        CAMERA.frustumSize * aspect / 2,
        CAMERA.frustumSize / 2,
        -CAMERA.frustumSize / 2,
        0.1,
        1000
    );
    camera.position.set(...CAMERA.position);
    camera.lookAt(...CAMERA.target);
    camera.zoom = CAMERA.zoom;

    function updateProjectionMatrix(width, height) {
        const nextAspect = width / height;
        camera.left = -CAMERA.frustumSize * nextAspect / 2;
        camera.right = CAMERA.frustumSize * nextAspect / 2;
        camera.top = CAMERA.frustumSize / 2;
        camera.bottom = -CAMERA.frustumSize / 2;
        camera.updateProjectionMatrix();
    }

    updateProjectionMatrix(window.innerWidth, window.innerHeight);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    const container = document.getElementById('container');
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    let vertexShader, fragmentShader, vertexSimpleShader;
    try {
        vertexShader = await fetch('shaders/vertex.glsl').then(res => res.text());
        fragmentShader = await fetch('shaders/fragment.glsl').then(res => res.text());
        vertexSimpleShader = await fetch('shaders/vertex-simple.glsl').then(res => res.text());
        console.log('Shaders loaded successfully!');
    } catch (error) {
        console.error('Error loading shaders:', error);
        return;
    }

    const planeWidth = 4;
    const planeHeight = 1;

    const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            u_time: { value: 0.0 },
            u_cameraPosition: { value: camera.position },
            u_fresnelBias: { value: -0.05 },
            u_noiseScale: { value: new THREE.Vector3(0.5, 0.8, 1.0) },
            u_displacement: { value: 0.8 },
            u_amplitude: { value: 0.3 },
            u_planeWidth: { value: planeWidth }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        wireframe: false,
        transparent: true,
        side: THREE.DoubleSide,
    });

    const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 128, 128);
    const plane = new THREE.Mesh(planeGeometry, shaderMaterial);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    const sphereShaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            u_cameraPosition: { value: camera.position },
            u_fresnelBias: { value: 0.04 }
        },
        vertexShader: vertexSimpleShader,
        fragmentShader: fragmentShader,
        wireframe: false,
        transparent: true,
        side: THREE.DoubleSide,
    });

    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphere = new THREE.Mesh(sphereGeometry, sphereShaderMaterial);
    sphere.position.set(3, 2, 0);
    scene.add(sphere);

    const timer = new THREE.Timer();
    timer.connect(document);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    window.addEventListener('resize', () => {
        updateProjectionMatrix(window.innerWidth, window.innerHeight);
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate(timestamp) {
        requestAnimationFrame(animate);

        timer.update(timestamp);
        shaderMaterial.uniforms.u_time.value = timer.getElapsed();

        renderer.render(scene, camera);
    }

    animate();

    console.log('Scene initialized');
}

init().catch(error => {
    console.error('Failed to initialize:', error);
});
