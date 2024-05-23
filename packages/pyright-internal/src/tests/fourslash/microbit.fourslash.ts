/// <reference path="fourslash.ts" />

// @filename: microbit/__init__.py
// @library true
//// from . import audio as audio
//// def run_every():
////     pass
////
//// class Sound:
////     GIGGLE = 1

// @filename: microbit/audio.py
// @library true
//// class SoundEffect:
////     pass

// @filename: log.py
// @library true
//// def add():
////     pass

// @filename: neopixel.py
// @library true
//// class NeoPixel:
////     def fill(self):
////         pass

// @filename: test0.py
//// from microbit import *
//// [|/*wildcardUse*/run_every|]()

// @filename: test1.py
//// from microbit import [|/*importFrom*/run_every|]
//// [|/*functionCall*/run_every|]()

// @filename: test2.py
//// import [|/*import*/log|]
//// [|/*moduleReference*/log|].[|/*functionCall2*/add|]()

// @filename: test3.py
//// import neopixel
//// np = neopixel.NeoPixel()
//// np.[|/*methodCall*/fill|]()

// @filename: test4.py
//// from microbit import *
//// [|/*classRef*/Sound|].GIGGLE
//// audio.[|/*constructor*/SoundEffect|]()

// @ts-ignore
await helper.verifyDiagnostics({
    wildcardUse: { category: 'warning', message: `"run_every" is not supported on a micro:bit V1` },
    importFrom: { category: 'warning', message: `"run_every" is not supported on a micro:bit V1` },
    functionCall: { category: 'warning', message: `"run_every" is not supported on a micro:bit V1` },
    import: { category: 'warning', message: `"log" is not supported on a micro:bit V1` },
    moduleReference: { category: 'warning', message: `"log" is not supported on a micro:bit V1` },
    functionCall2: { category: 'warning', message: `"log.add" is not supported on a micro:bit V1` },
    methodCall: { category: 'warning', message: `"NeoPixel.fill" is not supported on a micro:bit V1` },
    classRef: { category: 'warning', message: `"Sound" is not supported on a micro:bit V1` },
    constructor: { category: 'warning', message: `"audio.SoundEffect" is not supported on a micro:bit V1` },
});
