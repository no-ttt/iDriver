import React, { useEffect, useState } from 'react'
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api'
import useContinuousGPSTracking from '../../lib/gps'
import weather_info from '../../lib/weather'
// import { useQueryApi } from '../../lib/useFetchApi'
// import { getRouteNearby } from "../../apis"
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import traffic from '../../img/traffic.png'
import park from '../../img/park.png'
import speedLimit from '../../img/speedLimit.png'
import danger from '../../img/danger.png'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft'
import RouteIcon from '@mui/icons-material/Route'
import NearMeIcon from '@mui/icons-material/NearMe'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'

const googleMapsApiKey = "AIzaSyC7-6v1eCkrtOESIW9B5UMms2oUgxdP7wA"
let trafficInfoRecord = []

export default function Demo() {
  const [map, setMap] = useState(null)
  const [center, setCenter] = useState({ lat: 23.971650512729834, lng: 120.92778789628782 })
  const [zoom, setZoom] = useState(12)
  const [origin, setOrigin] = useState({ lat: 23.971650512729834, lng: 120.92778789628782 })
  const [destination, setDestination] = useState({ lat: 24.11252151928199, lng: 120.61619229263472 })
  const [directions, setDirections] = useState(null)
  const [distance, setDistance] = useState(null)
  const [durationInTraffic, setDurationInTraffic] = useState(null)
  const [step, setStep] = useState([]) // waypoints
  const [nearbyData, setNearbyData] = useState([])
  const [routePoints, setRoutePoints] = useState([])
  const [currentPos, setCurrentPos] = useState(null)
  const [currentClick, setCurrentClick] = useState([])
  const [clickMarker, setClickMarker] = useState(false)
  const [currentClickDetail, setCurrentClickDetail] = useState([])
  const [trafficInfo, setTrafficInfo] = useState([])
  const [currentGPS, setCurrentGPS] = useState(null)
  const [openDrawer, setOpenDrawer] = useState(true)
  const [options, setOptions] = useState("")
  const [generateRoute, setGenerateRoute] = useState(false)
  const [useGPS, setUseGPS] = useState(false)

  // useContinuousGPSTracking((newLocation) => setCurrentGPS(newLocation))
  // console.log("currentGPS: ", currentGPS)

  useEffect(() => {
    requestCurrentLocation()
  
    const intervalId = setInterval(() => {
      requestCurrentLocation()
    }, 1000) //強制每秒抓一次位置資訊
  
    return () => {
      clearInterval(intervalId) //卸載時清除定時器
    }
  }, [])

  const requestCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        
        const Lat = position.coords.latitude
        const Lng = position.coords.longitude

        setCurrentGPS({ lat: Lat, lng: Lng })
      }, function (error) {
        console.error("無法取得位置資訊：", error)
      });
    } else {
      console.log("瀏覽器不支援定位功能")
    }
  }

  // console.log("currentGPS: ", currentGPS)


  useEffect(() => {
    if (currentGPS !== null && useGPS) {
      getTrafficNearby([currentGPS.lng, currentGPS.lat])
    }
  }, [currentGPS, useGPS])

  useEffect(() => {
    if (routePoints.length !== 0) {
      let coordinatesString = ""
      for (let i = 0; i < routePoints.length; i++) {
        coordinatesString += "," + routePoints[i][0] + " " + routePoints[i][1]
      }
      coordinatesString = coordinatesString.replace(",", "")
      console.log("coordinatesString: ", coordinatesString)

      fetch(`http://localhost:8888/api/lbse/route?lnglat=${coordinatesString}&scope=${options}`)
      .then(result => result.json())
      .then(data => {
        setNearbyData(data.data)
      })
    }
  }, [options])

  const AddressToLatLng = (address) => {
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${googleMapsApiKey}`)
      .then(result => result.json())
      .then(data => {
        let loc = data.results[0].geometry.location
        return (loc)
      })
    
    return ("error")
  }

  const alarm = (txt) => {
    if ('speechSynthesis' in window) { //建查瀏覽器是否支持SpeechSynthesis API
      var speech = new SpeechSynthesisUtterance() //創建新的SpeechSynthesisUtterance
      var voices = speechSynthesis.getVoices() //獲取可用的语音列表
      speech.voice = voices[300]; //選擇语音

      speech.text = txt //設置要轉換語音的文本
      speechSynthesis.speak(speech)
    } else {
      console.log("瀏覽器不支援TTS功能")
    }
}

  const getTrafficNearby = (pos) => {
    fetch(`http://localhost:8888/api/lbse/public?lat=${pos[1]}&lon=${pos[0]}&range=3`)
      .then(result => result.json())
      .then(data => {
        if (data.data.length !== 0) {
          if (trafficInfoRecord.indexOf(data.data[0].OID) == -1) {
            trafficInfoRecord = [...trafficInfoRecord, data.data[0].OID]
            setTrafficInfo(data.data[0])
            data.data[0].Type === 1 ? alarm(data.data[0].CDes) : data.data[0].Type === 3 ? alarm("附近有測速") : data.data[0].CDes !== "低危險路段" && alarm(data.data[0].CDes + "請小心")
          }
          else {
            setTrafficInfo([])
          }
        }
        else setTrafficInfo([])
      })
  }

  const getPOIDetail = (d) => {
    fetch(`http://localhost:8888/api/lbse/detail?oid=${d.OID}&poiType=${d.Type}`)
      .then(result => result.json())
      .then(data => {
        setCurrentClick(d)
        setClickMarker(true)
        setCurrentClickDetail(data.data)
      })
  }

  const handleOnLoad = (map) => {
    setMap(map)
  }

  const handleZoomChanged = () => {
    if (map) {
      const zl = map.getZoom()
      setZoom(zl)
    }
  }

  const handleCenterChanged = () => {
    if (map) setCenter({ lat: map.getCenter().lat(), lng: map.getCenter().lng() })
  }

  const handleMapClick = (event) => {
    const newCenter = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    }
    setCenter(newCenter)
  }

  const getRoute = () => {
    setGenerateRoute(true)
    setNearbyData([])
    setOptions("")

    let originPos_lat = Number(document.getElementById('origin_pos_lat').value)
    let originPos_lng = Number(document.getElementById('origin_pos_lng').value)
    let destinationPos_lat = Number(document.getElementById('destination_pos_lat').value)
    let destinationPos_lng = Number(document.getElementById('destination_pos_lng').value)

    setOrigin({ lat: originPos_lat, lng: originPos_lng })
    setDestination({ lat: destinationPos_lat, lng: destinationPos_lng })

    let directionsService = new google.maps.DirectionsService()
    directionsService.route({
      origin: { lat: originPos_lat, lng: originPos_lng },
      destination: { lat: destinationPos_lat, lng: destinationPos_lng },
      travelMode: google.maps.TravelMode.DRIVING,
      drivingOptions: {
        departureTime: new Date(Date.now()),
        trafficModel: 'optimistic'
      }
    }, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        setDirections(result)
        setDistance(result.routes[0].legs[0].distance.text)
        setDurationInTraffic(result.routes[0].legs[0].duration_in_traffic.text)
        
        console.log("result: ", result)

        setStep(result.routes[0].legs[0].steps.map((point) => {
          return [point.start_point.lng(), point.start_point.lat()]
        }))

        setRoutePoints(result.routes[0].overview_path.map((point) => {
          return [point.lng(), point.lat()]
        }))

        console.log("result: ", result)
      } else {
        console.error(`error fetching directions ${result}`)
      }
    })
  }

  const moveCarAlongRoute = () => {
    let index = 0
    setInterval(() => {
      if (index < routePoints.length) {
        setCurrentPos(() => routePoints[index])
        getTrafficNearby(routePoints[index])

        index ++
      }
    }, 1000)
  }

  const currentPosStart = () => {
    setOrigin(currentGPS)
    setCenter(currentGPS)
    document.getElementById('origin_pos_lat').value = currentGPS.lat
    document.getElementById('origin_pos_lng').value = currentGPS.lng
  }

  const checkChange = (e) => {
		let check = ""

		if (e.target.checked) check += options + "," + e.target.value
		else check = options.replace( "," + e.target.value, '')

    setOptions(check)
	}

  return (
    <div>
      <div style={{ zIndex: 1, position: "absolute" }}>
        <div>
          {
            !openDrawer &&
            <button id="function_close" className="function_control" onClick={() => setOpenDrawer(true)}>
              <ArrowRightIcon style={{ color: "white" }} />
            </button>
          }
          
        </div>
        <div id="function_click" style={ openDrawer ? { left: 0 } : { left: "-380px" }}>
          <div id="function_list_control">
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="drawer-label">起點</div>
                <IconButton onClick={currentPosStart}>
                  <GpsFixedIcon fontSize="small" />
                </IconButton>
              </div>
              
              <div className="input-layout">
                <div style={{ width: 60 }}>緯度：</div>
                <TextField id="origin_pos_lat" variant="outlined" size="small" fullWidth 
                  defaultValue={origin.lat}
                  // value={origin.lat} 
                />
              </div>
              <div className="input-layout">
                <div style={{ width: 60 }}>經度：</div>
                <TextField id="origin_pos_lng" variant="outlined" size="small" fullWidth 
                  defaultValue={origin.lng} 
                  // value={origin.lng} 
                />
              </div>
            </div>
            <div style={{ color: "gray", fontSize: 12, textAlign: "center", margin: 10 }}>to</div>
            <div>
              <div className="drawer-label">終點</div>
              <div className="input-layout">
                <div style={{ width: 60 }}>緯度：</div>
                <TextField id="destination_pos_lat" variant="outlined" size="small" fullWidth 
                  defaultValue={destination.lat} 
                  // value={destination.lat} 
                />
              </div>
              <div className="input-layout">
                <div style={{ width: 60 }}>經度：</div>
                <TextField id="destination_pos_lng" variant="outlined" size="small" fullWidth 
                  defaultValue={destination.lng} 
                  // value={destination.lng} 
                />
              </div>
              <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: 28 }}>
                <div />
                <Button variant="outlined" size="small" onClick={() => getRoute()}>
                  生成路線
                  <RouteIcon size="small" />
                </Button>
                <div style={{ width: 20}} />
                <Button variant="outlined" size="small" onClick={() => setUseGPS(true) }>
                  開始導航
                  <NearMeIcon size="small" />
                </Button>
              </div>
            </div>
            <div className="divider" />
            <div className="drawer-label">POIs 篩選</div>
            <div>
              <FormGroup>
                <FormControlLabel label="路況"
                  control={
                    <Checkbox size="small" value="1" onChange={(e) => checkChange(e)} />
                  }  
                />
                <FormControlLabel label="停車場"
                  control={
                    <Checkbox size="small" value="2" onChange={(e) => checkChange(e)} />
                  }  
                />
                <FormControlLabel label="測速"
                  control={
                    <Checkbox size="small" value="3" onChange={(e) => checkChange(e)} />
                  }  
                />
                <FormControlLabel label="危險路段"
                  control={
                    <Checkbox size="small" value="4" onChange={(e) => checkChange(e)} />
                  }  
                />
              </FormGroup>
            </div>

            <div className="divider" />
            <div className="drawer-label">其他功能</div>
            <div>
              <Button variant="outlined" size="small" onClick={() => moveCarAlongRoute()}>
                模擬行車
                <DirectionsCarIcon size="small" />
              </Button>
            </div>
          </div>
          {
            openDrawer && 
            <button id="function_open" className="function_control" onClick={() => setOpenDrawer(false)}>
              <ArrowLeftIcon style={{ color: "white" }} />
            </button>
          }
        </div>
      </div>

      {
        generateRoute &&
        <div className="control-info-frame">
          <div>距離：{distance}</div>
          <div>預估到達時間：{durationInTraffic}</div>
          <div>天氣：晴</div>
        </div> 
      }

      { 
        trafficInfo.length !== 0 && 
        trafficInfo.Type === 1 ?
        <div className="alert-info-frame" style={{ marginTop: 120 }}>
          <div>路況通知：</div> 
          <div>{trafficInfo.CName}</div>
          <div>{trafficInfo.CDes}</div>
        </div>
        : trafficInfo.Type === 3 ?
        <div className="alert-info-frame" style={{ marginTop: 120 }}>
          <div>附近有測速</div> 
          {/* <div>方向：{trafficInfo.Direction}</div>
          <div>限速：{trafficInfo.SpeedLimit}</div> */}
        </div>
        : trafficInfo.Type === 4 ?
        trafficInfo.CDes !== "低危險路段" && <div className="alert-info-frame" style={{ marginTop: 120 }}>
          <div>{trafficInfo.CDes}</div> 
          {/* <div>方向：{trafficInfo.Direction}</div>
          <div>限速：{trafficInfo.SpeedLimit}</div> */}
        </div>
        : ""
      }

      <LoadScript googleMapsApiKey={googleMapsApiKey}>
        <GoogleMap 
          id="map-full-screen"
          center={center}
          zoom={zoom}
          onLoad={handleOnLoad}
          onZoomChanged={handleZoomChanged}
          onDragEnd={handleCenterChanged}
          onClick={handleMapClick}
          options={{
            styles: [
              {
                featureType: "poi",
                stylers: [
                  {
                    visibility: "off",
                  },
                ],
              },
            ],
            mapTypeControl: false,
          }}
        >
          {/* 目前所在位置 (GPS) */}
          {/* {
            currentGPS != null &&
            <Marker 
              position={currentGPS} 
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: 'red', 
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
              }}
            />
          } */}
          
          {/* 起點＆終點 */}
          {
            origin !== null && generateRoute &&
            <Marker 
              position={origin}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: 'black', 
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
              }}
            />
          }
          {
            destination != null && generateRoute &&
            <Marker position={destination} />
          }
          
          {/* 規劃路線 */}
          {
            directions !== null && (
              <DirectionsRenderer
                directions={directions}
                options={{ suppressMarkers: true }}
              />
            )
          }

          {/* 模擬導航的現在位置 */}
          {
            currentPos != null &&
            <Marker 
              position={{ lat: currentPos[1], lng: currentPos[0] }} 
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: 'orange', 
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
              }}
            />
          }

          {/* 路線附近 POIs */}
          {
            nearbyData.length !== 0 &&
            nearbyData.map((d, i) => (
              <Marker 
                key={i} 
                position={{ lat: d.Lat, lng: d.Lon }} 
                icon={{
                  url: d.Type == 1 ? traffic : d.Type === 2 ? park : d.Type === 3 ? speedLimit : d.Type === 4 ? danger : "",
                  scaledSize: new window.google.maps.Size(25, 25),
                }}
                onClick={() => getPOIDetail(d)}
              />
            ))
          }

          {/* POI 詳細資訊 */}
          {
            clickMarker &&
            <InfoWindow
              position={{ lat: currentClick.Lat, lng: currentClick.Lon }}
              onCloseClick={() => setClickMarker(false)}
              // options={{ pixelOffset: { height: -40 } }}
              zIndex={1}
            >
              {
                currentClick.Type === 1 ? 
                  <div>
                    <div>{currentClick.OCName}</div>
                    <div>{currentClickDetail.RoadType}</div>
                    <div>方向：{currentClickDetail.Direction}</div>
                    <div>發生日期：{currentClickDetail.HappenDate}</div>
                    <div>發生時間：{currentClickDetail.HappenTime}</div>
                  </div> 
                : currentClick.Type === 2 ? 
                  <div>
                    <div>{currentClick.OCName}</div> 
                    <div>{currentClickDetail.FareDescription}</div>  
                    <div>緊急電話：{currentClickDetail.EmergencyPhone}</div>
                  </div> 
                : currentClick.Type === 3 ? 
                <div>
                  <div>方向：{currentClickDetail.Direction}</div>  
                  <div>限速：{currentClickDetail.SpeedLimit}</div>
                </div> 
                : currentClick.Type === 4 ? 
                <div>
                  <div>{currentClick.CDes}</div>  
                </div> 
                : ""
              }
            </InfoWindow>
          }
        </GoogleMap>
      </LoadScript>
    </div>
  )
}
