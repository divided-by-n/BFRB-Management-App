import { Accelerometer } from "accelerometer";
import { vibration } from "haptics";
import { me as appbit } from "appbit";
import { peerSocket } from "messaging";
import * as document from "document";


const Frequency_RATE = 5; 
const Duration = 2;
const WINDOW = Duration * Frequency_RATE;
const BFRB_THRESHOLD_PERCENT = 80;

const RANGE_X = { min: 8.5, max: 10.1 };
const RANGE_Y = { min: -5, max: 5 };
const RANGE_Z = { min: -0.5, max: 3 };


let rawData = {
  accelerometer: []
};


let accelerometer;

try {
  accelerometer = new Accelerometer({ frequency: Frequency_RATE });
} catch (error) {
  console.error("Accelerometer not supported:", error);
}

// Button setup
const stopButton = document.getElementById("button-1");
if (stopButton) {
  stopButton.addEventListener("click", stopVibrationAndSendTime);
}

function setReminder(newText){
  const reminder = document.getElementById("dynamicText");
  reminder.textContent = newText;
}

function monitorBehaviour() {
  if (accelerometer) { 
    console.log("This device has an Accelerometer!");
    accelerometer.addEventListener("reading", () => {
      const { x, y, z } = accelerometer;
      const timestamp = new Date().toISOString(); 
      rawData.accelerometer.push({ x, y, z, timestamp }); 

      if (rawData.accelerometer.length > WINDOW) {
        rawData.accelerometer.shift(); 
      }
      checkBFRB();
    });
    accelerometer.start();
  } else {
    console.log("This device does NOT have an Accelerometer!");
  }
}

// Function to check for BFRB
function checkBFRB() {
  const countWithinRange = rawData.accelerometer.filter(({ x, y, z }) =>
    x > RANGE_X.min && x < RANGE_X.max &&
    y > RANGE_Y.min && y < RANGE_Y.max &&
    z > RANGE_Z.min && z < RANGE_Z.max
  ).length;

  const percentageWithinRange = (countWithinRange / rawData.accelerometer.length) * 100;

  if (percentageWithinRange >= BFRB_THRESHOLD_PERCENT) {
    stopButton.style.display = "inline";
    alertUser();
  }
}


function alertUser() {
  console.log("Alert: BFRB detected!");
  setReminder('Behaviours Detected');
  vibration.start("alert");
}

function stopVibrationAndSendTime() {
  vibration.stop();
  sendCurrentTime();
  setReminder('Detecting Behaviours');
  stopButton.style.display = "none";
}


function sendCurrentTime() {
  if (peerSocket.readyState === peerSocket.OPEN) {
    const currentTime = new Date().toISOString();
    peerSocket.send(currentTime);
  }
}


appbit.appTimeoutEnabled = false;


peerSocket.addEventListener("open", () => {
  console.log('peerSocket OPEN');
  monitorBehaviour();
});

peerSocket.addEventListener("close", evt => {
  console.warn(`peerSocket onclose ${evt}`);
});

peerSocket.addEventListener("error", evt => {
  console.warn(`peerSocket onerror ${evt}`);
});

peerSocket.addEventListener("message", evt => {
  console.warn(`peerSocket onmessage ${evt}`);
});
