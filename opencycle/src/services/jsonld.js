function getJsonLD(selectedObject) {
  if (selectedObject.type === "station") {
    return `{
      "@context": "https://schema.org",
      "@type": "BikeStation",
      "available_bikes": ${selectedObject.available_bikes},
      "available_bike_stands": ${selectedObject.available_bike_stands},
      "nb_bike_stands": ${selectedObject.nb_bike_stands},
      "last_update": ${selectedObject.last_update},
      "name": ${selectedObject.name},
      "lat": ${selectedObject.lat},
      "lng": ${selectedObject.lng},
      "address": ${selectedObject.address},
      "city": ${selectedObject.city},
    }`;
  } else {
    return `{
      "@context": "https://schema.org",
      "@type": ${selectedObject.label},
      "dist": ${selectedObject.dist},
      "image": ${selectedObject.img},
      "name": ${selectedObject.name},
      "lat": ${selectedObject.lat},
      "lng": ${selectedObject.lng}
    }`;
  }
}

export default getJsonLD;
