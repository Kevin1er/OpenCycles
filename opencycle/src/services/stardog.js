import { query, Connection } from "stardog";

export default {
  query: query,
  conn: new Connection({
    username: "admin",
    password: "admin",
    endpoint: "http://localhost:5820"
  }),
  db: "opencycles"
};
