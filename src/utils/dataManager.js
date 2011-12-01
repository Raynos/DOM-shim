var uuid = 0,
    domShimString = "__domShim__";

var dataManager = {
    _stores: {},
    getStore: function _getStore(el) {
        var id = el[domShimString ];
        if (id === undefined) {
            return this._createStore(el);
        }
        return this._stores[domShimString + id];
    },
    _createStore: function _createStore(el) {
        var store = {};
        this._stores[domShimString + uuid] = store;
        el[domShimString ] = uuid;
        uuid++;
        return store;
    }
};

module.exports = dataManager;

