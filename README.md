# signalr-iso

## Summary

This is a SignalR client for both node.js and browser environment. This packages provides webSockets transport only.

## Usage

```
const SignalR = require('signalr-iso')

const client = new SignalR({
  uri: 'https://example.com/signalr',
  hubs: ['CoreHub']
})

client.open()
  .then(() => {
    client.on('CoreHub', 'SomeMethod', data => {
      // process received data herer
    })
    client.invoke('CoreHub', 'SomeMethod', ['arg0', 'arg1'])
  })
```
