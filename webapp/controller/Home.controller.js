sap.ui.define([
	"br/com/switch/salestem/controller/BaseController",
	"sap/ui/model/json/JSONModel",
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("br.com.switch.salestem.controller.Home", {

		onInit: function() {
			this._oView = this.getView();

			this._oRouter = this.getRouter();

			this._oModelView = new JSONModel(this._setOModelView());
			this._oView.setModel(this._oModelView, "homeView");


			this._setLanguage();

			this._checkTheme();

			this._oModelView.setProperty("/Theme", this.sTheme);

			this._oRouter.getRoute("home").attachPatternMatched(this._onRouteMatched, this);
		},

		_setOModelView: function() {
			var oModel = {
				Theme: "system",
				Language: "system"
			}
			return oModel;
		},

		_checkTheme: function() {
			var sThemeLocal = localStorage.getItem("ThemeMode");
			this.sTheme = "";

			if (sThemeLocal) {
				this.sTheme = sThemeLocal == "dark" ? "sap_horizon_dark" : "sap_horizon";

				if (sThemeLocal == "dark") {
					this.applyTheme("sap_horizon_dark");
				} else {
					this.applyTheme("sap_horizon");
				}

			} else {
				this.sTheme = sap.ui.getCore().getConfiguration().getTheme();

				if (this.sTheme == "sap_horizon") {
					this._oModelView.setProperty("/isDarkMode", false);
					this._oModelView.setProperty("/isLightMode", true);
				}

				if (this.sTheme == "sap_horizon_dark") {
					this._oModelView.setProperty("/isDarkMode", true);
					this._oModelView.setProperty("/isLightMode", false);
				}
			}

		},

		_setLanguage: function() {
			var sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
			this._oModelView.setProperty("/Language", sLanguage);
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

		onChangeSelectTheme: function(oEvent) {
			var sTheme = oEvent.getSource().getSelectedKey();

			if (sTheme == "sap_horizon") {
				localStorage.setItem("Theme", sTheme);
			} else {
				localStorage.setItem("Theme", sTheme);
			}
		},

		onChangeSelectLanguage: function(oEvent) {
			var sLanguage = oEvent.getSource().getSelectedKey();
			localStorage.setItem("Language", sLanguage);
		},

		onShowConfigDialog: function() {
			// create dialog lazily
			this.pDialog ??= this.loadFragment({
				name: "br.com.switch.salestem.view.fragments.ConfigDialog"
			});
			this.pDialog.then((oDialog) => oDialog.open())
		},

		onSaveConfig: function() {
			let sTheme = this._oModelView.getProperty("/Theme");
			let sLanguage = this._oModelView.getProperty("/Language");

			if (sTheme == "system") {
				sTheme = this.getSystemTheme();
			}

			if (sLanguage == "system") {
				sLanguage = this.getSystemLanguage();
			}

			this.applyTheme(sTheme);
			this.applyLanguage(sLanguage);
		},

		onCloseConfigDialog: function() {
			// reset the values of the config dialog
			this.byId("dialog_config").close();

			this._oModelView.setProperty("/Theme", this.getSystemTheme());
			this._oModelView.setProperty("/Language", this.getSystemLanguage());
		},

    });
});
