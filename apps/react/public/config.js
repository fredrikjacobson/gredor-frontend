// Körtidskonfiguration. I byggda miljöer skriver nginx-entrypointen om denna
// fil med riktiga värden (samma mönster som Vue-appen). I utveckling är den tom
// och configUtils faller tillbaka på import.meta.env.
window.config = {};
