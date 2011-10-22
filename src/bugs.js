(function () {
	var txt = document.createTextNode("temp"),
		el = document.createElement("p");

	el.appendChild(txt);

	try {
		el.contains(txt);
	} catch (e) {
		// The contains method fails on text nodes in IE8
		// swap the contains method for our contains method
		addPropsToProtoForEach(
			{
				"contains": {
					value: _contains,
					force: true	
				}
			},
			NodeProto,
			"contains"
		);
	}
})();

(function () {
	function _cloneNodeOnProto(proto) {
		var cloneNodePD = Object.getOwnPropertyDescriptor(proto, "cloneNode");
		if (cloneNodePD === undefined) {
			cloneNodePD = {
				"enumerable": true,
				"writable": true,
				"configurable": true
			};
		}
		var oldCloneNode = cloneNodePD.value;
		cloneNodePD.value = function _cloneNode(bool) {
			if (bool === undefined) {
				bool = true;
			}
			return oldCloneNode.call(this, bool);
		};
		var flag = Object.defineProperty(proto, "cloneNode", cloneNodePD);
		console.log(proto.cloneNode);
	}
	var el = document.createElement("p");

	try {
		el.cloneNode();
	} catch (e) {
		if (e.message === "Not enough arguments") {
			// Firefox things the argument is not optional
			[
				NodeProto,
				CommentProto,
				ElementProto,
				ProcessingInstructionProto,
				DocumentProto,
				DocumentTypeProto,
				DocumentFragmentProto
			].forEach(_cloneNodeOnProto);

			Object.keys(HTMLEls).forEach(function (name) {
				_cloneNodeOnProto(HTMLEls[name].prototype);
			});
		}
	}
})();