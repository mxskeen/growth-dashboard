/**
 * 3D Knowledge Graph using Three.js
 */

let scene, camera, renderer, nodes = [], edges = [];
let animationId = null;

/**
 * Initialize 3D knowledge graph
 */
function initKnowledgeGraph(graphData) {
    const container = document.getElementById('knowledge-graph');
    if (!container) return;
    
    // Check if we have nodes
    if (!graphData.nodes || graphData.nodes.length === 0) {
        container.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted);">
                <p>Solve problems to build your knowledge graph! 🧠</p>
            </div>
        `;
        return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Cancel previous animation
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x161b22);
    
    // Camera
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 15;
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x58a6ff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
    
    // Create nodes
    nodes = [];
    const nodePositions = {};
    const nodeCount = graphData.nodes.length;
    
    graphData.nodes.forEach((nodeData, i) => {
        // Position nodes in a sphere
        const phi = Math.acos(-1 + (2 * i) / nodeCount);
        const theta = Math.sqrt(nodeCount * Math.PI) * phi;
        const radius = 8;
        
        const x = radius * Math.cos(theta) * Math.sin(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);
        const z = radius * Math.cos(phi);
        
        // Node size based on mastery
        const nodeSize = 0.3 + nodeData.mastery * 0.5;
        
        // Node color based on category
        let nodeColor;
        if (nodeData.mastery < 0.3) {
            nodeColor = 0xf85149; // Red - beginner
        } else if (nodeData.mastery < 0.7) {
            nodeColor = 0xd29922; // Yellow - intermediate
        } else {
            nodeColor = 0x3fb950; // Green - mastered
        }
        
        const geometry = new THREE.SphereGeometry(nodeSize, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: nodeColor,
            emissive: nodeColor,
            emissiveIntensity: 0.3,
            shininess: 100,
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.userData = nodeData;
        
        scene.add(mesh);
        nodes.push(mesh);
        nodePositions[nodeData.id] = mesh.position;
    });
    
    // Create edges
    edges = [];
    graphData.edges.forEach(edgeData => {
        const sourcePos = nodePositions[edgeData.source];
        const targetPos = nodePositions[edgeData.target];
        
        if (sourcePos && targetPos) {
            const points = [sourcePos, targetPos];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0x58a6ff,
                opacity: edgeData.strength * 0.5,
                transparent: true,
            });
            
            const line = new THREE.Line(geometry, material);
            scene.add(line);
            edges.push(line);
        }
    });
    
    // Animation
    function animate() {
        animationId = requestAnimationFrame(animate);
        
        // Rotate the scene slowly
        scene.rotation.y += 0.002;
        
        // Pulse nodes
        nodes.forEach((node, i) => {
            const scale = 1 + Math.sin(Date.now() * 0.002 + i) * 0.1;
            node.scale.setScalar(scale);
        });
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });
    
    // Mouse interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        
        scene.rotation.y += deltaX * 0.01;
        scene.rotation.x += deltaY * 0.01;
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    container.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    container.addEventListener('mouseleave', () => {
        isDragging = false;
    });
}
