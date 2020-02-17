import Vue from "vue";
import App from "./App.vue";
import BootstrapVue from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import router from "./router";
import store from "./store/store";
import stardog from "./services/stardog";

Vue.config.productionTip = false;
Vue.use(BootstrapVue);
Vue.prototype.$stardog = stardog;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
