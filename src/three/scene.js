import * as THREE from 'three';

const CAMERA = {
    frustumSize: 10,
    position: [-0.09479328005746984, 0.01034594383217302, 2.230247723145003],
    target: [0, 0, 0],
    zoom: 6.264789413459975,
};

let navChangeHandler = null;
let iconMeshes = [];
let iconGroup_ref = null;
let camera_ref = null;

export function logIconMeshWorldPositions() {
    if (!iconGroup_ref) {
        console.warn('[debug] iconGroup not initialized yet');
        return [];
    }

    iconGroup_ref.updateMatrixWorld(true);

    const rows = iconGroup_ref.children.map((mesh, i) => {
        const worldPos = new THREE.Vector3();
        mesh.getWorldPosition(worldPos);

        return {
            index: i,
            worldX: worldPos.x,
            worldY: worldPos.y,
            worldZ: worldPos.z,
            localX: mesh.position.x,
            localY: mesh.position.y,
            localZ: mesh.position.z,
            scaleX: mesh.scale.x,
            scaleY: mesh.scale.y,
            visible: mesh.visible,
        };
    });

    console.table(rows);
    return rows;
}

if (typeof window !== 'undefined') {
    window.__debugScene = {
        logIconPositions: logIconMeshWorldPositions,
        get iconMeshes() { return iconMeshes; },
        get iconGroup() { return iconGroup_ref; },
        get camera() { return camera_ref; },
    };
}

export function setNavChangeHandler(fn) {
    navChangeHandler = fn;
}

export async function initScene(container) {
    if (!container) {
        console.error('Container element not found');
        return;
    }

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

    camera_ref = camera;
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
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    let vertexShader, fragmentShader, iconVertexShader, iconFragmentShader;
    try {
        vertexShader = await fetch('/shaders/vertex.glsl').then(res => res.text());
        fragmentShader = await fetch('/shaders/fragment.glsl').then(res => res.text());
        iconVertexShader = await fetch('/shaders/icon-vertex.glsl').then(res => res.text());
        iconFragmentShader = await fetch('shaders/icon-fragment.glsl').then(res => res.text());
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

    // we add the icon meshes now
    const textureLoader = new THREE.TextureLoader();
    const iconGroup = new THREE.Group();
    iconGroup_ref = iconGroup;
    scene.add(iconGroup);

    const navItems = [
        { image: '/images/retroarch.png' },
        { image: '/images/setting.png' },
        { image: '/images/images.png' },
        { image: '/images/Source Code - Various.png' },
        { image: '/images/default-content.png' },
        { image: '/images/wifi.png' },
        { image: '/images/friends.png' },
    ];

    iconMeshes = navItems.map((item) => {
        const texture = textureLoader.load(item.image);
        texture.colorSpace = THREE.SRGBColorSpace;

        const geom = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                u_texture: {value: texture},
                u_opacity: {value: 0.5},
                u_selected: {value: 0.0},
                u_cameraPosition: {value: camera.position},
            },
            vertexShader: iconVertexShader,
            fragmentShader: iconFragmentShader,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
        });

        const mesh = new THREE.Mesh(geom, material);
        mesh.renderOrder = 1; // render after background
        iconGroup.add(mesh);
        return mesh;
    });

    const timer = new THREE.Timer();
    timer.connect(document);

    // const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    // scene.add(ambientLight);

    // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    // directionalLight.position.set(5, 5, 5);
    // scene.add(directionalLight);

    const handleResize = () => {
        updateProjectionMatrix(window.innerWidth, window.innerHeight);
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    function animate(timestamp) {
        requestAnimationFrame(animate);

        timer.update(timestamp);
        shaderMaterial.uniforms.u_time.value = timer.getElapsed();

        renderer.render(scene, camera);
    }

    animate();

    console.log('Scene initialized');
    console.log('[debug] Run __debugScene.logIconPositions() to inspect icon mesh world positions');

    return {
        scene,
        camera,
        renderer,
        cleanup: () => {
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
        }
    };
}

export function syncNavIcons({iconElements, focusCol, focusRow}) {
    if (!camera_ref || iconMeshes.length == 0) return;

    iconElements.forEach((element, i) => {
        if (!element || !iconMeshes[i]) return;

        // get elemnent's screen position
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // convert screen pixels to normalized device coords
        const ndcX = (centerX / window.innerWidth) * 2 - 1;
        const ndcY = -(centerY / window.innerHeight) * 2 + 1;

        // const worldPos = new THREE.Vector3(ndcX, ndcY, 0);
        // worldPos.unproject(camera_ref); // converts it to world pos
        // iconMeshes[i].position.copy(worldPos);
        camera_ref.updateMatrixWorld(true);
        const viewWidth = (camera_ref.right - camera_ref.left) /camera_ref.zoom;
        const viewHeight = (camera_ref.top - camera_ref.bottom) / camera_ref.zoom;

        const offset = new THREE.Vector3(
            ndcX * viewWidth / 2,
            ndcY * viewHeight / 2,
            0
        );
        offset.applyQuaternion(camera_ref.quaternion);

        iconMeshes[i].position.copy(camera_ref.position).add(offset);
        iconMeshes[i].position.z = 0.0; // in front of the background (tpo be decided lmao)

        // scale the element accordingly
        // TODO need to account for zoom
        const worldWidth = rect.width * (camera_ref.right - camera_ref.left) / (window.innerWidth * camera_ref.zoom);
        const worldHeight = rect.height * (camera_ref.top - camera_ref.bottom) / (window.innerHeight * camera_ref.zoom);
        iconMeshes[i].scale.set(worldWidth, worldHeight, 1);

        //update selection state
        const isSelected = i === focusCol;
        //iconMeshes[i].material.uniforms.u_selected.value = isSelected ? 1.0 : 0.0;
        //iconMeshes[i].material.uniforms.u_opacity.value = isSelected ? 0.8 : 0.5;
    });
}
