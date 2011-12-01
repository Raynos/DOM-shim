# DOM-shim

Massive refactor in progress: See [dev][40]

## Status: alpha

## About

Normalizing the DOM across all modern browsers.

the DOM-shim provides compatibility shims so that modern browsers behave as closely to DOM4 as possible.

### [Tested][3] browsers (all pass currently)

 - Firefox 
 - Chrome
 - Saf 5.1
 - Opera 11.52
 - IE9

The DOM-shim.js works on those browsers

The Dom-shim-ie8.js works on IE8 and is tested on IE8.

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

  [3]: http://raynos.github.com/DOM-shim/test/test.html

  [29]: https://github.com/Raynos/DOM-shim/wiki
  [30]: http://raynos.org/blog/10/DOM-Libraries
  [31]: http://raynos.org/blog/8/DOM-Extension-is-not-always-evil
  [32]: http://raynos.org/blog/11/Native-Custom-events-made-easy
  
  [40]: https://github.com/Raynos/DOM-shim/tree/dev
