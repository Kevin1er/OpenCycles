import Vue from "vue";
import Vuex from "vuex";
import stardog from "./modules/stardog";

const debug = process.env.NODE_ENV !== "production";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    stardog
  },
  strict: debug
});
