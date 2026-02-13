package main

import (
	"bytes"
	"image"
	"image/jpeg"
	_ "image/jpeg"
	_ "image/png"
	"syscall/js"

	iresize "github.com/nfnt/resize"
)

func main() {
	js.Global().Get("console").Call("log", "I - The WASM - is running alright.")
	js.Global().Set("resize", js.FuncOf(resize))
	select{}
}

func resize(this js.Value, args[]js.Value) any {
	js.Global().Get("console").Call("log", "Golang's resize fn called")
	jsBuffer := args[0]
	lengthOfBuffer := args[1].Int()
	resizeHeight := uint(args[2].Int())
	resizeWidth := uint(args[3].Int())

	goBuffer := make([]byte, lengthOfBuffer)
	js.CopyBytesToGo(goBuffer, jsBuffer)
	img, _, err := image.Decode(bytes.NewReader(goBuffer))
	if (err != nil){
		js.Global().Get("console").Call("log", "There was an error decoding goBuffer as an image")
		return nil
	}

	img = iresize.Resize(resizeWidth, resizeHeight, img, iresize.Lanczos2)

	js.Global().Get("console").Call("log", "Here is thy resized image")
	js.Global().Get("console").Call("log", img.Bounds().String())

	buf := new(bytes.Buffer)

	err = jpeg.Encode(buf, img, nil)
	if (err != nil){
		return nil
	}
	
	jsBuf := js.Global().Get("Uint8Array").New(buf.Len())
	js.CopyBytesToJS(jsBuf, buf.Bytes())
	return jsBuf
}