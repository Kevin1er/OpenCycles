const state = {
  stations: new Array(),
  cities: new Array()
};

const getters = {
  stations: state => state.stations
};

const mutations = {
  ADD_STATION: (state, station) => {
    for (let st of state.stations) {
      if (station.id.value === st.id) {
        // TODO Mise a jour des donnees
        return;
      }
    }
    state.stations.push({
      type: "station",
      id: station.id.value,
      name: unescape(station.name.value),
      city: station.city.value,
      address: unescape(station.address.value),
      lat: parseFloat(station.lat.value),
      lng: parseFloat(station.lng.value),
      nb_bike_stands: parseInt(station.nb_bike_stands.value),
      last_update: parseInt(station.last_update.value),
      available_bikes: parseInt(station.available_bikes.value),
      available_bike_stands: parseInt(station.available_bike_stands.value)
    });
  }
};

const actions = {
  PULL_STATIONS: async ({ commit }, stardog) => {
    const query = `
    prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    prefix : <http://example.org/>

    SELECT ?id ?name ?city ?address ?lat ?lng ?nb_bike_stands ?last_update ?available_bikes ?available_bike_stands WHERE {
      ?station rdf:type :BikeStation ;
        :id ?id ;
        :name ?name ;
        :city ?city ;
        :address ?address ;
        :lat ?lat ;
        :lng ?lng ;
        :nb_bike_stands ?nb_bike_stands ;
        :last_update ?last_update ;
        :available_bikes ?available_bikes ;
        :available_bike_stands ?available_bike_stands .
    }`;
    stardog.query
      .execute(stardog.conn, stardog.db, query)
      .then(result => {
        result.body.results.bindings.forEach(station => {
          commit("ADD_STATION", station);
        });
      })
      .catch(err => {
        console.error(err);
      });
  },
  PULL_CITIES: async ({ commit }, stardog) => {
    const query = `

    `;
    stardog.query
      .execute(stardog.conn, stardog.db, query)
      .then(result => {
        result.body.results.bindings.forEach(city => {
          commit("ADD_CITY", city);
        });
      })
      .catch(err => {
        console.error(err);
      });
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
