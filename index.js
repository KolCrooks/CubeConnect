var container;
var camera, scene, renderer, controls;
var points, vel, wireframe, lines;
var linesGeometry, pointsGeometry, frameGeometry;
var cubeLength = 1000;
var pointSize = 15;
var threshold = 2000;

window.onload = () => {
  init();
  animate();
};

function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  container = document.getElementById("container");

  //Camera Stuff
  camera = new THREE.PerspectiveCamera(
    27,
    window.innerWidth / window.innerHeight,
    5,
    10000
  );
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  camera.position.z = 2750;
  camera.position.x = 2750;
  camera.position.y = 1750;
  controls.target.x = cubeLength / 2;
  controls.target.y = cubeLength / 2;
  controls.target.z = cubeLength / 2;
  controls.autoRotate = true;
  controls.update();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);

  //Points stuff
  pointsGeometry = new THREE.BufferGeometry();
  let particles = 100;
  var positions = [];
  var colors = [];
  vel = [];
  var color = new THREE.Color();
  for (var i = 0; i < particles; i++) {
    // positions
    var x = Math.random() * cubeLength;
    var y = Math.random() * cubeLength;
    var z = Math.random() * cubeLength;
    positions.push(x, y, z);
    // colors
    var vx = x / cubeLength + 0.5;
    var vy = y / cubeLength + 0.5;
    var vz = z / cubeLength + 0.5;
    color.setRGB(vx, vy, vz);
    colors.push(color.r, color.g, color.b);
    //velocities
    let speed = 5;
    vel.push(speed, speed, speed);
  }
  pointsGeometry.addAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  pointsGeometry.addAttribute(
    "color",
    new THREE.Float32BufferAttribute(colors, 3)
  );
  pointsGeometry.computeBoundingSphere();
  //
  var material = new THREE.PointsMaterial({
    size: pointSize,
    vertexColors: THREE.VertexColors
  });
  points = new THREE.Points(pointsGeometry, material);
  scene.add(points);

  //Box frame stuff
  frameGeometry = new THREE.BoxGeometry(cubeLength, cubeLength, cubeLength);
  frameGeometry.computeBoundingSphere();
  var geo = new THREE.EdgesGeometry(frameGeometry); // or WireframeGeometry( geometry )

  var mat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });

  wireframe = new THREE.LineSegments(geo, mat);
  wireframe.position.set(cubeLength / 2, cubeLength / 2, cubeLength / 2);
  //   scene.add(wireframe);

  //Line stuff
  var maxLines = new Float32Array(particles * 6 * particles);
  var maxColors = new Float32Array(particles * 3 * particles);

  linesGeometry = new THREE.BufferGeometry();
  linesGeometry.addAttribute(
    "position",
    new THREE.Float32BufferAttribute(maxLines, 3)
  );
  linesGeometry.addAttribute(
    "color",
    new THREE.Float32BufferAttribute(maxColors, 3)
  );
  linesGeometry.setDrawRange(0, 0);
  lines = new THREE.LineSegments(linesGeometry, material);

  scene.add(lines);
  //
  container.appendChild(renderer.domElement);

  //
  window.addEventListener("resize", onWindowResize, false);
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
//
function animate() {
  requestAnimationFrame(animate);
  render();
}
function render() {
  let p = points.geometry.attributes.position.array;
  let linesToDraw = [];
  let colors = [];

  for (let i = 0; i < p.length; i += 3) {
    for (let ii = 0; ii < 3; ii++) {
      if (p[i + ii] > cubeLength || p[i + ii] < pointSize) vel[i + ii] *= -1;
      p[i + ii] += vel[i + ii];
    }
    for (let j = 0; j < p.length; j += 3) {
      if (i != j) {
        let distanceX = Math.abs(p[i] - p[j]);
        let distanceY = Math.abs(p[i + 1] - p[j + 1]);
        let distanceZ = Math.abs(p[i + 2] - p[j + 2]);
        if (
          distanceX < threshold &&
          distanceY < threshold &&
          distanceZ < threshold
        ) {
          let color = Math.max(
            255 - Math.floor(distanceX + distanceY + distanceZ),
            0
          );
          linesToDraw.push(p[i], p[i + 1], p[i + 2], p[j], p[j + 1], p[j + 2]);
          colors.push(color, 255, 255);
        }
      }
    }
  }
  lines.geometry.attributes.position.array.length = linesToDraw.length;
  for (let i = 0; i < linesToDraw.length / 3; i++) {
    lines.geometry.attributes.position.array[i] = linesToDraw[i];
    lines.geometry.attributes.position.array[i + 1] = linesToDraw[i + 1];
    lines.geometry.attributes.position.array[i + 2] = linesToDraw[i + 2];
    lines.geometry.attributes.position.array[i + 3] = linesToDraw[i + 3];
    lines.geometry.attributes.position.array[i + 4] = linesToDraw[i + 4];
    lines.geometry.attributes.position.array[i + 5] = linesToDraw[i + 5];

    lines.geometry.attributes.color.array[i] = colors[i];
    lines.geometry.attributes.color.array[i] = colors[i + 1];
    lines.geometry.attributes.color.array[i] = colors[i + 2];
  }

  points.geometry.attributes.position.needsUpdate = true;

  lines.geometry.attributes.position.needsUpdate = true;
  lines.geometry.attributes.color.needsUpdate = true;
  lines.geometry.setDrawRange(0, linesToDraw.length);

  points.geometry.computeBoundingSphere();
  lines.geometry.computeBoundingSphere();
  controls.update();
  renderer.render(scene, camera);
}

function removeEntity(object) {
  var selectedObject = scene.getObjectByName(object.name);
  scene.remove(selectedObject);
  animate();
}
