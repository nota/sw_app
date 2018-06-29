/* eslint-env browser */

const isDebug = () => location && ['localhost', 'sw-skelton.herokuapp.com'].includes(location.hostname)
const debug = (...msg) => isDebug() && console.log('%cserviceworker:caches', 'color: gray', ...msg)

async function updateCache ({version, urls}) {
  debug('adding all cache...')
  const cache = await caches.open(version)
  await cache.addAll(urls)
  debug('add all cache done', version)
  await deleteOldCache(version)
  debug('updating cache done')
  return {version}
}

async function deleteAllCache () {
  debug('delete all cache')
  const keys = await caches.keys()
  return Promise.all(keys.map(key => caches.delete(key)))
}

async function deleteOldCache (currentVersion) {
  const keys = await caches.keys()
  return Promise.all(keys
    .filter(key => key !== currentVersion)
    .map(key => {
      debug('delete old cache', key)
      return caches.delete(key)
    })
  )
}

async function fetchAssetsJson () {
  debug('fetching assets.json...')
  const res = await fetch('/assets/assets.json')
  if (!res.ok) throw new Error(`Server responded ${res.status}`)
  return res.clone().json()
}

async function cacheExists (version) {
  if (!(await caches.has(version))) return false
  // cache.addAllは、中断すると空のCacheオブジェクトができるので、
  // 中にRequestオブジェクトがあるか確認する
  const cache = await caches.open(version)
  return (await cache.keys()).length > 0
}

async function checkForUpdate () {
  debug('checking for update...')
  if (!navigator.onLine) {
    debug('offline')
    return
  }

  const assets = await fetchAssetsJson()
  if (await cacheExists(assets.version)) {
    debug('already up-to-date')
    // まれにupdateCacheで古いキャッシュの削除に失敗することがあるので
    // 念の為このタイミングで古いキャッシュがないことを確認する
    return deleteOldCache(assets.version)
  }
  return updateCache(assets)
}

module.exports = {deleteAllCache, checkForUpdate}
