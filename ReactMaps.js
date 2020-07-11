import React, { useEffect, useState } from 'react';

function loadMaps(props={}) {

  if(!props || !props['api-key']) {
    console.error('Google Maps API key not set. Aborting component setup...');
    return false;
  }

  const googleMapsLoadedPromise = new Promise((resolve) => {
    window._ReactMapsResolveGoogleMapsLoaded = () => {
      resolve(true);
      delete window._ReactMapsResolveGoogleMapsLoaded;
    };
  });

  const scriptURL = `https://maps.googleapis.com/maps/api/js?key=${props['api-key']}&callback=_ReactMapsResolveGoogleMapsLoaded`;

  const scripts = document.getElementsByTagName('script');

  for (let i = scripts.length; i--;) {
    if (scripts[i].src == scriptURL) return;
  }

  const script = document.createElement('script');
  script.src = scriptURL;
  script.async = true;
  window.document.body.appendChild(script);

  return googleMapsLoadedPromise;

}


function _userPosition(options={}) {

  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });

}

function getUserPosition(options={}) {

  return new Promise(function (resolve, reject) {
    return _userPosition().then((position) => {

      const { coords } = position;
      return resolve(coords);

    }).catch((err) => {
      console.error(err.message);
    });
  });

}

function Map(props) {

  const [map, setMap] = useState(null);

  useEffect(() => {

    loadMaps(props).then(() => {

      let lat = props.lat ?? 52.1920;
      let lng = props.lng ?? -2.2200;

      setMap(new window.google.maps.Map(document.getElementById('_ReactMap'), {
        center: { lat: lat, lng: lng },
        zoom: props.zoom ?? 8
      }));

    });

  }, []);

  useEffect(() => {

    if(map && props.markUserPosition){

      getUserPosition().then((position) => {
        map.setCenter(new window.google.maps.LatLng( position.latitude, position.longitude ) );
      });

    }

  }, [map]);

  return (
    <div id="_ReactMap" className="map" style={{width:props.width ?? '100%', height:props.height ?? '100%'}}></div>
  );
}

export { Map, getUserPosition };
