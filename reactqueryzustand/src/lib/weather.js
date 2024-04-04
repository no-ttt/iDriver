async function weather_info(location) {
  let all_weather_result = null; //所有天氣資訊
  let target_location = null; //查詢地點
  let target_weather = null; //查詢地點的天氣資訊
  let target_weather_result = null; //打包好要回傳的天氣資訊

  while (target_location == null) target_location = location;
  target_location = await get_city_town_from_lat_lng(target_location);

  const response = await fetch('https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001?Authorization=rdec-key-123-45678-011121314');
  const data = await response.json();
  if (data.success == 'true') all_weather_result = data.records.location;

  if (location.town != null && all_weather_result != null) { //確定
      for (var i = 0; i < all_weather_result.length; i++) { //尋找所在地的天氣資訊
          if (location.town == all_weather_result[i].parameter[2].parameterValue) { //配對到以後...
              target_weather = all_weather_result[i].weatherElement;
              if (target_weather != null && target_weather.length == 15) { //確保真的有抓到東西並長度等於15(天氣資訊固定15個項目)
                  target_weather_result = { //文件說明:https://opendata.cwb.gov.tw/opendatadoc/DIV2/A0003-001.pdf
                      'ELEV': target_weather[0], //高度
                      'WDIR': target_weather[1], //風向，單位 度，一般風向 0 表示無風
                      'WDSD': target_weather[2], //風速，單位 公尺/秒
                      'TEMP': target_weather[3], //溫度，單位 攝氏
                      'HUMD': target_weather[4], //相對濕度，單位 百分比率，此處以實數 0-1.0 記錄
                      'PRES': target_weather[5], //測站氣壓，單位 百帕
                      'H_24R': target_weather[6], //時雨量(應該吧，文件沒記載)
                      'H_FX': target_weather[7], //小時最大陣風風速，單位 公尺/秒
                      'H_XD': target_weather[8], //小時最大陣風風向，單位 度
                      'H_FXT': target_weather[9], //小時最大陣風時間，hhmm (小時分鐘)
                      'D_TX': target_weather[10], //本日最高溫，單位 攝氏
                      'D_TXT': target_weather[11], //本日最高溫發生時間，hhmm (小時分鐘)
                      'D_TN': target_weather[12], //本日最低溫，單位 攝氏
                      'D_TNT': target_weather[13], //本日最低溫發生時間，hhmm (小時分鐘)
                      'Weather': target_weather[14] //十分鐘天氣現象描述
                  }
              }
          }
      }
  } else console.log('無法取得天氣資訊');

  return Promise.resolve(target_weather_result.Weather.elementValue)
}