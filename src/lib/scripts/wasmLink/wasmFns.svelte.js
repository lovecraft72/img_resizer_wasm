
// import { encode } from '@jsquash/avif';

let worker = $state()
let workerRunning = $state(false)

export function initWasm() {

    // const go = new Go()
    // WebAssembly.instantiateStreaming(fetch("resizeWASM.wasm"), go.importObject).then((res) => {
    //     go.run(res.instance)
    // })

    worker = new Worker("resizeWorker.js")


}

export async function resizeImage(arrayBuffer, abLength, width, height) {
    if (workerRunning) {
        console.log("Can't receive request, worker is busy")
        return
    }

    try {
        const res = await (new Promise((resolve, reject) => {
            worker.onmessage = (e) => {
                e = e.data
                workerRunning = false
                if (e.ok) {
                    resolve(e.img)
                }
                else {
                    reject(e.error)
                }
            }

            workerRunning = true
            worker.postMessage({
                arrayBuffer,
                abLength,
                width,
                height
            })
            console.log("Message Posted")
        }))
        // try {
        //     console.log(res)
        //     const imgData = new ImageData(new Uint8ClampedArray(res.buffer), width, height)
        //     const avifBuffer = await encode(imgData);
        //     console.log(avifBuffer)
        // } catch (error) {
        //     console.log("ERROR ::: Couldn't convert to avif :::")
        //     console.log(error)
        // }

        return res
    } catch (error) {
        return null
    }


}