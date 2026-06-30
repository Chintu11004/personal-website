import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';

// Initialize the scene
async function init() {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    const container = document.getElementById('container');
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // OrbitControls for camera movement
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 2;
    controls.maxDistance = 10;

    // Load shaders
    let vertexShader, fragmentShader;
    try {
        vertexShader = await fetch('shaders/vertex.glsl').then(res => res.text());
        fragmentShader = await fetch('shaders/fragment.glsl').then(res => res.text());
        console.log('Shaders loaded successfully!');
    } catch (error) {
        console.error('Error loading shaders:', error);
        return;
    }

    // Custom shader material
    const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            u_time: { value: 0.0 },
            u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            u_mouse: { value: new THREE.Vector2(0.0, 0.0) },
            u_cameraPosition: { value: camera.position },
            u_color1: { value: new THREE.Color(0x00ffff) },
            u_color2: { value: new THREE.Color(0xff00ff) },
            u_color3: { value: new THREE.Color(0xffff00) },
            u_noiseScale: { value: 0.5 },
            u_displacement: { value: 0.5 }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        wireframe: false,
        transparent: true,
        side: THREE.DoubleSide,
    });

    const planeGeometry = new THREE.PlaneGeometry(4, 1, 128, 128);
    const plane = new THREE.Mesh(planeGeometry, shaderMaterial);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Mouse tracking
    const mouse = new THREE.Vector2();
    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        shaderMaterial.uniforms.u_mouse.value = mouse;
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
        shaderMaterial.uniforms.u_resolution.value.set(width, height);
    });

    // Animation loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        
        // Update time uniform
        shaderMaterial.uniforms.u_time.value = clock.getElapsedTime();
        
        // Update camera position uniform
        shaderMaterial.uniforms.u_cameraPosition.value.copy(camera.position);

        // Update controls
        controls.update();
        
        // Render scene
        renderer.render(scene, camera);
    }

    animate();
    
    console.log('Scene initialized with plane only');
}

// Start the application
init().catch(error => {
    console.error('Failed to initialize:', error);
});
