sap.ui.define([
	"br/com/switch/salestem/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"br/com/switch/salestem/model/compQuiHandler"
], function(BaseController, JSONModel, MessageBox, CompQuiHandler) {
	"use strict";

	return BaseController.extend("br.com.switch.salestem.controller.Home", {

		onInit: function() {
			this._oView = this.getView();
			this._oRouter = this.getRouter();

			this._mViewSettingsDialogs = {};

			this._oModelView = new JSONModel(this._setOModelView());
			this._oView.setModel(this._oModelView, "homeView");
			
			this._oView.setBusyIndicatorDelay(0);

			this._setLanguage();
			this._checkTheme();
			
			this._oModelView.setProperty("/Theme", this.sTheme);
			this._oRouter.getRoute("home").attachPatternMatched(this._onRouteMatched, this);
		},

		_setOModelView: function() {
			var oModel = {
				Theme: "system",
				Language: "system",
				Pages: {
					VisibleHome: true,
					VisibleCompQuimicos: false,
				},
				TableCompQui: {
					Items: [
						{
							"NomeCompQui": "Ácido Acético",
							"FormulaCompQui": "CH3COOH",
						},
						{
							"NomeCompQui": "Ácido Clorídrico",
							"FormulaCompQui": "HCl",
						},
						{
							"NomeCompQui": "Ácido Fluorídrico",
							"FormulaCompQui": "HF",
						},
						{
							"NomeCompQui": "Ácido Fosfórico",
							"FormulaCompQui": "H3PO4",
						}
					]
				},
				Ui: {
					TableCompQui: {
						FiltroGlobal: ""
					}
				}
			}
			return oModel;
		},

		/* ========== */
		/* VALIDA URL */
		/* ========== */
		_onRouteMatched: function(oEvent) {
			var oArgs = oEvent.getParameter("arguments");
			var sToken = oArgs.token;
			var sTokenLogin = localStorage.getItem("infoLogin");
			var sTokenRegister = localStorage.getItem("infoRegister");

			this._oView.setBusy(true);

			if (sToken != null) {

				if (sTokenLogin != null && sToken != sTokenLogin) {
					this._oView.setBusy(false);
					this._oRouter.navTo("login", {}, {});
					return;
				}

				if (sTokenRegister != null && sToken != sTokenRegister) {
					this._oView.setBusy(false);
					this._oRouter.navTo("login", {}, {});
					return;
				}
				this._oView.setBusy(false);
				return;
			} else {
				this._oView.setBusy(false);
				MessageBox.error(this.getResourceBundle().getText("msgBox.invalidToken"), {
					title: this.getResourceBundle().getText("msgBox.invalidTokenTitle"),
					onClose: function(oAction) {
						localStorage.removeItem("infoLogin");
						localStorage.removeItem("infoRegister");
						this._oRouter.navTo("login", {}, {});
					}
				});
			}
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
			this.byId("dialog_config").close();
		},

		onShowHome: function() {
			this._oModelView.setProperty("/Pages/VisibleHome", true);
			this._oModelView.setProperty("/Pages/VisibleCompQuimicos", false);
		},

		onShowCompQuimicos: function() {
			this._oModelView.setProperty("/Pages/VisibleHome", false);
			this._oModelView.setProperty("/Pages/VisibleCompQuimicos", true);
		},

		/* ============== */
		/* COMP. QUÍMICOS */
		handleSortButtonPressed: function () {
			CompQuiHandler.getViewSettingsDialog("br.com.switch.salestem.view.fragments.SortDialog", this)
				.then(function (oViewSettingsDialog) {
					oViewSettingsDialog.open();
				});
		},

		handleSortDialogConfirm: function (oEvent) {
			CompQuiHandler.handleSortDialogConfirm(this.byId("table_comp_qui"), oEvent);			
		},

		onFilterCompQui: function(oEvent) {
			CompQuiHandler.setFilterBinding(
				oEvent.getParameter("query"), 
				this.byId("table_comp_qui")
			);
		},
		
		onLCFilterGlobalCompQui: function(oEvent) {
			CompQuiHandler.setFilterBinding(
				oEvent.getParameter("newValue"), 
				this.byId("table_comp_qui")
			);
		},
		/* COMP. QUÍMICOS */
		/* ============== */

		
    });
});
