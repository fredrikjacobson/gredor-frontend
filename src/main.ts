import "./assets/main.scss";

import { createApp, markRaw, reactive } from "vue";
import App from "./App.vue";
import VueOnboardingTour from "vue-onboarding-tour";
import { setReactivityAdapter } from "@/framework/reactivity.ts";

// Ge domänlagret (@gredor/domain) Vues reaktivitetsprimitiver. Måste ske innan
// någon belopprad skapas, dvs innan appen monteras. Vues reactive() returnerar
// UnwrapNestedRefs<T>; domänen behandlar proxyn som T (precis som tidigare), så
// castet är avsiktligt.
setReactivityAdapter({
  reactive: reactive as <T extends object>(target: T) => T,
  markRaw,
});

createApp(App).use(VueOnboardingTour).mount("#app");
