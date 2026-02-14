<script>
  import { initWasm, resizeImage } from "$lib/scripts/wasmLink/wasmFns.svelte";
  import { onMount } from "svelte";

  let files = $state();
  let imgElement = $state();
  let fileUploader = $state();
  let imgSettings = $state({
    preserveAspectRatio: true,
    height: null,
    width: null,
    originalImageDimensions: {},
    arrayBuffer: null,
    currentFileSize: "",
    goFuncActive: false,
  });

  async function showImageFromInput() {
    if (
      files[0] &&
      (files[0].type.includes("webp") ||
        files[0].type.includes("heic") ||
        files[0].type.includes("avif"))
    ) {
      alert("Sorry, this image type is not currently supported");
      return;
    }
    if (files[0] && files[0].type.startsWith("image")) {
      const buffer = await files[0].arrayBuffer();
      showImageFromArrayBuffer(buffer, files[0].type);
    } else {
      alert("Not an image!");
    }
  }

  function showImageFromArrayBuffer(ab, type, isStored = true) {
    if (isStored) {
      imgSettings.arrayBuffer = ab;
    }
    const blob = new Blob([ab], { type: type });
    //Get file size in proper format
    imgSettings.currentFileSize = ((bytes) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    })(blob.size);

    const url = URL.createObjectURL(blob);
    URL.revokeObjectURL(imgElement.src);

    imgElement.onload = () => {
      imgSettings.height = imgElement.naturalHeight;
      imgSettings.width = imgElement.naturalWidth;
      if (isStored) {
        imgSettings.originalImageDimensions.h = imgElement.naturalHeight;
        imgSettings.originalImageDimensions.w = imgElement.naturalWidth;
      }
    };
    imgElement.src = url;
  }

  function inputValuesChanged(obj) {
    if (
      !imgSettings.originalImageDimensions.w ||
      !imgSettings.originalImageDimensions.h
    )
      return;

    if (imgSettings.preserveAspectRatio) {
      if (obj.w) {
        imgSettings.height = Math.round(
          (imgSettings.originalImageDimensions.h * obj.w) /
            imgSettings.originalImageDimensions.w,
        );
      } else if (obj.h) {
        imgSettings.width = Math.round(
          (imgSettings.originalImageDimensions.w * obj.h) /
            imgSettings.originalImageDimensions.h,
        );
      }
    }
  }

  async function resizeCurrentImage() {
    imgSettings.goFuncActive = true;
    const ab = new Uint8Array(imgSettings.arrayBuffer);
    let res = await resizeImage(
      ab,
      ab.length,
      imgSettings.height,
      imgSettings.width,
    );
    try {
      showImageFromArrayBuffer(res.buffer, "image/jpeg", false);
    } catch (error) {
      alert("Sorry, something went wrong");
    }

    imgSettings.goFuncActive = false;
  }

  onMount(() => {
    initWasm();
    (async function placeholderInit() {
      const h = Math.floor(Math.random() * (2000 - 500 + 1)) + 500;
      const w = Math.floor(Math.random() * (2000 - 500 + 1)) + 500;
      let res = await fetch(`https://picsum.photos/${h}/${w}`);
      res = await res.arrayBuffer();
      showImageFromArrayBuffer(res, "image/jpeg");
      //   console.log()
      //   console.log(res);
      //   imgElement.src = "https://picsum.photos/1200/900";
    })();
  });
</script>

<div
  class="w-screen h-screen absolute top-0 left-0 overflow-hidden flex flex-col gap-2 items-center justify-center"
>
  <div class="h-[40vh] w-screen flex items-center justify-center">
    <img
      bind:this={imgElement}
      class={`max-w-[90%] max-h-full ${imgSettings.height > imgSettings.width ? "h-full" : "min-w-[90%] md:min-w-auto"} object-contain ring-2 drop-shadow-md ring-offset-4`}
      src=""
      alt="imge"
    />
  </div>

  <div>{imgSettings.currentFileSize}</div>
  <div class="flex flex-row gap-3 mb-5">
    <button
      class="py-2 px-5 ring-1 rounded-full hover:px-6 transition-all duration-300"
      onclick={() => {
        fileUploader.click();
      }}>Upload Image</button
    >
    <button
      class="py-2 px-5 ring-1 rounded-full hover:px-6 transition-all duration-300"
      onclick={() => {
        const link = document.createElement("a");
        link.href = imgElement.src;
        let filename = imgElement.src.split("/");
        filename = filename[filename.length - 1];
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }}>Download Image</button
    >
  </div>
  <input
    type="file"
    class="hidden"
    title="FILE"
    bind:files
    bind:this={fileUploader}
    onchange={showImageFromInput}
  />
  <div class="flex flex-col items-center gap-3">
    <div>
      <input
        type="number"
        placeholder="height"
        maxlength="10000"
        class="w-[36vw] md:w-auto ring-1 rounded-2xl px-2 py-1 mx-2"
        oninput={() => {
          inputValuesChanged({ h: imgSettings.height });
        }}
        bind:value={imgSettings.height}
      />
      X
      <input
        type="number"
        maxlength="10000"
        placeholder="width"
        class="w-[36vw] md:w-auto ring-1 rounded-2xl px-2 py-1 mx-2"
        oninput={() => {
          inputValuesChanged({ w: imgSettings.width });
        }}
        bind:value={imgSettings.width}
      />
    </div>
    <div class="flex flex-row gap-4 ring-1 p-2 px-5 rounded-full">
      <div>Preserve Aspect Ratio</div>
      <input
        type="checkbox"
        class="scale-150"
        onchange={() => {
          inputValuesChanged({ h: imgSettings.height });
        }}
        bind:checked={imgSettings.preserveAspectRatio}
      />
    </div>
    <button
      class="py-2 px-5 ring-1 rounded-full hover:px-6 transition-all duration-300"
      onclick={() => {
        if (!imgSettings.goFuncActive) resizeCurrentImage();
      }}>{imgSettings.goFuncActive ? "..." : "Resize"}</button
    >
  </div>
</div>
