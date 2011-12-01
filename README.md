# DOM-shim

Massive refactor in progress: See [dev][40]

## Status: alpha

## About

Normalizing the DOM across all modern browsers.

the DOM-shim provides compatibility shims so that modern browsers behave as closely to DOM4 as possible.

## [More details on wiki!][29]

## But why use the DOM-shim?

Take a look at the [unit tests without the DOM-shim][2] on your browser of choice. And now take a look at the [unit tests with the DOM-shim][3]. Now do it for some more browsers. 

As you can see browsers fail in different areas. The DOM-shim basically just normalizes everything for you. This means you can write code that works cross browser without worrying!

> But jQuery/MooTools/Prototype/YUI/Extjs/etc/etc do that for me already!

Yes and they offer you layers and abstraction on top of the DOM. Guess what happens when you do that? You get slow code. Code written with the DOM-shim is on average is about 10x faster then code written with jQuery.

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
  [2]: http://raynos.github.com/DOM-shim/test/compliance.html
  [3]: http://raynos.github.com/DOM-shim/test/test.html

  [29]: https://github.com/Raynos/DOM-shim/wiki
  [30]: http://raynos.org/blog/10/DOM-Libraries
  [31]: http://raynos.org/blog/8/DOM-Extension-is-not-always-evil
  [32]: http://raynos.org/blog/11/Native-Custom-events-made-easy
  
  [40]: https://github.com/Raynos/DOM-shim/tree/dev