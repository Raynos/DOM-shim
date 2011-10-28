var eventConsts = {
    CAPTURING_PHASE: 1,
    AT_TARGET: 2,
    BUBBLING_PHASE: 3
};

domShim.utils.addConstsToObject(eventConsts, domShim.Event.prototype);