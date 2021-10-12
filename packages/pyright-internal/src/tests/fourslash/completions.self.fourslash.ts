/// <reference path="fourslash.ts" />

// @filename: test.py
//// class Foo:
////     def __init__(self):
////         self.var1 = 3
////     def method1(self):
////         '''Method 1.'''
////         pass
////     @property
////     def prop1(self):
////         '''Property 1.'''
////         return 2
////     def new_method(self):
////         self.[|/*marker1*/|]

// @ts-ignore
await helper.verifyCompletion('included', 'markdown', {
    marker1: {
        completions: [
            {
                label: 'method1',
                kind: Consts.CompletionItemKind.Method,
                documentation: '```python\ntest.Foo.method1()\n```\n---\nMethod 1.',
            },
            {
                label: 'new_method',
                kind: Consts.CompletionItemKind.Method,
                documentation: '```python\ntest.Foo.new_method()\n```',
            },
            {
                label: 'prop1',
                kind: Consts.CompletionItemKind.Property,
                documentation: '```python\ntest.Foo.prop1 (property)\n```\n---\nProperty 1.',
            },
            {
                label: 'var1',
                kind: Consts.CompletionItemKind.Variable,
                documentation: undefined,
            },
        ],
    },
});
