import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DragControls } from 'three/examples/jsm/controls/DragControls.js'

import xSVG from '../x.svg'

const clock = new THREE.Clock()

let orbitControls, dragControls,
  scene, camera, renderer;

const draggableObjects = []

const defaultGeometryParameters = {
  Cube: [10, 10, 10],
  Sphere: [5, 32, 28],
  Square: [10, 10, 0],
  Torus: [5, 2, 16, 100]
}

init()
animate()

function init() {
  // Create a scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#303030')

  // Create a camera
  camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000)

  // Create lighting
  const ambientLight = new THREE.DirectionalLight(0xeeeece)
  ambientLight.position.set(100, 1000, 1000)
  scene.add(ambientLight)
  const spotLight2 = new THREE.SpotLight(0xffffff)
  spotLight2.position.set(-200, -200, -300)
  scene.add(spotLight2)

  // Create renderer
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(800, 600)
  // Append canvas to body
  document.querySelector('.app').insertAdjacentElement('afterbegin', renderer.domElement)

  // Initialize orbit controls
  orbitControls = new OrbitControls(camera, renderer.domElement)

  // Default camera position
  camera.position.set(-10, 20, 30);
  orbitControls.update()

  // Initialize drag controls
  dragControls = new DragControls(draggableObjects, camera, renderer.domElement)
  // Turn off orbitControls while using dragControls to avoid conflict
  dragControls.addEventListener('dragstart', () => {
    orbitControls.enabled = false;
  })

  dragControls.addEventListener('dragend', () => {
    orbitControls.enabled = true;
  })

  // Initialize create new meshes buttons
  document.querySelectorAll('.app__objects-container span').forEach(btn => {
    btn.addEventListener('click', e => {
      // Create new mesh depending on a pressed button
      const meshGeometryType = e.target.innerHTML === 'Cube' || e.target.innerHTML === 'Square' ?
        'Box'
        : e.target.innerHTML
      const geometry = new THREE[`${meshGeometryType}Geometry`](...defaultGeometryParameters[e.target.innerHTML])
      const color = document.querySelector('.color-configurator input').value
      createMesh(geometry, `#${color}`, { x: (Math.random() * 100) - 50, y: (Math.random() * 40) - 20, z: (Math.random() * 40) - 20 })
    })
  })

  // Initialize color configuratior
  document.querySelector('.color-configurator input').addEventListener('input', e => {
    document.querySelector('.color-configurator__color-viewer').style.backgroundColor = `#${e.target.value}`
  })

  // Create cube
  const cubeGeometry = new THREE.BoxGeometry(10, 10, 10)
  createMesh(cubeGeometry, null, { x: -12, y: 0, z: 0 })

  // Create sphere
  const sphereGeometry = new THREE.SphereGeometry(5, 32, 28)
  createMesh(sphereGeometry, null, { x: 0, y: 0, z: 0 })

  // Create square
  const squareGeometry = new THREE.BoxGeometry(10, 10, 0)
  createMesh(squareGeometry, null, { x: 12, y: 0, z: 0 })

  // Create torus
  const torusGeometry = new THREE.TorusGeometry(5, 2, 16, 100)
  createMesh(torusGeometry, null, { x: 26, y: 0, z: 0 })
}

function animate() {
  requestAnimationFrame(animate);

  render();
}

function render() {
  const delta = clock.getDelta();

  orbitControls.update(delta);
  renderer.render(scene, camera)
}

function createMesh(geometry, mColor, position = { x: 0, y: 0, z: 0 }) {
  // Create mesh
  const material = new THREE.MeshPhongMaterial({
    color: !mColor ? 0xffffff : mColor
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.x = position.x
  mesh.position.y = position.y
  mesh.position.z = position.z
  draggableObjects.push(mesh)

  // Create mesh DOM element
  const p = document.createElement('p')
  const meshType = geometry.type.split('Geometry')[0]
  p.innerHTML += `
    ${meshType}
  `
  // Save id to use when removing from DOM
  p.id = mesh.id

  // Create remove mesh button
  const removeButton = document.createElement('img')
  removeButton.className = 'remove-mesh-button'
  removeButton.src = xSVG
  removeButton.alt = ''

  removeButton.addEventListener('click', () => {
    // Remove object from 3d space
    const selectedObject = scene.getObjectById(mesh.id)
    scene.remove(selectedObject)

    animate()

    // Remove object from objects list
    const objectsListContainer = document.querySelector('.app__objects-container__list')
    const objectsListItem = document.getElementById(mesh.id)
    objectsListContainer.removeChild(objectsListItem)
  })

  p.appendChild(removeButton)

  document.querySelector('.app__objects-container__list').appendChild(p)
  scene.add(mesh)
}