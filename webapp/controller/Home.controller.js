sap.ui.define([
	"br/com/switch/salestem/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/Device"
], function(BaseController, JSONModel, MessageBox, Fragment, Filter, FilterOperator, Sorter, Device) {
	"use strict";

	return BaseController.extend("br.com.switch.salestem.controller.Home", {

		onInit: function() {
			this._oView = this.getView();

			this._oRouter = this.getRouter();

			this._mViewSettingsDialogs = {};

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
				Language: "system",
				Pages: {
					VisibleHome: true,
					VisibleCompQuimicos: false,
				}
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
			var sTokenLogin = localStorage.getItem("infoLogin");
			var sTokenRegister = localStorage.getItem("infoRegister");

			if (sToken != null) {

				if (sTokenLogin != null && sToken != sTokenLogin) {
					this._oRouter.navTo("login", {}, {});
					return;
				}

				if (sTokenRegister != null && sToken != sTokenRegister) {
					this._oRouter.navTo("login", {}, {});
					return;
				}
				return;
			} else {
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


		onShowHome: function() {
			this._oModelView.setProperty("/Pages/VisibleHome", true);
			this._oModelView.setProperty("/Pages/VisibleCompQuimicos", false);
		},

		onShowCompQuimicos: function() {
			this._oModelView.setProperty("/Pages/VisibleHome", false);
			this._oModelView.setProperty("/Pages/VisibleCompQuimicos", true);
		},


		/* COMP. QUÍMICOS */

		getViewSettingsDialog: function (sDialogFragmentName) {
			var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!pDialog) {
				pDialog = Fragment.load({
					id: this.getView().getId(),
					name: sDialogFragmentName,
					controller: this
				}).then(function (oDialog) {
					if (Device.system.desktop) {
						oDialog.addStyleClass("sapUiSizeCompact");
					}
					return oDialog;
				});
				this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
			}
			return pDialog;
		},

		handleSortButtonPressed: function () {
			this.getViewSettingsDialog("br.com.switch.salestem.view.fragments.SortDialog")
				.then(function (oViewSettingsDialog) {
					oViewSettingsDialog.open();
				});
		},

		handleSortDialogConfirm: function (oEvent) {
			var oTable = this.byId("table_comp_qui");
			var	mParams = oEvent.getParameters();
			var	oBinding = oTable.getBinding("items");
			var	sPath;
			var	bDescending;
			var	aSorters = [];

			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));

			// apply the selected sort and group settings
			oBinding.sort(aSorters);
		},


		// _filter: function() {
		// 	var oFilter = null;

		// 	if (this._oGlobalFilter) {
		// 		oFilter = this._oGlobalFilter;
		// 	}
		// 	this.byId("table_comp_qui").getBinding().filter(oFilter, "Application");
		// },

		// filterGlobally: function(oEvent) {
		// 	var sQuery = oEvent.getParameter("query");
		// 	this._oGlobalFilter = null;

		// 	if (sQuery) {
		// 		this._oGlobalFilter = new Filter([
		// 			new Filter("NomeCompQui", FilterOperator.Contains, sQuery),
		// 			new Filter("FormulaCompQui", FilterOperator.Contains, sQuery)
		// 		], false);
		// 	}

		// 	this._filter();
		// },

		// onClearAllFilters: function(oEvent) {
		// 	var oTable = this.byId("table_comp_qui");

		// 	var oUiModel = this.getView().getModel("ui");
		// 	oUiModel.setProperty("/Ui/TableCompQui/FiltroGlobal", "");

		// 	this._oGlobalFilter = null;
		// 	this._filter();

		// 	var aColumns = oTable.getColumns();
		// 	for (var i = 0; i < aColumns.length; i++) {
		// 		oTable.filter(aColumns[i], null);
		// 	}
		// },
    });
});
