confirm("Allow camera");
let captureBtnCont = document.querySelector(".capture-btn-cont");
let video = document.querySelector('video');
let flipFlag = false;

let currentStream = null;

function stopStream() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
}

function startStream(cameraId) {
    stopStream();
    navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: cameraId ? {
                    exact: cameraId
                } : undefined
            },
            audio: false
        })
        .then((stream) => {
            currentStream = stream;
            video.srcObject = stream;
            video.play();
        })
        .catch((err) => {
            console.error("Error accessing camera: ", err);
        });
}
navigator.mediaDevices.enumerateDevices().then((devices) => {
    const videoSelect = document.getElementById('cameraSelect');
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    videoDevices.forEach((device, index) => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.text = `Camera ${index + 1}`;
        videoSelect.appendChild(option);
    });
    if (videoDevices.length > 0) {
        startStream(videoDevices[0].deviceId);
    }
}).catch((err) => {
    console.error("Error enumerating devices: ", err);
});
document.getElementById('cameraSelect').addEventListener('change', function() {
    const selectedCameraId = this.value;
    startStream(selectedCameraId);
});
const now = new Date();
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const day = days[now.getDay()];
let hours = now.getHours();
const minutes = now.getMinutes().toString().padStart(2, '0');
const ampm = hours >= 12 ? 'PM' : 'AM';
hours = hours % 12;
hours = hours ? hours : 12;
const timeString = `${hours}:${minutes} ${ampm}`;
document.getElementById('day').textContent = `${day}`;
document.getElementById('time').textContent = `${timeString}`;

captureBtnCont.addEventListener("click", () => {
    captureBtnCont.classList.add("scale-capture");

    let canvas = document.createElement("canvas");
    let day = document.getElementById("day");
    let time = document.getElementById("time");
    time.style.right = `${(canvas.width - time.clientWidth) / 2}`;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    let tool = canvas.getContext("2d");
    tool.clearRect(0, 0, canvas.width, canvas.height);
    tool.save();

    if (!flipFlag) {
        tool.translate(0, 0);
        tool.scale(1, 1);
    } else {
        tool.translate(canvas.width, 0);
        tool.scale(-1, 1);
    }
    tool.filter = 'sepia(1) hue-rotate(-20deg) saturate(1.5) brightness(0.9)';
    tool.drawImage(video, 0, 0, canvas.width, canvas.height);
    if (!flipFlag) {
        tool.translate(0, 0);
        tool.scale(1, 1);
    } else {
        tool.translate(canvas.width, 0);
        tool.scale(-1, 1);
    }

    function addTextContent(text, x, y, fontSize) {
        tool.font = `${fontSize}px Lucida Handwriting , cursive`;
        tool.textAlign = "center";
        tool.fillText(text, x, y);
    }

    addTextContent(day.innerText, canvas.width / 2, 100, 56);

    addTextContent(time.innerText, canvas.width / 2, 142, 24);

    let imageUrl = canvas.toDataURL("image/jpeg");

    let a = document.createElement('a');
    a.href = imageUrl;
    a.download = "image.jpg";
    a.click();

    setTimeout(() => {
        captureBtnCont.classList.remove("scale-capture");
    }, 500);
})

const flip = document.querySelector(".flip");
flip.addEventListener('click', function() {
    flipFlag = !flipFlag;
    if (flipFlag) {
        video.style.transform = 'scaleX(-1)';
    } else {
        video.style.transform = 'scaleX(1)';
    }
});