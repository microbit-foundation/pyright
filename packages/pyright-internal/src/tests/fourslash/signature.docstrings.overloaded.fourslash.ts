/// <reference path="fourslash.ts" />

// @filename: docstrings.pyi
//// from typing import overload
////
//// @overload
//// def repeat() -> str:
////     """This is a docstring on the first overload."""
//// @overload
//// def repeat(x: int) -> int: ...
////
//// repeat([|/*marker1*/|])

{
    helper.verifySignature('plaintext', {
        marker1: {
            signatures: [
                {
                    label: 'docstrings.repeat()',
                    parameters: [],
                    documentation: 'This is a docstring on the first overload.',
                },
                {
                    label: 'docstrings.repeat(x)',
                    parameters: ['x'],
                    documentation: 'This is a docstring on the first overload.',
                },
            ],
            activeParameters: [undefined, 0],
        },
    });

    helper.verifySignature('markdown', {
        marker1: {
            signatures: [
                {
                    label: 'docstrings.repeat()',
                    parameters: [],
                    documentation: 'This is a docstring on the first overload.',
                },
                {
                    label: 'docstrings.repeat(x)',
                    parameters: ['x'],
                    documentation: 'This is a docstring on the first overload.',
                },
            ],
            activeParameters: [undefined, 0],
        },
    });
}
