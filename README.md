# DOM-shim

## About

Normalizing the DOM across all modern browsers.

The DOM-shim offers you a fully compliant, normalized DOM in all browsers

## [More details on wiki!][29]

## But how do I use it?

Just steal lib/DOM-shim.js and throw it through your minifier of choice. Note the entire DOM-shim depends on ES5-shim.

## Current shims

 - [DOM4 Node interface][1] completely shimmed
 - [DOM4 DOMException interface][2] completely shimmed
 - [DOM4 EventTarget interface][3] completely shimmed
 - [DOM4 Event interface][4] partially shimmed
 - [DOM4 CustomEvent interface][5] completely shimmed
 - [DOM4 Document interface][6] partially shimmed
 - [DOM4 DOMImplementation interface][7] partially shimmed
 - [DOM4 Element interface][9] partially shimmed

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

  [1]: http://www.w3.org/TR/2011/WD-dom-20110915/#interface-node
  [2]: http://www.w3.org/TR/2011/WD-dom-20110915/#exception-domexception
  [3]: http://www.w3.org/TR/2011/WD-dom-20110915/#eventtarget
  [4]: http://www.w3.org/TR/domcore/#interface-event
  [5]: http://www.w3.org/TR/domcore/#interface-customevent
  [6]: http://www.w3.org/TR/domcore/#interface-document
  [7]: http://www.w3.org/TR/domcore/#interface-domimplementation
  [8]: http://www.w3.org/TR/domcore/#interface-element

  [29]: https://github.com/Raynos/DOM-shim/wiki
  [30]: http://raynos.org/blog/10/DOM-Libraries
  [31]: http://raynos.org/blog/8/DOM-Extension-is-not-always-evil
  [32]: http://raynos.org/blog/11/Native-Custom-events-made-easy