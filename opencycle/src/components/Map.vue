<template>
  <div class="map">
    <b-input-group class="searchbar">
      <b-input-group-prepend>
        <b-button variant="primary" @click="isOverlayOn = !isOverlayOn"
          >M</b-button
        >
      </b-input-group-prepend>
      <b-form-input v-model="text" placeholder="Search on OpenCycles ..." />
    </b-input-group>
    <div v-if="isOverlayOn" class="overlay">
      <b-card
        v-if="selectedObject && selectedObject.type == 'station'"
        :title="selectedObject.name"
        :sub-title="selectedObject.address + ', ' + selectedObject.city"
      >
        <b-card-text>
          Avialables bikes :
          {{ selectedObject.available_bikes }}
        </b-card-text>
        <b-card-text>
          Avialables stands :
          {{ selectedObject.available_bike_stands }}
        </b-card-text>
        <b-card-text>
          Number of stands :
          {{ selectedObject.nb_bike_stands }}
        </b-card-text>
        <b-card-text>
          last update :
          {{ this.toDate(selectedObject.last_update) }}
        </b-card-text>
        <script v-html="jsonld" type="application/ld+json" />
      </b-card>
      <b-card
        v-for="marker of objectsMarkers"
        v-bind:key="marker.options.object.name"
        overlay
        :img-src="marker.options.object.img"
        img-alt="Place Image"
        text-variant="white"
        :title="marker.options.object.name"
        :sub-title="marker.options.object.label"
      >
        <b-card-text
          >Distance : {{ marker.options.object.dist }} km</b-card-text
        >
        <b-card-text v-if="marker.options.object.website !== 'null'">
          <a :href="marker.options.object.website">Website</a>
        </b-card-text>
        <b-button variant="primary" @click="setSelectedObject(marker)"
          >See on map</b-button
        >
        <script
          v-html="getJsonld(marker.options.object)"
          type="application/ld+json"
        />
      </b-card>
    </div>
    <div id="map"></div>
  </div>
</template>

<style scoped>
#map {
  height: 100vh;
  width: 100%;
  max-width: 100%;
}
.searchbar {
  position: absolute;
  width: 390px;
  z-index: 1000;
  top: 10px;
  left: 10px;
  padding: 20px;
}
.overlay {
  width: 410px;
  height: 100vh;
  position: absolute;
  z-index: 999;
  background-color: #f5f5f5;
  padding-top: 100px;
  text-align: left;
  overflow: scroll;
}
.btn-overlay-close {
  position: absolute;
  top: 20px;
  left: calc(100% - 10px);
}
</style>

<script>
import * as moment from "moment";
import Wikibase from "../services/wikidata";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { MarkerClusterGroup } from "leaflet.markercluster";
import getJsonLD from "../services/jsonld";

export default {
  name: "Map",
  props: {
    msg: String
  },
  data() {
    return {
      map: null,
      objectsMarkers: [],
      url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      text: "",
      icon: L.icon({
        iconUrl: "images/icon50.png",
        iconSize: [50, 50],
        iconAnchor: [25, 50]
      }),
      iconOther: L.icon({
        iconUrl: "images/iconObject50.png",
        iconSize: [50, 50],
        iconAnchor: [25, 50]
      }),
      selectedIcon: L.icon({
        iconUrl: "images/iconselected50.png",
        iconSize: [50, 50],
        iconAnchor: [25, 50]
      }),
      markers: new MarkerClusterGroup(),
      isOverlayOn: false,
      selectedObject: null,
      jsonld: "nothing here"
    };
  },
  computed: {
    stations: function() {
      return this.$store.getters["stardog/stations"];
    }
  },
  methods: {
    addMarkers: function(list) {
      list.forEach(station => {
        let marker = L.marker([station.lat, station.lng], {
          icon: this.icon,
          object: station
        });
        marker.on("click", event => {
          this.selectedObject = event.target.options.object;
          if (this.selectedMarker) {
            this.selectedMarker.setIcon(this.icon);
          }
          this.selectedMarker = event.target;
          this.isOverlayOn = true;
          this.map.setView(event.latlng);
          this.searchAround([this.selectedObject.lng, this.selectedObject.lat]);
          event.target.setIcon(this.selectedIcon);
          this.jsonld = getJsonLD(this.selectedObject);
        });
        this.markers.addLayer(marker);
      });
      this.map.addLayer(this.markers);
    },
    searchAround: function(point) {
      this.objectsMarkers.forEach(marker => this.markers.removeLayer(marker));
      this.objectsMarkers = [];
      this.wikibase = new Wikibase("https://query.wikidata.org/sparql");
      let query =
        `SELECT ?place ?placeLabel ?image ?coordinate_location ?dist ?instance_of ?instance_ofLabel ?website WHERE {
          SERVICE wikibase:around {
            ?place wdt:P625 ?coordinate_location.
            bd:serviceParam wikibase:center "Point(` +
        point[0] +
        " " +
        point[1] +
        `)"^^geo:wktLiteral .
            bd:serviceParam wikibase:radius "1".
            bd:serviceParam wikibase:distance ?dist.
          }
          ?place wdt:P31 wd:Q11707.
          SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
          OPTIONAL { ?place wdt:P18 ?image. }
          OPTIONAL { ?place wdt:P31 ?instance_of. }
          OPTIONAL { ?place wdt:P856 ?website. }
        }`;
      this.wikibase.query(query).then(data => {
        console.log(data);
        data.results.bindings.forEach(obj => {
          let coordinates = obj.coordinate_location.value
            .match("(\\d)+\\.(\\d+) (\\d)+\\.(\\d+)")[0]
            .split(" ");
          let object = {
            type: "object",
            dist: parseFloat(obj.dist.value),
            img: obj.image.value,
            label: obj.instance_ofLabel.value,
            name: obj.placeLabel.value,
            lat: parseFloat(coordinates[1]),
            lng: parseFloat(coordinates[0]),
            website: obj.website ? obj.website.value : "null"
          };
          let objMarker = L.marker([object.lat, object.lng], {
            icon: this.iconOther,
            object
          });
          objMarker.on("click", event => {
            this.selectedObject = event.target.options.object;
            if (this.selectedMarker) {
              this.selectedMarker.setIcon(this.iconOther);
            }
            this.selectedMarker = event.target;
            this.isOverlayOn = true;
            this.map.setView(event.latlng);
            event.target.setIcon(this.selectedIcon);
          });
          this.objectsMarkers.push(objMarker);
          this.markers.addLayer(objMarker);
        });
        this.map.addLayer(this.markers);
      });
    },
    toDate: function(_timestamp) {
      return moment(_timestamp * 1000).format("DD-MM-YYYY, HH:mm:ss");
    },
    getJsonld: function(_object) {
      return getJsonLD(_object);
    },
    setSelectedObject: function(_marker) {
      this.selectedObject = _marker.options.object;
      if (this.selectedMarker) {
        this.selectedMarker.setIcon(this.icon);
      }
      this.selectedMarker = _marker;
      this.isOverlayOn = true;
      this.map.setView(_marker.getLatLng());
      _marker.setIcon(this.selectedIcon);
    }
  },
  watch: {
    stations: function(value) {
      this.addMarkers(value);
    }
  },
  async mounted() {
    this.$store.dispatch("stardog/PULL_STATIONS", this.$stardog);
    this.map = L.map("map", { zoomControl: false }).setView(
      [46.6305787, 2.4554443],
      5
    );
    L.tileLayer(this.url, {
      maxZoom: 18
    }).addTo(this.map);

    this.addMarkers(this.stations);
  }
};
</script>
