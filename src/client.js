const EventEmitter = require('events')
const url = require('url')
const fetch = require('isomorphic-fetch')
const { w3cwebsocket: WebSocket } = require('websocket')

const { check } = require('./util')

const URL = global.URL || url.URL

class Client extends EventEmitter {
  constructor ({ uri, hubs }) {
    super()

    check(uri, String, { name: 'uri', required: true })
    check(hubs, [String], { name: 'hubs', required: true })

    this.handleMessage = this.handleMessage.bind(this)

    this._uri = uri
    this._hubs = hubs.map(name => ({ name: name.toLowerCase() }))
    this._msgId = 0
    this._callbacks = {}
  }

  _waitFor (event) {
    return new Promise(resolve => this.once(event, resolve))
  }

  on (hub, method, func) {
    if (typeof (method) === 'function') {
      return super.on(hub, method)
    }

    return super.on(`${hub}:${method}`, func)
  }

  open () {
    return this.negotiate()
      .then(response => {
        const url = new URL(`${this._uri}/connect`)

        url.protocol = url.protocol === 'https:' ? 'wss' : 'ws'

        url.searchParams.set('clientProtocol', '1.5')
        url.searchParams.set('transport', 'webSockets')
        url.searchParams.set('connectionToken', response.ConnectionToken)
        url.searchParams.set('connectionData', JSON.stringify(this._hubs))

        this._socket = new WebSocket(url.toString())

        this._socket.onopen = () => {
          this.emit('open')
        }
        this._socket.onmessage = this.handleMessage
        this._socket.onclose = () => this.emit('close')
        this._socket.onerror = err => this.emit('error', err)

        return this._waitFor('open')
      })
  }

  handleMessage (e) {
    const data = JSON.parse(e.data)

    if (('M' in data) && Array.isArray(data.M)) {
      for (const msg of data.M) {
        this.emit(`${msg.H}:${msg.M}`, msg.A)
      }
    }

    if (('R' in data) && ('I' in data)) {
      if (this._callbacks[data.I]) {
        this._callbacks[data.I](data.R)
        delete this._callbacks[data.I]
      }
    }
  }

  invoke (hub, method, args) {
    this._socket.send(JSON.stringify({
      H: hub.toLowerCase(),
      M: method,
      A: args,
      I: ++this._msgId
    }))
  }

  call (hub, method, args, cb) {
    this._callbacks[++this._msgId] = cb
    this._socket.send(JSON.stringify({
      H: hub.toLowerCase(),
      M: method,
      A: args,
      I: this._msgId
    }))
  }

  negotiate () {
    const url = new URL(`${this._uri}/negotiate`)

    url.searchParams.set('clientProtocol', '1.5')
    url.searchParams.set('connectionData', JSON.stringify(this._hubs))

    return fetch(url.toString())
      .then(res => res.json())
  }
}

module.exports = { Client }
