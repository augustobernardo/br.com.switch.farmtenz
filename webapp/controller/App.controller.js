sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("br.com.switch.salestem.controller.App", {
		onInit: function () {
			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			let bDarkTheme = window.matchMedia("(prefers-color-scheme: dark)");
			sap.ui.getCore().applyTheme(bDarkTheme.matches ? "sap_horizon_dark" : "sap_horizon");
		}
	});
});
