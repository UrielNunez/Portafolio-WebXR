import * as THREE from 'three';
import { loadGLTF } from '../Assets/loader.js'

document.addEventListener('DOMContentLoaded', () => {
    const initialize = async () => {

        //BOTTON AR PERSONALIZADO 
        const arButton = document.getElementById("ar-button");
        {
            const supported = navigator.xr && navigator.xr.isSessionSupported("immersive-ar");
            if (!supported) {
                arButton.textContent = "Not Supported";
                arButton.disable = true;
                return;
            }
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(renderer.domElement);

        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        scene.add(light);

        // Clock y mixer para animación
        const clock = new THREE.Clock();
        let mixer = null;
        //Modelo 3D creado
        {
            //3d mdoel
            const gltf = await loadGLTF("../Assets/Modelo.glb");
            gltf.scene.scale.set(1, 1, 1);
            gltf.scene.position.set(0, -1, 0);
            scene.add(gltf.scene);
            //animation
            mixer = new THREE.AnimationMixer(gltf.scene);
            if (gltf.animations && gltf.animations.length > 0) {
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
            }

        }


        //seccion logica de BOTON AR PERSONALIZADO
        let currentSession = null
        {
            const start = async () => {
                currentSession = await navigator.xr.requestSession("immersive-ar", { optionalFeatures: ['dom-overlay'], domOverlay: { root: document.body } });

                renderer.xr.enabled = true;
                renderer.xr.setReferenceSpaceType('local');
                await renderer.xr.setSession(currentSession);

                arButton.textContent = "End";

                renderer.setAnimationLoop(() => {
                    const delta = clock.getDelta();
                    if (mixer) mixer.update(delta);
                    renderer.render(scene, camera);
                });
            }
            const end = async () => {
                currentSession.end();
                renderer.clear();
                renderer.setAnimationLoop(null);

                arButton.style.display = "none";
            }
            arButton.addEventListener("click", () => {
                if (currentSession) {
                    end();
                } else {
                    start();
                }
            });
        }

    }
    initialize();
});