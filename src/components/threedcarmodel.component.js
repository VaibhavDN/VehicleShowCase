import React, {useState, useEffect, useRef, useMemo} from 'react'
import ReactDOM from 'react-dom'
import * as firebase from 'firebase'
import { Canvas, useLoader, useFrame } from 'react-three-fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Suspense } from 'react'
import * as THREE from "three"
import { OrbitControls } from "drei"
import "../CSS/threedcarmodel.css"

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    
}

firebase.initializeApp(firebaseConfig)

function Loading() {
    const mesh = useRef()
    useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.01))

    return (
        <mesh visible position={[0, 0, 0]} rotation={[0, 0, 0]} ref={mesh}>
            <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
            <meshStandardMaterial
                attach="material"
                transparent
                color="#2AA"
                opacity={0.8}
                roughness={0}
                metalness={0.2}
            />
        </mesh>
    )
}

const ShowCarName = props => {
    //console.log(props.carName)
    return(
        <div>
            <h5 className="vehicleNameHeading"> Vehicle Name: {props.carName} </h5>
            Scroll/Pinch to zoom in/out
        </div>
    )
}

const RenderCar = (props) => {
    const { scene, animations } = useLoader(GLTFLoader, "carModels/" + props.carName + "/scene.gltf") //props.carName
    console.log("Car Rendered: ",  props.carName)
    console.log('Scene: ', scene)
    console.log('Animations: ', animations)

    const mixer = useMemo(() => new THREE.AnimationMixer(scene), [animations])
    
    useEffect(() => animations.forEach(clip => mixer.clipAction(clip).play()), [])

    return <primitive object={scene} />
}

