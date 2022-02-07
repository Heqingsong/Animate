function createVideo(url) {
  const video = document.createElement("video");

  video.src = url;
  video.muted = true;
  video.playbackRate = 1;
  video.currentTime = 0;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("type", "video/webm");
  video.setAttribute("preload", "none");
  video.classList.add("video");
  video.style.display = "none";
  window.document.body.appendChild(video);

  return video;
}

function createFrame(video, videoWidth, videoHeight) {
  const canvas = window.OffscreenCanvas
    ? new OffscreenCanvas(videoWidth, videoHeight)
    : document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = videoWidth;
  canvas.height = videoHeight;
  context.drawImage(video, 0, 0, videoWidth, videoHeight);

  return canvas;
}

function cacheFrame(videoMetaData) {
  return new Promise((resolve, reject) => {
    const { url, frameCount } = videoMetaData;
    const video = createVideo(url);
    const framsStore = new Array(frameCount).fill(false);
    let videoWidth = 0;
    let videoHeight = 0;
    let setIn = 0;
    let framsNumber = 0;

    video.play();
    video.addEventListener("loadedmetadata", (res) => {
      videoWidth = video.videoWidth;
      videoHeight = video.videoHeight;
    });

    video.addEventListener("ended", () => {
      resolve(framsStore);
    });

    video.addEventListener("waiting", (res) => {
      clearInterval(setIn);
    });

    video.addEventListener("error", () => {
      reject([]);
    });

    video.addEventListener("canplaythrough", (res) => {
      clearInterval(setIn);

      setIn = setInterval(() => {
        if (framsNumber >= frameCount) clearInterval(setIn);

        framsStore[framsNumber] = createFrame(video, videoWidth, videoHeight);
        framsNumber++;
      }, fps);
    });
  });
}

function renderFrame(ctx, frame) {
  ctx.clearRect(0, 0, 1600, 1176);
  ctx.drawImage(frame, 0, 0);
}

function showLoading() {
  const div = document.createElement("div");
  div.classList.add("loading");
  div.innerText = "file loading ...";
  document.body.appendChild(div);
}

function hideLoading() {
  document.querySelector(".loading").remove();
}
