let countryCode = document.getElementById("countryCode").innerHTML;
let coords = document.getElementById("places").innerHTML;
let parts = coords.split(",");
let finalResult = []
while (parts.length) {
    let newArr = parts.splice(0, 4);
    finalResult.push(newArr);
};

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 3,
        maxZoom: 13,
        minZoom: 3,
        center: {
            lat: 47.522278,
            lng: 21.077278
        },
        disableDefaultUI: true,
        styles: [{
                "featureType": "road.arterial",
                "stylers": [
                    {
                        "visibility": "off"
                }
              ]
            },
            {
                "featureType": "road.highway",
                "stylers": [
                    {
                        "color": "#ffffff"
                }
              ]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels",
                "stylers": [
                    {
                        "visibility": "off"
                }
              ]
            },
            {
                "featureType": "road.local",
                "stylers": [
                    {
                        "visibility": "off"
                }
              ]
            }
          ]
    });
    setMarkers(map);

}

let markers = ""

function setMarkers(map) {
    var markerCluster = new MarkerClusterer(map, [], {
        imagePath: 'public/images/cluster/p',
        maxZoom: '11',
        zoomOnClick: 'true'
    });

    finalResult.forEach((place) => {
        var image = {
            url: place[0],
            scaledSize: new google.maps.Size(70, 70),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(35, 35)
        };
        var shape = {
            coords: [1, 1, 1, 20, 18, 20, 18, 1],
            type: 'poly'
        };
        var myLatlng = new google.maps.LatLng(place[1], place[2]);
        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            icon: image,
            shape: shape,
            animation: google.maps.Animation.DROP
        });
        markerCluster.addMarker(marker);

        var contentString = `<div id="content">
        <img height="300px" src='${place[3]}'
      </div>`;

        var infowindow = new google.maps.InfoWindow({
            content: contentString,
            maxWidth: 300
        });

        marker.addListener('click', function () {
            infowindow.open(map, marker);
        });

        //trying to get the map to coloring to function
        /*var curPosition = new google.maps.LatLng(48.174469867746, 11.553780097455);*/

        var world_geometry = new google.maps.FusionTablesLayer({
            query: {
                select: 'geometry',
                from: '1N2LBk4JHwWpOY4d9fobIn27lfnZ5MDy-NoqqRpk',
                where: `ISO_2DIGIT IN ('${countryCode}')`
            },
            map: map,
            suppressInfoWindows: true
        });
    })


}

function toggleBounce() {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}
