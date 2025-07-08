import * as THREE from 'three';


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



        //EVENTOS DE SELECCION DE PANTALLA
        {
            const controller = renderer.xr.getController(0);
            scene.add(controller);
            controller.addEventListener("select", () => {
                const geometry = new THREE.BoxGeometry(0.06, 0.06, 0.06);
                const material = new THREE.MeshBasicMaterial({ color: 0xffbff * Math.random() });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.setFromMatrixPosition(reticle.matrix);
                mesh.scale.y = Math.random() * 2 + 1;
                scene.add(mesh);

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

                renderer.xr.enabled = true;
                renderer.xr.setReferenceSpaceType('local');
                await renderer.xr.setSession(currentSession);

                arButton.textContent = "End";

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