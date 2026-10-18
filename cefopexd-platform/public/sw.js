/* =============================================
   SERVICE WORKER — application CeFoPExD
   - fichiers statiques (_next/static, icônes, images) : mis en cache
   - pages : toujours le réseau d'abord (données à jour), copie de secours hors ligne
   - jamais de cache pour les données privées (API, authentification, fichiers)
   ============================================= */
const VERSION = "cefopexd-v1";
const HORS_LIGNE = "/hors-ligne";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll([HORS_LIGNE, "/icons/icon-192.png"])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cles) => Promise.all(cles.filter((c) => c !== VERSION).map((c) => caches.delete(c))))
  );
  self.clients.claim();
});

const PRIVE = ["/api/", "/auth/", "/fichier/", "/gestion", "/mon-espace", "/mon-compte", "/messagerie", "/connexion"];

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Fichiers statiques : cache d'abord
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/images/")) {
    event.respondWith(
      caches.match(req).then((trouve) => trouve || fetch(req).then((rep) => {
        const copie = rep.clone();
        caches.open(VERSION).then((cache) => cache.put(req, copie));
        return rep;
      }))
    );
    return;
  }

  // Pages : réseau d'abord ; hors ligne -> copie publique ou page « hors ligne »
  if (req.mode === "navigate") {
    const privee = PRIVE.some((p) => url.pathname.startsWith(p));
    event.respondWith(
      fetch(req)
        .then((rep) => {
          if (!privee && rep.ok) {
            const copie = rep.clone();
            caches.open(VERSION).then((cache) => cache.put(req, copie));
          }
          return rep;
        })
        .catch(() => caches.match(req).then((trouve) => trouve || caches.match(HORS_LIGNE)))
    );
  }
});
