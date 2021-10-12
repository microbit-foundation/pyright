/// <reference path="fourslash.ts" />

// @filename: test.py
//// from typing import List, Union
////
//// class Foo:
////     """ This is a docstring """
////
////     aaa = 4
////     """ aaa is an int """
////
////     def __init__(self) -> None:
////         self.bbb = "hi"
////         " bbb is a str "
////
//// ccc = Foo()
//// """ ccc is a Foo """
////
//// SomeType = List[Union[int, str]]
//// """Here's some documentation about SomeType"""
////
//// foo1.b[|/*marker1*/|]
////
//// foo1.a[|/*marker2*/|]
////
//// cc[|/*marker3*/|]
////
//// SomeType[|/*marker4*/|]

// @ts-ignore
await helper.verifyCompletion('includes', 'markdown', {
    marker1: {
        completions: [
            {
                label: 'bbb',
                kind: Consts.CompletionItemKind.Variable,
                documentation: 'bbb is a str',
            },
        ],
    },
    marker2: {
        completions: [
            {
                label: 'aaa',
                kind: Consts.CompletionItemKind.Variable,
                documentation: 'aaa is an int',
            },
        ],
    },
    marker3: {
        completions: [
            {
                label: 'ccc',
                kind: Consts.CompletionItemKind.Variable,
                documentation: 'ccc is a Foo',
            },
        ],
    },
    marker4: {
        completions: [
            {
                label: 'SomeType',
                kind: Consts.CompletionItemKind.Variable,
                documentation: "Here's some documentation about SomeType",
            },
        ],
    },
});
