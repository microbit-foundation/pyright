/// <reference path="fourslash.ts" />

// @filename: simple.py
////
//// def simple(x: int, y: int) -> int: ...
////
//// simple([|/*s1*/|]

{
    const simpleSignatures = [
        {
            label: 'simple.simple(x, y)',
            parameters: ['x', 'y'],
        },
    ];

    helper.verifySignature('plaintext', {
        s1: {
            signatures: simpleSignatures,
            activeParameters: [0],
        },
    });
}
