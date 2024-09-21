// Initialize Scene, Camera, and Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0000ff); // Set background color to blue
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add Lighting
const light = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

// Adjust the Camera Position and Look At
camera.position.set(0, 15, 15); // Position the camera higher and further back
camera.lookAt(0, 0, 0); // Point the camera towards the center of the scene

// Resize handler
window.addEventListener("resize", () => {
   renderer.setSize(window.innerWidth, window.innerHeight);
   camera.aspect = window.innerWidth / window.innerHeight;
   camera.updateProjectionMatrix();
});

// Create Pac-Man
const pacmanGeometry = new THREE.SphereGeometry(1, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.75);
const pacmanMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 }); // Yellow color for Pac-Man
const pacman = new THREE.Mesh(pacmanGeometry, pacmanMaterial);
scene.add(pacman);
pacman.position.y = 0.5;

// Create the platform
const platformGeometry = new THREE.PlaneGeometry(20, 20);
const platformMaterial = new THREE.MeshStandardMaterial({ color: 0xd3d3d3 }); // Light gray color for platform
const platform = new THREE.Mesh(platformGeometry, platformMaterial);
platform.rotation.x = -Math.PI / 2;
scene.add(platform);

// Movement variables
const moveSpeed = 0.1;
const gravity = 0.05; // Gravity force
const keys = {};
let gameStarted = false; // Flag to track if the game has started
let gameOver = false; // Flag to track if the game is over

// Event listeners for movement
document.addEventListener("keydown", (e) => {
   if (gameStarted && !gameOver) keys[e.key] = true;
});
document.addEventListener("keyup", (e) => {
   if (gameStarted && !gameOver) keys[e.key] = false;
});

// Movement update function
function updateMovement() {
   // Apply movement
   if (keys["w"] || keys["ArrowUp"]) pacman.position.z -= moveSpeed;
   if (keys["s"] || keys["ArrowDown"]) pacman.position.z += moveSpeed;
   if (keys["a"] || keys["ArrowLeft"]) pacman.position.x -= moveSpeed;
   if (keys["d"] || keys["ArrowRight"]) pacman.position.x += moveSpeed;

   // Check if Pac-Man is off the platform
   const isOffPlatform = Math.abs(pacman.position.x) > 10 || Math.abs(pacman.position.z) > 10;

   // Apply gravity if Pac-Man is above the platform height or is off the platform
   if (pacman.position.y > 0.5 || isOffPlatform) {
      pacman.position.y -= gravity; // Apply gravity to make Pac-Man fall
   } else {
      pacman.position.y = 0.5; // Keep Pac-Man at platform level if it's within bounds
   }

   if (pacman.position.y < -15) {
      triggerGameOver();
   }
}
// Trigger game over, show overlay, and remove Pac-Man
function triggerGameOver() {
   gameOver = true; // Set the game as over
   pacman.visible = false; // Hide Pac-Man to simulate explosion
   document.getElementById("loseOverlay").style.display = "block"; // Show the "You Lose" message
}

// Animate the scene
function animate() {
   if (!gameOver) {
      requestAnimationFrame(animate);
      updateMovement();
      renderer.render(scene, camera);
   }
}

// Start button functionality
document.getElementById("startButton").addEventListener("click", () => {
   gameStarted = true; // Set the game as started
   document.getElementById("startButton").style.display = "none"; // Hide the start button
   animate(); // Start the animation loop
});
