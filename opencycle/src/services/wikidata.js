const fetch = require("node-fetch");

class Wikibase {
  constructor(_endpoint) {
    this.endpoint = _endpoint;
  }
  async query(_query) {
    const answer = await fetch(
      `${this.endpoint}?query=${_query}&format=json&origin=*`
    );
    return await answer.json();
  }
}

export default Wikibase;
