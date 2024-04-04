function optionSelect() {
    const traffic_info_Click = document.querySelector('#traffic_info');
    const speed_camera_alert_Click = document.querySelector('#speed_camera_alert');
    const voice_query_Click = document.querySelector('#voice_query');
    const route_Click = document.querySelector('#route');
    
    checkbox.addEventListener("change", function() {
        var trafficinfoisChecked = traffic_info_Click.checked;
        var speedisChecked = speed_camera_alert_Click.checked;
        var voiceisChecked = voice_query_Click.checked;
        var routeisChecked = route_Click.checked;

        if (trafficinfoisChecked) { /*即時道路資訊*/
            
        } else {
            
        }

        if (speedisChecked) {       /*測速照相警示*/
            
        } else {
            
        }

        if (voiceisChecked) {       /*語音查詢*/
            
        } else {
            
        }

        if (routeisChecked) {       /*路線規劃*/
            
        } else {
            
        }
    });
}