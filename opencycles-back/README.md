# opencycles

## Description

Le projet se décompose en trois parties :

- L'application web OpenCycle ;
- Le script de mise à jour des stations ;
- La base de données Stardog ;

## Project needs

- NodeJs ;
- npm ;
- Stardog ;

## Start

### Backend

- Install Stardog database ;
- Start Stardog (by defaut on port 5820) ;
- Create a database named **opencycles** ;
- Go to the folder opencycles-back ;
- Install dependencies by the command ```npm install``` ;
- Start the back by the command ```node main.js``` ;
- The script will udate all stations all 5 mins ;

#### Add new cities

- Create a new json file inside the folder config ;
- Add the line ```require('./NAME.json'),``` on the file index.js in the folder config ;

### Frontend

- Go to the folder **opencycle** ;
- Install dependencies by the command ```npm install``` ;
- Start the app by the command ```npm run serve``` ;
- The app is running on ```localhost:8080``` ;

## Semantic web technologies

- Sparql INSERT / DELETE stations queries are avaliable on the file **opencycles-back/main.js** on the backend ;
- Sparql SELECT stations querie is avaliable on the file **opencycle/src/store/modules/stardog.js** on the app ;
- JsonLD is avaliable on the file **opencycle/src/services/jsonld.js** ;
- Sparql SELECT restaurant querie is avaliable on the file **opencycle/src/components/Map.vue** at line 170 ;
