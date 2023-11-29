sap.ui.define([
	"br/com/switch/salestem/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"br/com/switch/salestem/scripts/compQuiHandler"
], function(BaseController, JSONModel, MessageBox, CompQuiHandler) {
	"use strict";

	return BaseController.extend("br.com.switch.salestem.controller.Home", {

		onInit: function() {
			this._oView = this.getView();
			this._oRouter = this.getRouter();

			this._mViewSettingsDialogs = {};

			this._oModelView = new JSONModel(this._setOModelView());
			this._oView.setModel(this._oModelView, "homeView");

			this._oModelViewCompQui = new JSONModel(this._setOModelViewCompQui());
			this._oView.setModel(this._oModelViewCompQui, "compQuiView");

			this._oModelViewTableCompQui = new JSONModel(this._setOModelViewTableCompQui());
			this._oView.setModel(this._oModelViewTableCompQui, "compQuiTable");

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
			}
			return oModel;
		},

		_setOModelViewCompQui: function() {
			var oModelCompQui = {
				NewCompQui: {
					NomeComp: "",
					Formula: "",
					FormaMedidaCompQui: "",
				},
				StateControl: {
					NomeCompState: "None",
					FormulaState: "None",
				},
			}
			return oModelCompQui;
		},

		_setOModelViewTableCompQui: function() {
			var oModelTable = {
				TableCompQui: {
					Items: []
				},
				Ui: {
					TableCompQui: {
						FiltroGlobal: ""
					}
				},
			}
			return oModelTable;
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
			this._oModelView.setProperty("/Pages/VisibleInOutComp", true);
			this._oModelView.setProperty("/Pages/VisibleCompQuimicos", false);
		},

		onShowCompQuimicos: function() {
			this._oModelView.setProperty("/Pages/VisibleInOutComp", false);
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

		onShowCreateCompDialog: function(oEvent) {
			this.pDialogCreateComp ??= this.loadFragment({
				name: "br.com.switch.salestem.view.fragments.CreateCompDialog"
			});
			this.pDialogCreateComp.then((oDialog) => oDialog.open())
		},

		onPressCreateCompQui: function (oEvent) {
			CompQuiHandler.createCompQui(this);
			this.onPressCancelCreateCompQui();
		},

		onSubmitCreateQuiForm: function(oEvent) {
			CompQuiHandler.createCompQui(this);
			this.onPressCancelCreateCompQui();
		},

		onPressCancelCreateCompQui: function () {
			this.byId("dialog_create_comp_qui").close();
			this._oModelViewCompQui.setData(this._setOModelViewCompQui());
		},

		_handleDialogEditCompQui: function(bShow) {
			if (bShow) {
				this.pDialogEditComp ??= this.loadFragment({
					name: "br.com.switch.salestem.view.fragments.EditCompQuiDialog"
				});
				this.pDialogEditComp.then((oDialog) => oDialog.open());
			} else {
				this.byId("dialog_edit_comp_qui").close();
				this._oModelViewCompQui.setData(this._setOModelViewCompQui());
			}
		},

		onEditRowCompQui: function(oEvent) {
			this.oEventEditAction = oEvent;
			this.oSelectedRowItemCompQui = oEvent.getParameter("item");
			this.oSelectedRowEditCompQui = oEvent.getParameter("row");

			CompQuiHandler.editRowCompQui(oEvent, this);
			this._handleDialogEditCompQui(true);
		},
		
		onDeleteRowCompQui: function(oEvent) {
			CompQuiHandler.deleteRowCompQUi(oEvent, this);
		},
		
		onPressSaveEditCompQui: function(oEvent) {
			CompQuiHandler.saveEditCompQui(this);
			this._handleDialogEditCompQui(false);
		},
		
		onPressCancelEditCompQui: function(oEvent) {
			this._handleDialogEditCompQui(false);
		},
		/* COMP. QUÍMICOS */
		/* ============== */

    });
});
