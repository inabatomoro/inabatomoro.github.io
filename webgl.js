/* ============================================================
   STUDIO WORKS — WebGL background (Three.js)
   マウスに反応するパーティクル地形。
   reduced-motion / WebGL非対応環境では静かに無効化される。
   ============================================================ */
import * as THREE from 'three';

const canvas = document.getElementById('gl');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas && !reduced) {
    try {
        init();
    } catch (err) {
        console.warn('WebGL background disabled:', err);
        canvas.style.display = 'none';
    }
}

function init() {
    const isMobile = window.innerWidth <= 768;

    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance'
    });
    const DPR = Math.min(window.devicePixelRatio || 1, 1.8);
    renderer.setPixelRatio(DPR);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 5.4, 14);

    /* ---------- Particle grid ---------- */
    const COLS = isMobile ? 130 : 240;
    const ROWS = isMobile ? 85 : 150;
    const WIDTH = 46;
    const DEPTH = 30;
    const COUNT = COLS * ROWS;

    const positions = new Float32Array(COUNT * 3);
    const rands = new Float32Array(COUNT);
    let i = 0;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            positions[i * 3] = (c / (COLS - 1) - 0.5) * WIDTH;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = (r / (ROWS - 1) - 0.5) * DEPTH;
            rands[i] = Math.random();
            i++;
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aRand', new THREE.BufferAttribute(rands, 1));

    const uniforms = {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector3(0, 0, 0) },
        uHover: { value: 0 },
        uFade: { value: 1 },
        uPR: { value: DPR },
        uColorA: { value: new THREE.Color(0xEFEAE3) },
        uColorB: { value: new THREE.Color(0xFF0A6B) }
    };

    const material = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */`
            uniform float uTime;
            uniform vec3 uMouse;
            uniform float uHover;
            uniform float uPR;
            attribute float aRand;
            varying float vElev;
            varying float vRand;

            vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
            float snoise(vec2 v){
                const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy));
                vec2 x0 = v - i + dot(i, C.xx);
                vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod(i, 289.0);
                vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m; m = m*m;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
                vec3 g;
                g.x  = a0.x * x0.x + h.x * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            void main(){
                vec3 pos = position;
                float t = uTime * 0.16;

                float n  = snoise(vec2(pos.x * 0.10 + t, pos.z * 0.12 - t * 0.7));
                float n2 = snoise(vec2(pos.x * 0.035 - t * 0.4, pos.z * 0.045 + t * 0.2));
                float elev = n * 0.9 + n2 * 2.4;

                float d = distance(pos.xz, uMouse.xz);
                float influence = exp(-d * d * 0.045) * uHover;
                elev += influence * (sin(uTime * 2.4 - d * 1.1) * 0.6 + 1.6);

                pos.y += elev;
                vElev = elev;
                vRand = aRand;

                vec4 mv = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mv;
                gl_PointSize = (1.1 + aRand * 1.6) * uPR * (26.0 / -mv.z);
            }
        `,
        fragmentShader: /* glsl */`
            uniform vec3 uColorA;
            uniform vec3 uColorB;
            uniform float uFade;
            varying float vElev;
            varying float vRand;

            void main(){
                vec2 uv = gl_PointCoord - 0.5;
                float r = length(uv);
                if (r > 0.5) discard;
                float alpha = smoothstep(0.5, 0.1, r);
                float h = clamp((vElev + 2.0) / 5.0, 0.0, 1.0);
                vec3 col = mix(uColorA * 0.55, uColorA, h);
                if (vRand > 0.965) col = mix(uColorB, vec3(1.0), 0.15);
                gl_FragColor = vec4(col, alpha * (0.30 + h * 0.5) * uFade);
            }
        `
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    /* ---------- Pointer → world position (y=0 平面へレイキャスト) ---------- */
    const pointerNDC = new THREE.Vector2(0, 0);
    const mouseTarget = new THREE.Vector3(0, 0, 0);
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    let hoverTarget = 0;

    window.addEventListener('pointermove', (e) => {
        pointerNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointerNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(pointerNDC, camera);
        const hit = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(plane, hit)) {
            mouseTarget.copy(hit);
            hoverTarget = 1;
        }
    }, { passive: true });

    document.addEventListener('mouseleave', () => { hoverTarget = 0; });

    /* ---------- Resize ---------- */
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    /* ---------- Render loop ---------- */
    const clock = new THREE.Clock();
    let firstFrame = true;

    function frame() {
        requestAnimationFrame(frame);
        if (document.hidden) return;

        const dt = Math.min(clock.getDelta(), 0.05);
        uniforms.uTime.value += dt;

        // マウス位置とホバー量をなめらかに追従
        uniforms.uMouse.value.lerp(mouseTarget, 0.08);
        uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * 0.05;

        // スクロールに応じてカメラが沈み、パーティクルは減光する
        const doc = document.documentElement;
        const scrollP = doc.scrollTop / Math.max(1, doc.scrollHeight - window.innerHeight);
        const t = uniforms.uTime.value;
        camera.position.x = Math.sin(t * 0.05) * 0.6 + pointerNDC.x * 0.7;
        camera.position.y = 5.4 - scrollP * 1.6 + pointerNDC.y * 0.3;
        camera.lookAt(0, 0.3, 0);
        uniforms.uFade.value = 1 - scrollP * 0.5;

        renderer.render(scene, camera);

        if (firstFrame) {
            firstFrame = false;
            document.body.classList.add('gl-ready');
        }
    }

    canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        canvas.style.display = 'none';
    });

    frame();
}
