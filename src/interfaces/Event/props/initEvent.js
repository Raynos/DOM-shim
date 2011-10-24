function _initEvent(type, bubbles, cancelable) {
    this.type = type;
    this.isTrusted = false;
    this.target = null;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
};

domShim.props.Event.initEvent = {
    value: _initEvent  
};