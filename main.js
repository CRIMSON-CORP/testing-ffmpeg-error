let ffmpeg, ffmpegUtil;
const messenger = document.getElementById("message");

async function compressFile(file) {
  const FFmpeg = ffmpeg;

  console.log(FFmpeg.loaded);
  console.log(file.type);

  const outputFileName = `${file.name.split(".")[0]}.webm`;

  console.log(outputFileName);

  const fetchedFile = await ffmpegUtil.fetchFile(file);

  messenger.textContent = "Compressing file";

  try {
    await FFmpeg.writeFile("input.mp4", fetchedFile);
    await FFmpeg.exec([
      "-y",
      "-i",
      "input.mp4",
      "-c:v",
      "libvpx-vp9",
      "-crf",
      "30",
      "-b:v",
      "1M",
      "-max_muxing_queue_size",
      9999,
      "output.webm",
    ]);
    const data = await FFmpeg.readFile(outputFileName);

    const blob = new Blob([data.buffer], { type: "video/webm" });

    const compressedVideoFile = new File([blob], outputFileName, {
      type: "video/webm",
    });

    messenger.textContent = "finished compression";

    const testVideo = document.createElement("video");

    testVideo.src = URL.createObjectURL(compressedVideoFile);

    document.body.append(testVideo);

    console.log(compressedVideoFile);
  } catch (error) {
    messenger.textContent = "failed to compress file";
    console.log(error, "compress error");
  }
}

async function loadFfmpeg() {
  try {
    const FFmpeg = await import("./@ffmpeg/ffmpeg/dist/esm/index.js");
    const FFmpegUtil = await import("./@ffmpeg/util/dist/esm/index.js");
    ffmpeg = new FFmpeg.FFmpeg();
    ffmpegUtil = FFmpegUtil;

    // console.log(FFmpeg, this.ffmpeg);

    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

    ffmpeg.on("log", ({ message }) => {
      console.log(message);
    });

    ffmpeg.on("progress", ({ progress }) => {
      // ...
      console.log(progress, "ffmpeg progress");
    });
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await ffmpegUtil.toBlobURL(
        `${baseURL}/ffmpeg-core.js`,
        "text/javascript"
      ),
      wasmURL: await ffmpegUtil.toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
  } catch (error) {
    console.log(error, "ffmpeg error");
  }
}

document.getElementById("test-file-input").onchange = async (e) => {
  const file = e.target.files[0];
  messenger.textContent = "loading ffmpeg";
  await loadFfmpeg();
  messenger.textContent = "ffmpeg loaded";
  compressFile(file);
};
