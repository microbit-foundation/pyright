// Config for @microbit/i18n-tools, run without a local install:
//   npx --yes --package @microbit/i18n-tools microbit-i18n download
// with a Crowdin personal access token in CROWDIN_PERSONAL_TOKEN.
//
// Languages the Python Editor ships error messages in. The editor, the stubs
// repo and this fork list the same languages; a new one also needs a case in
// packages/pyright-internal/src/localization/localize.ts.
const languages = [
  "ca",
  "de",
  "es-ES",
  "fr",
  "ga-IE",
  "ja",
  "ko",
  "nl",
  "pl",
  "zh-CN",
  "zh-TW",
  "lol",
];

/** @type {import("@microbit/i18n-tools").Config} */
export default {
  crowdin: {
    project: "microbitorg",
    branch: "new",
    directory: "apps/python-editor-v3",
  },
  languages,
  // The simplified subset of pyright's messages the editor shows; plain JSON,
  // copied as-is.
  files: [
    {
      crowdinFile: "errors.en.json",
      local:
        "packages/pyright-internal/src/localization/simplified.nls.{lang:lower}.json",
      source:
        "packages/pyright-internal/src/localization/simplified.nls.en-us.json",
    },
  ],
};
