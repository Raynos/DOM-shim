(function () {
	var txt = document.createTextNode("temp"),
		el = document.createElement("p");

	el.appendChild(txt);

	try {
		console.log("calling contains");
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