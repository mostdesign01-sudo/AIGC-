// 门前夜气：尘点 + 薄雾。外景最浓，进楼后收，屋顶再淡一点。
// 不重建整栋三维，只给静帧一层活的空气。
import * as THREE from 'three';

const COUNT = 220;

export function createAtmosphere(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas, alpha: true, antialias: false, powerPreference: 'low-power',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 40);
  cam.position.z = 8;

  const pos = new Float32Array(COUNT * 3);
  const vel = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    seed(i, pos, vel, col);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  const fogGeo = new THREE.PlaneGeometry(24, 14);
  const fogMat = new THREE.MeshBasicMaterial({
    color: 0x071018,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });
  const fog = new THREE.Mesh(fogGeo, fogMat);
  fog.position.z = 3.2;
  scene.add(fog);

  const pointer = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  function seed(i, p, v, c) {
    p[i * 3] = (Math.random() - 0.5) * 16;
    p[i * 3 + 1] = (Math.random() - 0.5) * 9;
    p[i * 3 + 2] = (Math.random() - 0.5) * 6;
    v[i * 3] = (Math.random() - 0.5) * 0.12;
    v[i * 3 + 1] = 0.04 + Math.random() * 0.10;
    v[i * 3 + 2] = (Math.random() - 0.5) * 0.06;
    const aurora = Math.random() > 0.72;
    if (aurora) {
      c[i * 3] = 0.04; c[i * 3 + 1] = 0.76; c[i * 3 + 2] = 0.76;
    } else {
      c[i * 3] = 1.0; c[i * 3 + 1] = 0.86; c[i * 3 + 2] = 0.68;
    }
  }

  function density(p) {
    if (p < 0.145) return 1.0;
    if (p < 0.24) return 0.62;
    if (p < 0.34) return 0.22;
    if (p < 0.44) return 0.16;
    if (p < 0.87) return 0.06;
    return 0.38;
  }

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  return {
    update(p, dt, reduced, enter) {
      if (reduced) {
        canvas.style.opacity = '0';
        return;
      }
      const d = density(p) * (0.35 + 0.65 * enter);
      canvas.style.opacity = String(Math.min(1, d));
      fog.material.opacity = (p < 0.18 ? (0.18 - p) / 0.18 : 0) * 0.48 * enter;
      fog.position.x = pointer.x * 0.25;
      fog.position.y = -pointer.y * 0.12;
      cam.position.x = pointer.x * 0.18;
      cam.position.y = -pointer.y * 0.10;

      const arr = geo.attributes.position.array;
      for (let i = 0; i < COUNT; i++) {
        arr[i * 3] += vel[i * 3] * dt * 4;
        arr[i * 3 + 1] += vel[i * 3 + 1] * dt * 4;
        arr[i * 3 + 2] += vel[i * 3 + 2] * dt * 4;
        if (arr[i * 3 + 1] > 5) {
          arr[i * 3] = (Math.random() - 0.5) * 16;
          arr[i * 3 + 1] = -5;
        }
      }
      geo.attributes.position.needsUpdate = true;
      mat.opacity = 0.22 + d * 0.42;
      renderer.render(scene, cam);
    },
  };
}
