import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "https://cdn.jsdelivr.net/npm/three@0.154.0/examples/jsm/geometries/TextGeometry.js";

// Initialize Scene, Camera, and Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color("#A2C2E8"); // Set background color to blue
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
camera.position.set(0, 15, 15);
camera.lookAt(0, 0, 0);

// Resize handler
window.addEventListener("resize", () => {
   renderer.setSize(window.innerWidth, window.innerHeight);
   camera.aspect = window.innerWidth / window.innerHeight;
   camera.updateProjectionMatrix();
});

// Create Pac-Man
const pacmanGeometry = new THREE.SphereGeometry(1, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.75);
const pacmanMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
const pacman = new THREE.Mesh(pacmanGeometry, pacmanMaterial);
scene.add(pacman);
pacman.position.y = 0.5;

// Create the platform
const platformGeometry = new THREE.PlaneGeometry(20, 20);
const platformMaterial = new THREE.MeshStandardMaterial({ color: 0xd3d3d3 });
const platform = new THREE.Mesh(platformGeometry, platformMaterial);
platform.rotation.x = -Math.PI / 2;
scene.add(platform);

// Create Letters
const letters = ["G", "L", "A", "C", "O", "M"];
let collectedLetters = [];
let letterMeshes = [];
const letterMaterial = new THREE.MeshStandardMaterial({ color: 0xf207c0 });

function spawnLetters() {
   letters.forEach((letter, index) => {
      const letterGeometry = new TextGeometry(letter, {
         font: new FontLoader().load("https://threejs.org/examples/fonts/helvetiker_regular.typeface.json"),
         size: 1,
         height: 0.1,
      });
      const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);
      letterMesh.position.set(Math.random() * 18 - 9, 1, Math.random() * 18 - 9); // Random position
      letterMesh.userData = { index }; // Store index for order checking
      letterMeshes.push(letterMesh);
      scene.add(letterMesh);
   });
}

spawnLetters(); // Call to spawn letters

// Movement variables
const moveSpeed = 0.1;
const gravity = 0.05;
const keys = {};
let gameStarted = false;
let gameOver = false;

// Event listeners for movement
document.addEventListener("keydown", (e) => {
   if (gameStarted && !gameOver) keys[e.key] = true;
});
document.addEventListener("keyup", (e) => {
   if (gameStarted && !gameOver) keys[e.key] = false;
});

// Movement update function
function updateMovement() {
   if (keys["w"] || keys["ArrowUp"]) pacman.position.z -= moveSpeed;
   if (keys["s"] || keys["ArrowDown"]) pacman.position.z += moveSpeed;
   if (keys["a"] || keys["ArrowLeft"]) pacman.position.x -= moveSpeed;
   if (keys["d"] || keys["ArrowRight"]) pacman.position.x += moveSpeed;

   // Check if Pac-Man is off the platform
   const isOffPlatform = Math.abs(pacman.position.x) > 10 || Math.abs(pacman.position.z) > 10;

   if (pacman.position.y > 0.5 || isOffPlatform) {
      pacman.position.y -= gravity;
   } else {
      pacman.position.y = 0.5;
   }

   if (pacman.position.y < -15) {
      triggerGameOver();
   }

   // Check for collisions with letters
   letterMeshes.forEach((letterMesh) => {
      if (pacman.position.distanceTo(letterMesh.position) < 1.5) {
         handleLetterCollection(letterMesh);
      }
   });
}

// Handle letter collection
function handleLetterCollection(letterMesh) {
   const index = letterMesh.userData.index;
   if (index === collectedLetters.length) {
      collectedLetters.push(letters[index]);
      scene.remove(letterMesh);
      letterMeshes = letterMeshes.filter((mesh) => mesh !== letterMesh);
      if (collectedLetters.length === letters.length) {
         triggerWin();
      }
   } else {
      triggerGameOver();
   }
}

// Trigger game over
function triggerGameOver() {
   gameOver = true;
   pacman.visible = false;
   document.getElementById("loseOverlay").style.display = "block"; // Show the "You Lose" message
}

// Trigger win
function triggerWin() {
   gameOver = true;
   pacman.visible = false;
   document.getElementById("winOverlay").style.display = "block"; // Show the "You Win" message
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
   gameStarted = true;
   document.getElementById("startButton").style.display = "none";
   animate();
});
