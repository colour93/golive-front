import { createApp } from "vue";
import { createHead } from "@vueuse/head";
import { createRouter, createWebHashHistory } from "vue-router";

import "./style.css";
import App from "./App.vue";

import IndexPage from "./pages/Index.vue";
import LiveroomPage from "./pages/Liveroom.vue";
import NotFoundPage from "./pages/NotFound.vue";

const routes = [
  { path: "/", component: IndexPage },
  { path: "/live/:roomId", component: LiveroomPage },
  { path: "/:pathMatch(.*)*", name: "NotFound", component: NotFoundPage },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const head = createHead();

const app = createApp(App);

app.use(head);
app.use(router);
app.mount("#app");
