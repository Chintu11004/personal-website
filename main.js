import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';

// Initialize the scene
async function init() {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    const frustumSize = 5;
    const aspect = window.innerWidth / window.innerHeight;

    const perspectiveCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    perspectiveCamera.position.z = 5;

    const orthographicCamera = new THREE.OrthographicCamera(
        -frustumSize * aspect / 2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        -frustumSize / 2,
        0.1,
        1000
    );
    orthographicCamera.position.copy(perspectiveCamera.position);

    let activeCamera = perspectiveCamera;
    let useOrthographic = false;

    function updateProjectionMatrices(width, height) {
        const nextAspect = width / height;

        perspectiveCamera.aspect = nextAspect;
        perspectiveCamera.updateProjectionMatrix();

        orthographicCamera.left = -frustumSize * nextAspect / 2;
        orthographicCamera.right = frustumSize * nextAspect / 2;
        orthographicCamera.top = frustumSize / 2;
        orthographicCamera.bottom = -frustumSize / 2;
        orthographicCamera.updateProjectionMatrix();
    }

    function toggleCamera() {
        const previousCamera = activeCamera;

        useOrthographic = !useOrthographic;
        activeCamera = useOrthographic ? orthographicCamera : perspectiveCamera;

        activeCamera.position.copy(previousCamera.position);
        activeCamera.quaternion.copy(previousCamera.quaternion);

        controls.object = activeCamera;
        controls.update();

        console.log(`Camera: ${useOrthographic ? 'orthographic' : 'perspective'}`);
    }

    updateProjectionMatrices(window.innerWidth, window.innerHeight);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    const container = document.getElementById('container');
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // OrbitControls for camera movement
    const controls = new OrbitControls(activeCamera, renderer.domElement);
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

    const planeWidth = 4;
    const planeHeight = 1;

    // Custom shader material
    const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            u_time: { value: 0.0 },
            u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            u_mouse: { value: new THREE.Vector2(0.0, 0.0) },
            u_cameraPosition: { value: activeCamera.position },
            u_color1: { value: new THREE.Color(0x00ffff) },
            u_color2: { value: new THREE.Color(0xff00ff) },
            u_color3: { value: new THREE.Color(0xffff00) },
            u_noiseScale: { value: 1.0 },
            u_displacement: { value: 0.5 },
            u_amplitude: { value: 0.5 },
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

    window.addEventListener('keydown', (event) => {
        if (event.repeat) return;
        if (event.key === 'c' || event.key === 'C') {
            toggleCamera();
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        updateProjectionMatrices(width, height);
        
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
        shaderMaterial.uniforms.u_cameraPosition.value.copy(activeCamera.position);

        // Update controls
        controls.update();
        
        // Render scene
        renderer.render(scene, activeCamera);
    }

    animate();
    
    console.log('Scene initialized with plane only');
}

// Start the application
init().catch(error => {
    console.error('Failed to initialize:', error);
});
