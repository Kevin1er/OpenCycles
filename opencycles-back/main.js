const schedule = require('node-schedule');
const fetch = require("node-fetch");
const { Connection, query } = require("stardog");
const config = require('./config').config;
const moment = require('moment');

const conn = new Connection({
  username: "admin",
  password: "admin",
  endpoint: "http://localhost:5820"
});

console.log("This program will update all stations data each minutes\n");

schedule.scheduleJob('*/5 * * * *', async function () {
  console.log('Starting Update!');

  let promises = [];
  for (let i = 0; i < config.length; i++) {
    promises.push(fetch_data(config[i]));
  }
  let answer = await Promise.all(promises);
  console.log("data fetched")
  let deleteQueries = [];
  let insterQuery = `
  PREFIX :<http://example.org/>
  INSERT DATA {
  `;
  for (let city of answer) {
    for (let stand of city) {
      if (stand.id && stand.lat && stand.lng && stand.name && stand.nb_bike_stands) {
        deleteQueries.push(`
        PREFIX :<http://example.org/>
        DELETE {
          :${stand.id} :last_update ?last_update ;
            :available_bikes ?available_bikes ;
            :available_bike_stands ?available_bike_stands .
        } WHERE {
          :${stand.id} :last_update ?last_update$ ;
            :available_bikes ?available_bikes$ ;
            :available_bike_stands ?available_bike_stands$ . }`);
        insterQuery += `
        :${stand.id} a :BikeStation ;
          :id '${stand.id}' ;
          :name '${escape(stand.name)}' ;
          :lat ${stand.lat} ;
          :lng ${stand.lng} ;
          :nb_bike_stands ${stand.nb_bike_stands} ;
          :address '${escape(stand.address)}' ;
          :city '${stand.city}' ;
          :last_update ${stand.last_update} ;
          :available_bikes ${stand.available_bikes} ;
          :available_bike_stands ${stand.available_bike_stands} .`;
      }
    }
  }
  insterQuery += "\n}";
  await execute_queries(insterQuery, deleteQueries);
});

async function fetch_data(_config) {
  return await fetch(_config.link)
    .then(response => {
      return response.json()
    })
    .then(data => {
      return new Promise(resolve => {
        let result = [];
        for (let elem of Object.byString(data, _config.path)) {
          let last_update = moment(Object.byString(elem, _config.station.last_update.item), Object.byString(elem, _config.station.last_update.format)).unix();
          if (!last_update) {
            last_update = Date.now();
          }
          result.push({
            id: _config.city + Object.byString(elem, _config.station.id),
            name: Object.byString(elem, _config.station.name),
            lat: parseFloat(Object.byString(elem, _config.station.lat)),
            lng: parseFloat(Object.byString(elem, _config.station.lng)),
            nb_bike_stands: parseInt(Object.byString(elem, _config.station.nb_bike_stands)),
            address: Object.byString(elem, _config.station.address),
            last_update: last_update,
            city: _config.city,
            available_bikes: parseInt(Object.byString(elem, _config.available.available_bikes)),
            available_bike_stands: parseInt(Object.byString(elem, _config.available.available_bike_stands))
          });
        }
        resolve(result);
      })
    })
    .catch(err => {
      console.log('Error, cannot fetch data ' + err)
    })
}

async function execute_queries(_insert, _delete) {

  await _delete.forEach(async q => {
    await query.execute(conn, 'opencycles', q);
  });
  await query.execute(conn, 'opencycles', _insert);
  console.log("Updated " + _delete.length + " stations !");
}

/**
 * Get from https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
 */
Object.byString = function (o, s) {
  if (s === "") return o;
  s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  s = s.replace(/^\./, '');           // strip a leading dot
  var a = s.split('.');
  for (var i = 0, n = a.length; i < n; ++i) {
    var k = a[i];
    if (k in o) {
      o = o[k];
    } else {
      return;
    }
  }
  return o;
}
