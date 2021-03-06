import React, {Component} from 'react'
import Setting from './setting'
import UpdateNotifier from './update-notifier'

export default class App extends Component {
  render () {
    return (
      <div>
        <div className='navbar navbar-inverse navbar-fixed-top'>
          <a className='navbar-brand' href='#'>SW Skelton</a>
        </div>
        <UpdateNotifier />
        <div className='container' id='cont'>
          <h1>
            <img src='/assets/img/skelton.svg' alt='logo' className='logoimg' width='50' />
            Hello, service worker
          </h1>
          <Setting />
          <hr />
          url: {window.location.href}<br />
          <br />
          Welcome to service worker skelton app!
        </div>
      </div>
    )
  }
}
