# DOM-shim

## About

Normalizing the DOM across all modern browsers.

The DOM-shim offers you a fully compliant, normalized DOM in all browsers

## [More details on wiki!][29]

## But how do I use it?

Just steal lib/DOM-shim.js and throw it through your minifier of choice. Note the entire DOM-shim depends on ES5-shim.

## Current shims

 - [v0.1][1]

## Some features

Use `.addEventListener`, `.contains`, `.textContent`, etc. today.

Bonus:

    var c = new CustomEvent("magic");
    el.addEventListener("magic", function (ev) {
      console.log("custom events oh so easy");
    });
    el.dispatchEvent(c);

## Related blog posts:

 - [DOM libraries][30]
 - [DOM Extension not always evil][31]
 - [Native Custom Events made easy][32]

  [1]: https://github.com/Raynos/DOM-shim/wiki/v0.1

  [29]: https://github.com/Raynos/DOM-shim/wiki
  [30]: http://raynos.org/blog/10/DOM-Libraries
  [31]: http://raynos.org/blog/8/DOM-Extension-is-not-always-evil
  [32]: http://raynos.org/blog/11/Native-Custom-events-made-easy