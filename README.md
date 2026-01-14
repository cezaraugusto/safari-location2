[npm-version-image]: https://img.shields.io/npm/v/safari-location2.svg?color=0A84FF
[npm-version-url]: https://www.npmjs.com/package/safari-location2
[npm-downloads-image]: https://img.shields.io/npm/dm/safari-location2.svg?color=2ecc40
[npm-downloads-url]: https://www.npmjs.com/package/safari-location2
[action-image]: https://github.com/cezaraugusto/safari-location2/actions/workflows/ci.yml/badge.svg?branch=main
[action-url]: https://github.com/cezaraugusto/safari-location2/actions

> Approximates the current location of the Safari browser across platforms.
  
# safari-location2 [![Version][npm-version-image]][npm-version-url] [![Downloads][npm-downloads-image]][npm-downloads-url] [![workflow][action-image]][action-url]

<img alt="Safari" align="right" src="https://cdn.jsdelivr.net/gh/extension-js/media@9ef31f005a0192907d9f6405838e43776aca2124/browser_logos/svg/safari.svg" width="10.5%" />

* By default checks only `stable`. Optionally can cascade to `Technology Preview`.
* Supports macOS
* Works both as an ES module or CommonJS

## Support table

This table lists the default locations where Safari is typically installed for each supported platform and channel. By default, only the Stable channel is checked. When fallback is enabled, the package checks these paths (in order) and returns the first one found.

<table>
  <thead>
    <tr>
      <th>Platform</th>
      <th>Channel</th>
      <th>Paths checked</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2" align="center"><img alt="" width="64" height="64" src="https://cdn.jsdelivr.net/gh/extension-js/media@9ef31f005a0192907d9f6405838e43776aca2124/platform_logos/macos.png" /><br><strong>macOS</strong></td>
      <td align="center">Safari (Stable)</td>
      <td>
        <ul>
          <li><code>/Applications/Safari.app/Contents/MacOS/Safari</code></li>
          <li><code>~/Applications/Safari.app/Contents/MacOS/Safari</code></li>
        </ul>
      </td>
    </tr>
    <tr>
      <td align="center">Safari Technology Preview</td>
      <td>
        <ul>
          <li><code>/Applications/Safari Technology Preview.app/Contents/MacOS/Safari Technology Preview</code></li>
          <li><code>~/Applications/Safari Technology Preview.app/Contents/MacOS/Safari Technology Preview</code></li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

Returns the first existing path found (given selected channels), or <code>null</code> if none are found.

## Usage

**Via Node.js (strict by default):**

```js
import safariLocation from "safari-location2";
import {
  locateSafariOrExplain,
  getInstallGuidance,
  getSafariVersion
} from "safari-location2";

// Strict (Stable only)
console.log(safariLocation());
// => "/Applications/Safari.app/Contents/MacOS/Safari" or null

// Enable fallback (Stable / Technology Preview)
console.log(safariLocation(true));
// => first found among Stable/Technology Preview or null

// Throw with a friendly guide when not found
try {
  const bin = locateSafariOrExplain({allowFallback: true});
  console.log(bin);

  // Version (no exec by default)
  console.log(getSafariVersion(bin)); // e.g. "17.6" or null
} catch (e) {
  console.error(String(e));
  // Or print getInstallGuidance() explicitly
}
```

**Via CLI:**

```bash
npx safari-location2
# Strict (Stable only)

npx safari-location2 --fallback
# Enable cascade (Stable / Technology Preview)

# Respect environment overrides
SAFARI_BINARY=/custom/path/to/Safari npx safari-location2

# Print browser version (empty + exit code 2 if unavailable)
npx safari-location2 --safari-version
npx safari-location2 --browser-version

# Opt-in: allow executing the binary to fetch version
npx safari-location2 --browser-version --allow-exec
```

### Environment overrides

If this environment variable is set and points to an existing binary, it takes precedence:

- `SAFARI_BINARY`

## API

- `default export locateSafari(allowFallback?: boolean): string | null`
- `locateSafariOrExplain(options?: boolean | { allowFallback?: boolean }): string`
- `getSafariVersion(bin: string, opts?: { allowExec?: boolean }): string | null`
- `getInstallGuidance(): string`

## Related projects

* [brave-location](https://github.com/cezaraugusto/brave-location)
* [chrome-location2](https://github.com/cezaraugusto/chrome-location2)
* [edge-location](https://github.com/cezaraugusto/edge-location)
* [firefox-location2](https://github.com/cezaraugusto/firefox-location2)
* [opera-location2](https://github.com/cezaraugusto/opera-location2)
* [vivaldi-location2](https://github.com/cezaraugusto/vivaldi-location2)
* [yandex-location](https://github.com/cezaraugusto/yandex-location)
* [librewolf-location](https://github.com/cezaraugusto/librewolf-location)
* [waterfox-location](https://github.com/cezaraugusto/waterfox-location)

## License

MIT (c) Cezar Augusto.


