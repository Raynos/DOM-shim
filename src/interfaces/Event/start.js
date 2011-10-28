domShim._Event = function (type, dict) {
    dict = dict || {};
    dict.bubbles = dict.bubbles || false;
    dict.catchable = dict.catchable || false;
    this.initEvent(type, dict.bubbles, dict.catchable);
};