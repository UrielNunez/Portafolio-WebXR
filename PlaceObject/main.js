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
        const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(renderer.domElement);

        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        scene.add(light);

        //EVENTOS DE SELECCION DE PANTALLA
        {
            const controller = renderer.xr.getController(0);
            scene.add(controller);

            controller.addEventListener("select", () => {
                const geometry = new THREE.BoxGeometry(0.06, 0.06, 0.06);
                const material = new THREE.MeshBasicMaterial({ color: 0xffbff * Math.random() });
                const mesh = new THREE.Mesh(geometry, material);

                //Para poner la posicion un poco alejada de la posicion virtuald el telefono (mejor opcion)
                //se obtiene la posicion virtual del telefono
                const position = new THREE.Vector3();
                position.setFromMatrixPosition(controller.matrixWorld)
                //mesh.position.applyMatrix4(controller.matrixWorld); //PARA PONER EL OBJETO JUSTA EN LA POSICION VIRTUALD EL TELEFONO 
                //se calcula la direccion para que el objeto este un poco mas adelante del telfono
                const direction = new THREE.Vector3(0,0,-1);
                direction.applyQuaternion(controller.quaternion);
                //se mueve el cubo 0.3 metros hacia adelante para que no aparezca tan cerca de la posicion del telfono 
                position.add(direction.multiplyScalar(0.3));
                mesh.position.copy(position);
                
                mesh.quaternion.setFromRotationMatrix(controller.matrixWorld);
                scene.add(mesh);
            });
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