import * as THREE from 'three';
import { loadGLTF } from '../Assets/loader.js'

document.addEventListener('DOMContentLoaded', () => {
    const initialize = async () => {

        //BOTTON AR PERSONALIZADO 
        const arButton = document.getElementById("ar-button");
        const avisoStart = document.getElementById("webar-notice");
        const avisoIOS = document.getElementById("button");
        const arButton2 = document.getElementById("ar-button2");

        if (arButton2) arButton2.style.display = "none";
        {
            const supported = navigator.xr && navigator.xr.isSessionSupported("immersive-ar");
            if (!supported) {
                arButton.textContent = "Not Supported";
                arButton.disable = true;
                return;
            }
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera();
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(renderer.domElement);

        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        scene.add(light);

        const reticleGeometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
        const reticleMaterial = new THREE.MeshBasicMaterial();
        const reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
        reticle.matrixAutoUpdate = false;
        reticle.visible = false;
        scene.add(reticle);


        // Clock y mixer para animación
        const clock = new THREE.Clock();
        const mixers = [];
        //EVENTOS DE SELECCION DE PANTALLA
        {
            const controller = renderer.xr.getController(0);
            scene.add(controller);
            controller.addEventListener("select", async () => {
                const gltf = await loadGLTF("../Assets/Modelo.glb");
                gltf.scene.scale.set(0.25, 0.25, 0.25);

                gltf.scene.position.setFromMatrixPosition(reticle.matrix);
                scene.add(gltf.scene);

                //animation
                // Crear y guardar mixer
                const mixer = new THREE.AnimationMixer(gltf.scene); // ✅ variable local
                if (gltf.animations && gltf.animations.length > 0) {
                    const action = mixer.clipAction(gltf.animations[0]);
                    action.play();
                }
                mixers.push(mixer); // ✅ lo agregamos al array

            });
        }
        renderer.xr.addEventListener("sessionstart", async (e) => {
            const session = renderer.xr.getSession();

            const viewerReferenceSpace = await session.requestReferenceSpace("viewer");
            const hitTestSource = await session.requestHitTestSource({ space: viewerReferenceSpace });

            renderer.setAnimationLoop((timestamp, frame) => {
                if (!frame) return;
                const hitTestResults = frame.getHitTestResults(hitTestSource);
                if (hitTestResults.length) {
                    const hit = hitTestResults[0];
                    const referenceSpace = renderer.xr.getReferenceSpace();
                    const hitPose = hit.getPose(referenceSpace);
                    reticle.visible = true;
                    reticle.matrix.fromArray(hitPose.transform.matrix);
                } else {
                    reticle.visible = false;
                }

                const delta = clock.getDelta();
                // ✅ actualiza todas las animaciones activas
                for (const mixer of mixers) {
                    mixer.update(delta);
                }
                renderer.render(scene, camera);
            });
        });
        renderer.xr.addEventListener("sessionend", async () => {

        });


        //seccion logica de BOTON AR PERSONALIZADO
        let currentSession = null
        {
            const start = async () => {
                currentSession = await navigator.xr.requestSession("immersive-ar", { requiredFeatures: ['hit-test'], optionalFeatures: ['dom-overlay'], domOverlay: { root: document.body } });

                if (avisoStart) avisoStart.style.display = "none";
                if (avisoIOS) avisoIOS.style.display = "none";

                if (arButton2) arButton2.style.display = "block";
                renderer.xr.enabled = true;
                renderer.xr.setReferenceSpaceType('local');
                await renderer.xr.setSession(currentSession);

                arButton2.textContent = "End";

            }
            const end = async () => {
                currentSession.end();
                renderer.clear();
                renderer.setAnimationLoop(null);

                arButton2.style.display = "none";
                window.location.href = "../index.html"
            }
            arButton.addEventListener("click", () => {
                if (currentSession) {
                    end();
                } else {
                    start();
                }
            });
            arButton2.addEventListener("click", () => {
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