const ShowCar = props => {
    //TODO: Find a better way this is very inefficient
    const [lightInt, setLightInt] = useState(2)
    const [carSelected, setCarSelected] = useState("polestar 1")
    const [cameraZoom, setCameraZoom] = useState(25)
    const [carList, setCarList] = useState([])
    const [objsize, setObjsize] = useState(0)
    const [carStats, setCarStats] = useState({
        bhp: 0.0,
        mileage: 0.0,
        engine: 0.0,
        seats: 0,
        transmission: "automatic",
    })

    let newObjSize = Object.keys(props.carConfig).length
    console.log("props ", props.carConfig, newObjSize)

    if(newObjSize != objsize){
        setObjsize(newObjSize)
    }

    useEffect(()=>{
        setCarList(Object.keys(props.carConfig))

        let list = Object.keys(props.carConfig)
        setCarList(list)
        console.log("Car: ", list)

        if(objsize != 0){
            let carConfig = props.carConfig
            console.log(carSelected)
            let configData = carConfig[carSelected]
            console.log("configData: ", configData)
            let lightIntValue = configData['light_intensity']
            let zoomValue = configData['zoom']
            console.log("light_intensity: ", lightIntValue, "Zoom: ", zoomValue)
            let bhp = configData['bhp']
            let engine = configData['engine']
            let mileage = configData['mileage']
            let transmission = configData['transmission']
            let seats = configData['seats']
    
            setLightInt(lightIntValue)
            setCameraZoom(zoomValue)
            setCarStats({
                bhp: bhp,
                engine: engine,
                mileage: mileage,
                transmission: transmission,
                seats: seats
            })
        }
    }, [objsize, carSelected])

    function filterFunction(){
        let input = document.getElementById("filterCarSelectList")
        let filter = input.value.toUpperCase()
        let li = document.getElementsByTagName("li")

        for(let itr=0; itr < li.length; itr++){
            let text = li[itr].textContent || li[itr].innerText

            if( text.toUpperCase().indexOf(filter) !== -1 ){
                li[itr].style.display = ""
            } 
            else{
                li[itr].style.display = "none"
            }
        }
    }

    function setNewCarItem(event){
        let selectedCarItem = event.target.textContent
        console.log("SelectedCar onClick: ", selectedCarItem)
        setCarSelected(selectedCarItem.toString())
    }

    const carListItems = carList.map((carItem)=>{
        return (
            <li key={carItem} onClick={setNewCarItem}>
                {carItem}
            </li>
        )
    })

    console.log("cameraZoom: ", cameraZoom)

    let zoomlevel = parseInt(window.innerWidth/ cameraZoom)
    let cameraConfig = { zoom: 1*zoomlevel+19, position: [80, 50, 200] }
    console.log("cz: ", cameraConfig.zoom)

    return(
        <div>
            <div className="headDiv row">
                <h4>Vehicle Showcase</h4>
            </div>
            <div className="row">
                <div className="col-* listDiv">
                    <input type="text" id="filterCarSelectList" onKeyUp={filterFunction} placeholder="Search for the vehicle..."/>
                    <ul id="carSelectList">
                        {carListItems}
                    </ul>    
                </div>
                
                <div className="col-* showCarDiv">
                    <div>
                        <ShowCarName carName={carSelected}/>
                    </div>
                    <center>
                    <Canvas style={{ height:window.innerHeight/1.5, width:window.innerWidth/2, zoom: 1, backgroundColor:"#EEE" }} orthographic camera={cameraConfig}>
                        <ambientLight />
                        <directionalLight intensity={lightInt} position={[0, 0, -45]} />
                        <directionalLight intensity={lightInt} position={[0, 0, -135]} />
                        <directionalLight intensity={lightInt} position={[45, 0, 0]} />
                        <directionalLight intensity={lightInt} position={[135, 0, 0]} />
                        <directionalLight intensity={lightInt} position={[-45, 0, 0]} />
                        <directionalLight intensity={lightInt} position={[-135, 0, 0]} />
                        <directionalLight intensity={lightInt} position={[0, 45, 0]} />
                        <directionalLight intensity={lightInt} position={[0, 135, 0]} />
                        <directionalLight intensity={lightInt} position={[0, 0, 45]} />
                        <directionalLight intensity={lightInt} position={[0, 0, 135]} />
                        <directionalLight intensity={lightInt} position={[0, 0, -45]} />
                        <directionalLight intensity={lightInt} position={[0, 0, -135]} />
                        <rectAreaLight
                            width={3}
                            height={3}
                            color={"#FFF"}
                            intensity={10}
                            position={[-2, 0, 5]}
                            lookAt={[0, 0, 0]}
                            penumbra={1}
                            castShadow
                        />

                        <OrbitControls />
                        <camera position={[0, 100, 100]} />

                        <Suspense fallback={<Loading/>}>
                            <RenderCar carName={carSelected} />
                        </Suspense>
                    </Canvas>
                    </center>
                </div>

                <div className="col-* statDiv">
                    <center>
                        <h5>Stats</h5>
                        <div className="vehicleStats">
                            <div>Car name: <span className="vehicleStatsValues"> {carSelected} </span></div>
                            <div>BHP: <span className="vehicleStatsValues"> {carStats.bhp} </span></div>
                            <div>Engine: <span className="vehicleStatsValues"> {carStats.engine} cc </span></div>
                            <div>Mileage: <span className="vehicleStatsValues"> {carStats.mileage} per litre </span></div>
                            <div>Seats: <span className="vehicleStatsValues"> {carStats.seats} </span></div>
                            <div>Transmission: <span className="vehicleStatsValues"> {carStats.transmission} </span></div>
                        </div>
                    </center>
                </div>
            </div>
        </div>
    )
}

const ShowDetails = props =>{
    const [carName, setcarName] = useState('cyberpunk2077')
    let allCarsObj = props.allCars
    //console.log(allCarsObj)
    let carConfig = allCarsObj
    console.log("allCarObj", carConfig, carName)
    
    return(
        <div>
            <ShowCar carName={carName} carConfig={carConfig}/>
        </div>
    )
}


const CarModels = ()=>{
    const [carDetailsStr, setCarDetailsStr] = useState({})
    let carStr = {}
    let databaseRef = firebase.database().ref('/')

    useEffect(()=>{
        databaseRef.on('value', (snapshot)=>{
            snapshot.forEach((child)=>{
                let _key = child.key
                let _value = child.val()
                //console.log(_key, JSON.stringify(_value))
                carStr[_key] = _value
            })
            setCarDetailsStr(carStr)
        })
    }, [])

    //console.log("carObj: ", carDetailsStr)

    return(
        <div>
            <ShowDetails allCars={carDetailsStr}/>
        </div>
    )
    /*
    return(
        <div>
            <div>
                <CarName carModel="P911GT"/>
            </div>
            <div>
                <ShowThreeDModel/>
            </div>
            
        </div>
    )
    */
}

ReactDOM.render(<CarModels/>, document.getElementById('root'))

export default CarModels