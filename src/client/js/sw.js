/* global caches self URL fetch */
var NOCACHELIST = [
  '/sw.js',
  '/api/',
  '/.+?/.+?/slide',
  '/.+?/.+?.json'
]

var ASSETS = [] // this data is automatically generated by gulp

var CHECKSUM = '' // this data is automatically generated by gulp
var CACHENAME = 'app-assets-' + CHECKSUM

console.log('sw: hello', CHECKSUM)

this.addEventListener('install', function (event) {
  console.log('sw: installed')
  event.waitUntil(
    self.skipWaiting()
  )
})

self.addEventListener('activate', function (event) {
  console.log('sw: activated')
  event.waitUntil(
    self.clients.claim()
  )
})

function shouldUseAppHtml (event) {
  var pathname = new URL(event.request.url).pathname

  var i

  for (i = 0; i < ASSETS.length; ++i) {
    var re = new RegExp('^' + ASSETS[i])
    if (re.test(pathname)) {
      return false
    }
  }

  for (i = 0; i < NOCACHELIST.length; ++i) {
    var re = new RegExp('^' + NOCACHELIST[i])
    if (re.test(pathname)) {
      return false
    }
  }

  if (event.request.method !== 'GET') {
    return false
  }

  var accept = event.request.headers.get('Accept')
  if (!accept || accept.indexOf('text/html') < 0) {
   return false
  }

  return true
}


var _db = null
function openStore () {
  return new Promise(function(resolve, reject) {
    if (_db) {
      var store = _db.transaction("version", "readwrite").objectStore("version")
      resolve(store)
      return
    }

    // Open (or create) the database
    var open = indexedDB.open("MyDatabase", 3);

    // Create the schema
    open.onupgradeneeded = function (event) {
      var db = event.target.result // or open.result
      db.createObjectStore("version", {keyPath: 'id'})
    }

    open.onsuccess = function (event) {
      var db = event.target.result // or open.result
      _db = db // save in global
      var store = db.transaction("version", "readwrite").objectStore("version")
      resolve(store)
    }
  })
}

function putVersion(version) {
  openStore().then(function (store) {
    store.put({id: 'version', value: version})
  })
}

function getVersion(version) {
  return new Promise(function(resolve, reject) {
    openStore().then(function (store) {
      var req = store.get('version')
      req.onsuccess = function(event){
        resolve(event.target.result.value)
      }
      req.onerror = function (event) {
        reject(event)
      }
    }).catch(function (err) {
      reject(err)
    })
  })
}

putVersion('hoihoi')

this.addEventListener('fetch', function (event) {

  // 特定のfetchがあれば、キャッシュをクリアするというのを試してみたい
  var cookie = event.request.headers.get('Cookie')
  console.log('cookie:', cookie)
//    var pathname = new URL(event.request.url).pathname
//    if (pathname = '/clear_cache') {

//    }


  event.respondWith(
    getVersion().then(function(version) {
      return caches.open(version).then(function(cache) {
        return cache.match(event.request).then(function (response) {
          if (response) {
            console.log('sw: respond from cache', event.request.url)
            return response
          }

          if (shouldUseAppHtml(event)) {
            return caches.match('/app.html').then(function (response) {
              if (response) {
                console.log('sw: respond app.html', event.request.url)
                return response
              }

              console.log('sw: fetch', event.request.url)
              return fetch(event.request, {credentials: 'include'})
            })
          }

          console.log('sw: fetch', event.request.url)
          return fetch(event.request).then(function(response) {
            var shouldCache = true
            if (shouldCache) {
              console.log('sw: save cache', event.request.url)
  //            return caches.open(CACHENAME).then(function(cache) {
              cache.put(event.request, response.clone());
              return response;
  //            });
            } else {
              return response;
            }
          })

//          return fetch(event.request, {credentials: 'include'})
        })
      })
    })
  )
})


      // TODO: ここから下は、gyazo.com/xxx.pngなどのユーザー画像をキャッシュするかどうか
      // あとで書く
/*

      return fetch(event.request).then(function(response) {
        var shouldCache = false;

        for (var i = 0; i < WHITELIST.length; ++i) {
          var b = new RegExp(WHITELIST[i]);
          if (b.test(event.request.url)) {
//            shouldCache = true;
            break;
          }
        }

        for (var i = 0; i < NOCACHELIST.length; ++i) {
          var b = new RegExp(NOCACHELIST[i]);
          if (b.test(event.request.url)) {
            shouldCache = false;
            break;
          }
        }

        if (event.request.method == 'POST') {
          shouldCache = false;
        }

        if (!response.ok) {
          shouldCache = false;
        }

        if (shouldCache) {
          console.log('sw: save cache', event.request.url)
          return caches.open(CACHENAME).then(function(cache) {
            cache.put(event.request, response.clone());
            return response;
          });
        } else {
          return response;
        }
      });
*/

