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
        //EVENTOS DE SELECCION DE PANTALLA
        {
            const controller = renderer.xr.getController(0);
            scene.add(controller);

            controller.addEventListener("select", async () => {
                //3d mdoel
                const gltf = await loadGLTF("../Assets/Modelo.glb");
                gltf.scene.scale.set(1, 1, 1);

                //Para poner la posicion un poco alejada de la posicion virtuald el telefono (mejor opcion)
                //se obtiene la posicion virtual del telefono
                const position = new THREE.Vector3();
                position.setFromMatrixPosition(controller.matrixWorld)
                //mesh.position.applyMatrix4(controller.matrixWorld); //PARA PONER EL OBJETO JUSTA EN LA POSICION VIRTUALD EL TELEFONO 
                //se calcula la direccion para que el objeto este un poco mas adelante del telfono
                const direction = new THREE.Vector3(0, 0, -1);
                direction.applyQuaternion(controller.quaternion);
                //se mueve el cubo 0.3 metros hacia adelante para que no aparezca tan cerca de la posicion del telfono 
                position.add(direction.multiplyScalar(0.3));
                gltf.position.copy(position);

                gltf.quaternion.setFromRotationMatrix(controller.matrixWorld);
                scene.add(gltf.scene);
                //animation
                mixer = new THREE.AnimationMixer(gltf.scene);
                if (gltf.animations && gltf.animations.length > 0) {
                    const action = mixer.clipAction(gltf.animations[0]);
                    action.play();
                }
            });
        }


        //seccion logica de BOTON AR PERSONALIZADO
        let currentSession = null
        {
            const start = async () => {
                currentSession = await navigator.xr.requestSession("immersive-ar", { optionalFeatures: ['dom-overlay'], domOverlay: { root: document.body } });

                if (avisoStart) avisoStart.style.display = "none";
                if (avisoIOS) avisoIOS.style.display = "none";

                if (arButton2) arButton2.style.display = "block";

                renderer.xr.enabled = true;
                renderer.xr.setReferenceSpaceType('local');
                await renderer.xr.setSession(currentSession);

                arButton2.textContent = "End";

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