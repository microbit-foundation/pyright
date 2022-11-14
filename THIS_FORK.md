# This fork

This document covers the changes made to Pyright in this repo.

There are two branches we're maintaining for the benefit of the [micro:bit Python Editor](https://python.microbit.org/).

-   browser: this contains [the work to build a Web Worker](https://github.com/microsoft/pyright/compare/main...microbit-foundation:pyright:browser)
-   microbit: this contains the changes from browser and [some additional micro:bit customisations that are unlikey to be of general interest](https://github.com/microbit-foundation/pyright/compare/browser...microbit-foundation:pyright:microbit) - details below

We don't have plans or the resource to maintain these for usecases other than the micro:bit Python Editor, but we're happy to discuss.

## A new build for the browser

We added a browser-pyright package alongside the CLI and VS Code extension packages. Similarly to the CLI, it's a Webpack build, but one that stubs out Node-only features. The build outputs a Web Worker.

This is not currently published anywhere. If you want to use it then you will need to build it yourself:

```bash
$ git clone https://github.com/microbit-foundation/pyright.git
$ cd pyright
$ npm install
$ cd packages/browser-pyright
$ npm run build
```

Like CLI and VS Code packages, browser-pyright depends on the internals package (which contains nearly all Pyright's code).

The browser package copies the high-level class from the language protocol server and configures it to run in a Web Worker environment.

We've prioritised keeping the fork maintainable by minimising change over clean code.

## Changes

The key change is to replace the file system abstraction Pyright uses to read from disk. We took a very simple approach to this, simply swapping in the in-memory test file system class that is used in Pyright's test suite. We then added some custom messages to allow us to manipulate that file system. This whole mechanism might be worth revisiting and comparing against tsserver's solution.

Pyright has a foreground and background thread architecture. They communicate via Node's worker_threads module. We've added an adapter so we can alternatively use the
browser postMessage API. Nested Web Worker support [was only recently added to Safari](https://bugs.webkit.org/show_bug.cgi?id=22723), so there's some extra complexity to allow Pyright to request creation of Workers from the browser main thread. The abstraction should still work in the worker_thread scenario but has not been tested with the VS Code extension or CLI. A closer review of what each thread is responsible for and whether this is the best setup for a web build would be worthwhile — we just focussed on getting it running.

We added an initialization option that allows you to specify the typeshed as a simple JSON object file system. We produce this [from our MicroPython stubs project](https://github.com/microbit-foundation/micropython-microbit-stubs/) as [a JSON file](https://github.com/microbit-foundation/python-editor-v3/blob/main/src/micropython/main/typeshed.en.json). Our stubs project is cut down to the APIs in MicroPython from [Python's typeshed](https://github.com/python/typeshed) so most other users would need to instead use a standard typeshed. The files in the typeshed JSON file are copied to Pyright's file system so they can be discovered by its import resolution. Our set of libraries is fixed so it's feasible for us to provide all stubs up front. I believe TypeScript's language server has support for runtime stub discovery, which might be necessary for a usecase with flexible dependencies. We might need this behaviour in future.

We fixed a syntax error in Safari due to lack of negative look behind support.

Reviewing the changes, [there's a cludge here](https://github.com/microsoft/pyright/compare/main...microbit-foundation:pyright:browser#diff-8a9e7373556006db29659ed8820a21073840a944192d2b49977c032276f1f979R544) that would benefit from further review.

## Limitations

There has been no testing outside of the micro:bit Python Editor scenarios (autocomplete, diagnostics, signature help).

We've not concerned ourselves with supporting multiple workspaces.

Pyright supports a side-channel based cancellation API for background tasks that uses the file system as shared state. We don't support this in the Web Worker. Mitigated for micro:bit by our tiny source code (< 20k in total). A SharedArrayBuffer-based implementation might be practical.

We've also stubbed out memory/cache management that would be relevant to large projects.

There's missing support for some error/exit scenarios (see BrowserMessagePort).

We're rather vulnerable to Pyright changes. Some of these changes are batch merged from the closed Pylance repository which can be hard to follow. We're not particularly worried about keeping up-to-date, as we're targetting MicroPython which is way behind the cutting edge of Python. However, we expect to periodically merge changes. One concern in doing so is that the complexity of Python type checking is growing over time via various typing PEPs resulting in a growth in the Pyright code size. The worker is already very large at 1.3M uncompressed 336K gzipped. Pyright has a monolithic type checking core that makes it hard for us to consider feature / size trade offs.

## Usage

There is no documentation for this beyond example code in the micro:bit Python Editor.

You need to use a language server protocol client library and have a good understanding of the protocol and your responsibilities as a client, especially if your environment works with multiple files. Consider existing implementations for your text editing component. The micro:bit Python Editor uses a custom language server implementation for CodeMirror 6 that is incomplete relative to third-party options.

You need [an initialization dance](https://github.com/microbit-foundation/python-editor-v3/blob/main/src/language-server/pyright.ts) for the Pyright Web Worker due to the foreground and background Workers. Everything but the last line here is likely reusable by other implementations.

As part of the initialize request, you need to provide the type stubs ([example](https://github.com/microbit-foundation/python-editor-v3/blob/40ff6f64955bf552c4513a762228982114353cbd/src/language-server/client.ts#L152)).

[This code](https://github.com/microbit-foundation/python-editor-v3/blob/40ff6f64955bf552c4513a762228982114353cbd/src/language-server/client-fs.ts#L20) shows how the micro:bit Python Editor notifies Pyright of changes to files. Edits to open files are notified by the editing component itself.

## micro:bit-specific customisations

These apply only to the microbit branch. We have very likely removed information that would be useful to non-beginner programmers so this branch is probably not what you want. This branch is the source of the Web Worker in the micro:bit Python Editor.

We added a custom LSP request `pyright/apidocs` that dumps API information from a specified list of modules. This code is very likely to be insufficiently generalised for arbitrary Python APIs as we only had to deal with the micro:bit MicroPython API.

We've simplified formatting of function signatures in autocomplete and signature help to remove type information.

We spent some time tweaking the error messages that we considered common for our educational scenarios. In almost all cases this was just a message bundle substitution but we did make a few code changes and introduce some new special case messages. The custom messages can be selected via a `diagnosticStyle: "simplified"` initialization option. For the moment the code changes cannot be avoided if you use this branch.

We also commissioned commercial and volunteer translations of this common subset of the error messages (accepting that there would be a long tail).
