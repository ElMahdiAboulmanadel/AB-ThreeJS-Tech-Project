import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useThree, applyProps, useFrame } from '@react-three/fiber'
import { useGLTF, GizmoHelper, GizmoViewport, Center, softShadows, CameraControls, useAnimations } from '@react-three/drei'
import { useControls, buttonGroup } from 'leva'
import { PivotControls } from './pivotControls/index'
import { v4 as uuidv4 } from 'uuid';

softShadows()

function Scene() {
  const ref = useRef()
  const cameraControlsRef = useRef()

  const { camera } = useThree()
  const { attach } = useControls({
    attach: false
  })
  // zoom controls
  const { minDistance, enabled, verticalDragToForward, dollyToCursor, infinityDolly } = useControls({
    zoom: buttonGroup({
      label: 'zoom',
      opts: {
        '+': () => cameraControlsRef.current?.zoom(camera.zoom / 2, true),
        '-': () => cameraControlsRef.current?.zoom(-camera.zoom / 2, true)
      }
    })
  })

  return (
    <>
      <CameraControls
        ref={cameraControlsRef}
        minDistance={minDistance}
        enabled={!attach}
        verticalDragToForward={false}
        dollyToCursor={false}
        infinityDolly={false}
      />
      <ambientLight intensity={0.5} />
      <directionalLight castShadow position={[2.5, 5, 5]} intensity={1.5} shadow-mapSize={[1024, 1024]}>
        <orthographicCamera attach="shadow-camera" args={[-5, 5, 5, -5, 1, 50]} />
      </directionalLight>

      <mesh scale={100} receiveShadow position={[0.75, 0, 1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry />
        <shadowMaterial transparent opacity={0.5} />
      </mesh>


      <PivotControls
        object={attach ? ref : undefined}
        visible={attach}
        rotation={[0, -Math.PI / 2, 0]}
        depthTest={false}
        lineWidth={2}
        anchor={[0, 1, 0]}
      />
      <mesh ref={ref} position={[0, 0, 0]} castShadow receiveShadow>
        <Center top scale={3} position={[0, -20, -10]} castShadow receiveShadow>
          <Robot />
        </Center>
      </mesh>
    </>
  )
};

function Robot(props) {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF('/robot.glb');
  // const { actions } = useAnimations(animations);
  // console.log(actions);
  // useEffect(() => {
  //   actions.animationRunning.play();
  // });
  useMemo(() => {
    // Enable shadows for all meshes
    Object.values(nodes).forEach((node) => node.isMesh && (node.receiveShadow = node.castShadow = true));
    applyProps(materials['M_Robot_Tail'], { color: '#222', roughness: 0.6, roughnessMap: null, normalScale: [4, 4] });
    applyProps(materials['M_Robot_Head'], { color: 'black', roughness: 0, clearcoat: 0.1 });
  }, [nodes, materials]);
  return (
    <group ref={group} {...props} dispose={null}>
      {Object.keys(nodes).map((nodeName) => {
        return (
          <mesh key={nodeName} geometry={nodes[nodeName].geometry} material={materials['M_Robot_Tail']}>
          </mesh>
        )
      })}
    </group>
  );
}


export default function App() {
  return (
    <Canvas
      camera={{ position: [-1, 10, 10], fov: 50 }}
      shadows
      raycaster={{ params: { Line: { threshold: 0.15 } } }}

      style={{ height: '100vh', width: '100vw' }}
    >
      <Scene />
    </Canvas>
  )
}