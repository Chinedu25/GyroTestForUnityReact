import React, { useEffect, useState } from "react";
import Unity, { UnityContext } from "react-unity-webgl";
import { setTimeout } from "timers/promises";
import webglStyles from "./webgl.module.css";

const unityContext = new UnityContext({
  loaderUrl: "/Build/Gyro.loader.js",
  dataUrl: "/Build/Gyro.data",
  frameworkUrl: "/Build/Gyro.framework.js",
  codeUrl: "/Build/Gyro.wasm",
});

function App() {
  // function spawnEnemies() {
  //   unityContext.send("GameController", "SpawnEnemies", 100);
  // }

  function orient(aa: { x: any; y: any; z: any; a: number }) {
    var x = aa.x,
      y = aa.y,
      z = aa.z,
      a = aa.a,
      c = Math.cos(aa.a),
      s = Math.sin(aa.a),
      t = 1 - c,
      // axis-angle to rotation matrix
      rm00 = c + x * x * t,
      rm10 = z * s + y * x * t,
      rm20 = -y * s + z * x * t,
      rm01 = -z * s + x * y * t,
      rm11 = c + y * y * t,
      rm21 = x * s + z * y * t,
      rm02 = y * s + x * z * t,
      rm12 = -x * s + y * z * t,
      rm22 = c + z * z * t,
      TO_DEG = 180 / Math.PI,
      ea = [],
      n = Math.sqrt(rm22 * rm22 + rm20 * rm20);

    // rotation matrix to Euler angles
    ea[1] = Math.atan2(-rm21, n);

    if (n > 0.001) {
      ea[0] = Math.atan2(rm01, rm11);
      ea[2] = Math.atan2(rm20, rm22);
    } else {
      ea[0] = 0;
      ea[2] = (rm21 > 0 ? 1 : -1) * Math.atan2(-rm10, rm00);
    }

    return {
      alpha: -ea[0] * TO_DEG - 180,
      beta: -ea[1] * TO_DEG,
      gamma: ea[2] * TO_DEG,
    };
  }

  var degtorad = Math.PI / 180; // Degree-to-Radian conversion

  function getQuaternion(
    alpha: number | null,
    beta: number | null,
    gamma: number | null
  ) {
    var _x = beta ? beta * degtorad : 0; // beta value
    var _y = gamma ? gamma * degtorad : 0; // gamma value
    var _z = alpha ? alpha * degtorad : 0; // alpha value

    var cX = Math.cos(_x / 2);
    var cY = Math.cos(_y / 2);
    var cZ = Math.cos(_z / 2);
    var sX = Math.sin(_x / 2);
    var sY = Math.sin(_y / 2);
    var sZ = Math.sin(_z / 2);

    //
    // ZXY quaternion construction.
    //

    var w = cX * cY * cZ - sX * sY * sZ;
    var x = sX * cY * cZ - cX * sY * sZ;
    var y = cX * sY * cZ + sX * cY * sZ;
    var z = cX * cY * sZ + sX * sY * cZ;

    var result: string =
      w.toString() +
      ";" +
      x.toString() +
      ";" +
      y.toString() +
      ";" +
      z.toString();
    //return [ w, x, y, z ];

    return result;
  }
  function testDeviceOrientation() {
    if (typeof window.DeviceOrientationEvent !== "function") {
      unityContext.send("GameManager", "GetDeviceZXYQuaternion", "2;2;2;2");
      //return "DeviceOrientationEvent not detected";
    }
    else if (
      typeof (window.DeviceOrientationEvent as any).requestPermission !==
      "function"
    ) {
      unityContext.send("GameManager", "GetDeviceZXYQuaternion", "0;0;0;0");
      //return "DeviceOrientationEvent.requestPermission not detected";
    }
else{
    (window.DeviceOrientationEvent as any)
      .requestPermission()
      .then(function (result: any) {
        unityContext.send("GameManager", "GetDeviceZXYQuaternion", "1;1;1;1");
        if (result == "granted") {
          unityContext.send("GameManager", "GetDeviceZXYQuaternion", "3;3;3;3");
        } else {
          unityContext.send("GameManager", "GetDeviceZXYQuaternion", "4;4;4;4");
        }
        //return result;
      });
    }
  }

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    unityContext.on("loaded", function () {
      setIsLoaded(true);

      // if (window.DeviceOrientationEvent) {
      //   unityContext.send("GameManager", "GetDeviceZXYQuaternion", "1;1;1;1");
      // } else {
      //   unityContext.send("GameManager", "GetDeviceZXYQuaternion", "0;0;0;0");
      // }
     testDeviceOrientation();
    });
    // window.setTimeout(()=>{
    //   console.log(testDeviceOrientation());
    // }, 40000)
    // console.log(testDeviceOrientation())

    window.addEventListener(
      "deviceorientation",
      function (event: DeviceOrientationEvent) {
        //unityContext.send("GameManager", "GetDeviceZXYQuaternion", getQuaternion(event.alpha, event.beta, event.gamma))
      }
    );
  }, []);

  return (
    <div>
      <Unity
        className={webglStyles.mainContainer}
        unityContext={unityContext}
      />
      <button style={{
        zIndex : 1,
        position: "fixed",
        top: 0,
        left: 0,
        padding: "35px 100px"
      }} onClick={()=>{
       (window.DeviceOrientationEvent as any)
       .requestPermission()
       .then(function (result: any) {
         unityContext.send("GameManager", "GetDeviceZXYQuaternion", "1;1;1;1");
         if (result == "granted") {
           unityContext.send("GameManager", "GetDeviceZXYQuaternion", "3;3;3;3");
         } else {
           unityContext.send("GameManager", "GetDeviceZXYQuaternion", "4;4;4;4");
         }
         //return result;
       });
      }}>Request Permission</button>
    </div>
  );
}

export default App;
