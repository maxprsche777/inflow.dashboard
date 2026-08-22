/* Infloww Dashboard - offline cache.
   Bump CACHE when you upload a new index.html so the app picks it up. */
var CACHE = "infloww-v4";
var ASSETS = ["./", "./index.html", "./manifest.webmanifest",
              "./icon-192.png", "./icon-512.png",
              "./screenshot-wide.png", "./screenshot-narrow.png", "./preview.png"];

self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).catch(function(){}));
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return k===CACHE ? null : caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

/* Network first, fall back to cache. That way you always get the newest
   version online, and it still opens with no connection. */
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copy); }).catch(function(){});
      return res;
    }).catch(function(){
      return caches.match(e.request).then(function(hit){
        return hit || caches.match("./index.html");
      });
    })
  );
});
