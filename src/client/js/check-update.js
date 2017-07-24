import request from 'superagent'
import {setVersion, getVersion} from './version'

// Clientアセットに変化がないかリモートにリクエストして確認する。
// 利用中に、アプリの更新をpush通知などを受け取って、
// 発火するようにすると、次のリロード時には
// 新機能が早速使えるようになるので良さそうだ。
// リロードを2回しなくて良くなるのが利点だ。

let _newVersion

async function checkForUpdate () {
  console.log('checkForUpdate')
  const response = await request.get('/api/client_version')
  //console.log(response)
  console.log(response.body.version)

  const newVersion = response.body.version
  _newVersion = newVersion

  const currentVersion = await getVersion()

  if (newVersion != currentVersion) {
    document.getElementById('update_message').innerHTML = 'there is a new update!'
    const updateAlert = document.getElementById('new_update_alert')
    updateAlert.style.display = 'inline-block'
  }


          // 自動でリロードをかける
          // 不要ならコメントアウト
//          if (shouldReloadImmediately) {
//            setTimeout(function () {
//              window.location.reload()
//            }, 300)
//          }


/*
  shouldReloadImmediately = false
  console.log('Checking for update...')
  navigator.serviceWorker.getRegistration('/').then(function (reg) {
    return reg.update()
  }).then(function () {
    console.log('Checking for update... done')
  })
*/
}

// 定期的に新しいリソースがないか確認しにいく
setInterval(function () {
  checkForUpdate()
}, 10 * 1000)

window.onload = async function onLoad () {
  console.log('Window has been loaded')
  const url = window.location.href

  const version = await getVersion()

  const message = `url: ${url}<br>version: ${version}`

  document.getElementById('message').innerHTML = message

  const checkForUpdateButton = document.getElementById('check_for_update_btn')
  const updateButton = document.getElementById('update_btn')

  checkForUpdateButton.onclick = function () {
    checkForUpdate()
  }

  updateButton.onclick = async function () {
    console.log('Update now')
    await setVersion(_newVersion)
    window.location.reload()
  }
}