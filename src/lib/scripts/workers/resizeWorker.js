importScripts('wasm_exec.js')

const go = new Go()
WebAssembly.instantiateStreaming(fetch('resizeWASM.wasm'), go.importObject).then((res) => {
    go.run(res.instance);
    console.log("go wasm instance is running!")
})

self.onmessage(async (e) => {
    console.log("Message Received in the worker")
    const { arrayBuffer, abLength, width, height } = e.data
    try {
        const processedImage = await window.resize(arrayBuffer, abLength, width, height)
        self.postMessage({ ok: true, img: processedImage })
    } catch (error) {
        self.postMessage({ ok: false, error: error.message })
    }


})