sap.ui.define([
	"br/com/switch/salestem/controller/BaseController",
	"sap/ui/model/json/JSONModel",
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("br.com.switch.salestem.controller.Home", {

        onInit: function() {
			this._oView = this.getView();

			this._oRouter = this.getRouter();

			this._oModel = new JSONModel(this._setOModelView());
			this._oView.setModel(this._oModel, "homeView");

			this._checkTheme();

			this._oRouter.getRoute("home").attachPatternMatched(this._onRouteMatched, this);
		},

		_setOModelView: function() {
			var oModel = {
				isDarkMode: false,
				isLightMode: true,
			}
			return oModel;
		},

		_checkTheme: function() {
			var sThemeLocal = localStorage.getItem("ThemeMode");
			this.sTheme = "";

			if (sThemeLocal) {
				this.sTheme = sThemeLocal == "dark" ? "sap_horizon_dark" : "sap_horizon";

				if (sThemeLocal == "dark") {
					this._oModel.setProperty("/isDarkMode", true);
					this._oModel.setProperty("/isLightMode", false);
					this.applyTheme("sap_horizon_dark");
				} else {
					this._oModel.setProperty("/isDarkMode", false);
					this._oModel.setProperty("/isLightMode", true);
					this.applyTheme("sap_horizon");
				}

			} else {
				this.sTheme = sap.ui.getCore().getConfiguration().getTheme();
	
				if (this.sTheme == "sap_horizon") {
					this._oModel.setProperty("/isDarkMode", false);
					this._oModel.setProperty("/isLightMode", true);
				}
	
				if (this.sTheme == "sap_horizon_dark") {
					this._oModel.setProperty("/isDarkMode", true);
					this._oModel.setProperty("/isLightMode", false);
				}
			}
			
		},

		// VALIDA URL
		_onRouteMatched: function(oEvent) {
			var oArgs = oEvent.getParameter("arguments");
			var sToken = oArgs.token;
			var aToken = sToken.split(":");

			var sCookieToken = atob(aToken[0]);
			var aCookieToken = sCookieToken.split(":");

			var sEmail = atob(aCookieToken[0]);
			var sPassword = atob(aCookieToken[1]);

			var aInfoLogin = localStorage.getItem("infoLogin");
			var aInfoRegister = localStorage.getItem("infoRegister");
			
			if (aInfoLogin != null) {
				var aLogin = aInfoLogin.split(":");
				var sEmailLogin = aLogin[0];
				var sPasswordLogin = aLogin[1];

				if (atob(sEmailLogin) == sEmail && atob(sPasswordLogin) == sPassword) {
					return;
				} else {
					this._oRouter.navTo("login", {}, {});
					return;
				}
			}

			if (aInfoRegister != null) {
				var aRegister = aInfoRegister.split(":");
				var sEmailRegister = aRegister[0];
				var sPasswordRegister = aRegister[1];

				if (atob(sEmailRegister) == sEmail && atob(sPasswordRegister) == sPassword) {
					return;
				} else {
					this._oRouter.navTo("login", {}, {});
					return;
				}
			}
		},

		onChangeTheme: function() {
			if (this.sTheme == "sap_horizon") {
				this._oModel.setProperty("/isDarkMode", true);
				this._oModel.setProperty("/isLightMode", false);

				this.applyTheme("sap_horizon_dark");
				localStorage.setItem("ThemeMode", "dark");
			} else {
				this._oModel.setProperty("/isDarkMode", false);
				this._oModel.setProperty("/isLightMode", true);

				this.applyTheme("sap_horizon");
				localStorage.setItem("ThemeMode", "light");
			}
		},
    });
});