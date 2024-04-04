import { useState, useEffect } from 'react';

const useContinuousGPSTracking = (callback) => {
  // useEffect(() => {
  //   const watchId = navigator.geolocation.watchPosition(
  //     (position) => {
  //       const latitude = position.coords.latitude;
  //       const longitude = position.coords.longitude;
  //       // const cursor = position.coords.heading;
  //       // const speed = position.coords.speed;

  //       // console.log(position.coords)
  //       console.log(latitude + ',' + longitude)
  //       callback({ lat: latitude, lng: longitude })
  //     },
  //     (error) => {
  //       console.error("無法取得位置資訊", error);
  //     }
  //   );

  //     return () => {
  //       // 在组件卸载时可以选择清除监听，但如果不卸载组件，监听将继续。
  //     };
  // }, [callback]);
  useEffect(() => { //20231030 Ian add for gps
    requestCurrentLocation();
  
    const intervalId = setInterval(() => {
      requestCurrentLocation();
    }, 1000); //強制每秒抓一次位置資訊
  
    return () => {
      clearInterval(intervalId); //卸載時清除定時器
    }
  }, []);

  const requestCurrentLocation = () => { //20231030 Ian add for gps
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        const Lat = position.coords.latitude;
        const Lng = position.coords.longitude;
        // const Cursor = position.coords.Cursor;
        // const Speed = position.coords.Speed;

        console.log("目前位置：", Lat, Lng);
      }, function (error) {
        console.error("無法取得位置資訊：", error);
      });
    } else {
      console.log("瀏覽器不支援定位功能");
    }
  };
};

export default useContinuousGPSTracking;
