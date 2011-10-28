domShim._CustomEvent = function (type, dict) {
    domShim._Event.apply(this, arguments);
    var detail = dict && dict.detail;
    if (detail !== undefined) {
        this.detail = detail;
    }
}