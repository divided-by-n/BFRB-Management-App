import * as messaging from "messaging";

const WEBSOCKET_STATES = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
const SERVER_URL = "ws://127.0.0.1:8080"; // 127.0.0.1 indicates the companion device, and is the only URL we can use without SSL (at least on Android).
let websocket;

openMessaging();
openWebsocket();

function openMessaging() {
  messaging.peerSocket.addEventListener("message", onWatchMessage);
}

function onWatchMessage(evt) {
  console.log(`Received data: ${JSON.stringify(evt.data)}`);

  const timestamp = evt.data;
  if (!timestamp) {
    console.warn("No timestamp received");
    return;
  }

  const buffer = new ArrayBuffer(8);
  const dataView = new DataView(buffer);

  const timestampMillis = Date.parse(timestamp);
  dataView.setBigInt64(0, BigInt(timestampMillis), true);

  // Check WebSocket state and send buffer if connected
  if (websocket.readyState !== WebSocket.OPEN) {
    console.warn(`Couldn't send to server: state=${WEBSOCKET_STATES[websocket.readyState]}`);
    if (websocket.readyState === WebSocket.CLOSED) openWebsocket();
    return;
  }

  websocket.send(buffer);
}

function openWebsocket() {
  if (websocket) {
    websocket.removeEventListener("open", onOpen);
    websocket.removeEventListener("close", onClose);
    websocket.removeEventListener("message", onMessage);
    websocket.removeEventListener("error", onError);
    websocket.close();
  }

  websocket = new WebSocket(SERVER_URL);
  websocket.binaryType = 'arraybuffer';
  websocket.addEventListener("open", onOpen);
  websocket.addEventListener("close", onClose);
  websocket.addEventListener("message", onMessage);
  websocket.addEventListener("error", onError);
}

function onOpen(evt) {
  console.log("websocket opened");
}

function onClose() {
  console.warn("websocket closed");
}

// function onMessage(evt) {
 
// }

function onError() {
  console.error(`websocket error`);
}
