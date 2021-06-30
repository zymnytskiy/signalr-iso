# signalr-iso

## Summary

SignalR client for both Node.js and Browser environment. This package provides WebSocket transport only.

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
