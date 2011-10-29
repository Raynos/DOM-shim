domShim._CustomEvent = function (type, dict) {
    dict = dict || {};
    dict.detail = dict.detail || null;
    dict.bubbles = dict.bubbles || false;
    dict.catchable = dict.catchable || false;
    if (this.initCustomEvent) {
        this.initCustomEvent(type, dict.bubbles, dict.catchable, dict.detail);
    } else {
        this.initEvent(type, dict.bubbles, dict.catchable);
        this.detail = dict.detail;
    }
}