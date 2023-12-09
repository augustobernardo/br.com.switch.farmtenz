sap.ui.define([
	"br/com/switch/farmtenz/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"br/com/switch/farmtenz/scripts/compQuiHandler",
	"br/com/switch/farmtenz/scripts/inpOutHandler",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
], function(BaseController, JSONModel, MessageBox, CompQuiHandler, InpOutHandler, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("br.com.switch.farmtenz.controller.Home", {

		onInit: function() {
			this._oView = this.getView();
			this._oRouter = this.getRouter();

			this._mViewSettingsDialogs = {};

			this._oModelView = new JSONModel(this._setOModelView());
			this._oView.setModel(this._oModelView, "homeView");

			// ENTRADA E SAÍDA
			this._oModelViewInpOut = new JSONModel(this._setOModelViewInpOut());
			this._oView.setModel(this._oModelViewInpOut, "inpOutView");

			this._oModelViewTableInpOut = new JSONModel(this._setOModelViewTableInpOut());
			this._oView.setModel(this._oModelViewTableInpOut, "inpOutTable");

			// COMP. QUÍMICOS
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

		/**
		 * @override
		 */
		onAfterRendering: function() {
			try {
				var aTableCompQuiData = this.getLocalStorage("tableCompQuiItems");
				var aTableInpOut = this.getLocalStorage("inpOutTable");
	
				if (aTableCompQuiData) {
					this._oModelViewTableCompQui.setProperty("/TableCompQui/Items", aTableCompQuiData);
				}
	
				if (aTableInpOut) {
					this._oModelViewTableInpOut.setProperty("/TableInOut/Items", aTableInpOut);
				}

			} catch (error) {
				this._oModelViewTableCompQui.setProperty("/TableCompQui/Items",[]);
				this._oModelViewTableInpOut.setProperty("/TableInOut/Items",[]);
			}
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
					IdCompQui: 0,
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

		_setOModelViewInpOut: function() {
			var oModelInpOut = {
				NewInpOut: {
					IdInpOut: 0,
					NomeComp: "",
					Formula: "",
					FormaMedidaCompQui: "",
					DataRegistro: null,
					DataRegistroFormatted: "",
					Quantidade: "",
					UnidadeMedida: "",
					Tipo: "",
					TipoSelectedKey: 0,
					Observacoes: "",
				},
				SearchHelp: {
					TableCompQui: [],
				},
				StateControl: {
					NomeCompState: "None",
					FormulaState: "None",
					DataRegistroState: "None",
					QuantidadeState: "None",
					UnidadeMedidaState: "None",
					ObservacoesState: "None",
				},
			}
			return oModelInpOut;
		},


		_setOModelViewTableInpOut: function() {
			var oModelTable = {
				TableInOut: {
					Items: []
				},
				Ui: {
					TableInOut: {
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
			this.pDialog ??= this.loadFragment({
				name: "br.com.switch.farmtenz.view.fragments.ConfigDialog"
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

		onValueHelpRequest: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue(),
				oView = this.getView();
				
			var sInputValueModel = this._oModelViewInpOut.getProperty("/NewInpOut/NomeComp");

			var aTableCompQui = this._oModelViewTableCompQui.getProperty("/TableCompQui/Items");
			
			this._oModelViewInpOut.setProperty("/SearchHelp/TableCompQui", aTableCompQui);

			if (!this._pValueHelpDialog) {
				this._pValueHelpDialog = this.loadFragment({
					id: oView.getId(),
					name: "br.com.switch.farmtenz.view.fragments.ValueHelpDialog",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}
			this._pValueHelpDialog.then(function(oDialog) {
				oDialog.getBinding("items").filter([new Filter("NomeCompQui", FilterOperator.Contains, sInputValue)]);
				oDialog.open(sInputValueModel);
			});
		},

		onValueHelpSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("NomeCompQui", FilterOperator.Contains, sValue);

			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		onValueHelpClose: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			oEvent.getSource().getBinding("items").filter([]);

			if (!oSelectedItem) {
				return;
			}

			this._oModelViewInpOut.setProperty("/NewInpOut/NomeComp", oSelectedItem.getTitle());
			this._oModelViewInpOut.setProperty("/NewInpOut/Formula", oSelectedItem.getDescription());
			this._oModelViewInpOut.setProperty("/NewInpOut/FormaMedidaCompQui", oSelectedItem.getInfo());
		},

		/* ================= */
		/* ENTRADAS E SAÍDAS */
		onShowCreateInpOutDialog: function(oEvent) {
			this.pDialogCreateInpOut ??= this.loadFragment({
				name: "br.com.switch.farmtenz.view.fragments.operations.CreateInpOut"
			});
			this.pDialogCreateInpOut.then((oDialog) => oDialog.open())
		},

		onPressSaveInpOut: function (oEvent) {
			var bError = InpOutHandler.createInpOut(this);
			if (bError) {
				this.onPressCancelInpOut();
				this.optCols(this.byId("table_home"));
			}
		},

		onPressCancelInpOut: function() {
			this.byId("dialog_create_inp_out").close();
			this._oModelViewInpOut.setData(this._setOModelViewInpOut());
		},

		onEditRowInpOut: function(oEvent) {
			this.oSelectedRowEditInpOut = oEvent.getParameter("row");

			InpOutHandler.editRowInpOut(oEvent, this);
			this._handleDialogEditInpOut(true);
		},

		onPressSaveEditInpOut: function(oEvent) {
			var bError = InpOutHandler.saveEditInpOut(this);
			if (!bError) {
				this._handleDialogEditInpOut(false);
			}
		},

		onPressCancelEditInpOut: function(oEvent) {
			this._handleDialogEditInpOut(false);
		},

		onDeleteRowInpOut: function(oEvent) {
			InpOutHandler.deleteRowInpOut(oEvent, this);
		},

		_handleDialogEditInpOut: function(bShow) {
			if (bShow) {
				this.pDialogEditInpOut ??= this.loadFragment({
					name: "br.com.switch.farmtenz.view.fragments.operations.EditInpOut"
				});
				this.pDialogEditInpOut.then((oDialog) => oDialog.open());
			} else {
				this.byId("dialog_edit_inp_out").close();
				this._oModelViewInpOut.setData(this._setOModelViewInpOut());
			}
		},

		handleSortButtonPressedInpOut: function () {
			InpOutHandler.getViewSettingsDialog("br.com.switch.farmtenz.view.fragments.SortDialogInpOut", this)
				.then(function (oViewSettingsDialog) {
					oViewSettingsDialog.open();
				});
		},

		handleSortDialogConfirmInpOut: function (oEvent) {
			InpOutHandler.handleSortDialogConfirmInpOut(this.byId("table_home"), oEvent);
		},

		onLCFilterGlobalInpOut: function(oEvent) {
			InpOutHandler.setFilterBinding(
				oEvent.getParameter("newValue"),
				this.byId("table_home")
			);
		},

		onFilterInpOut: function(oEvent) {
			InpOutHandler.setFilterBinding(
				oEvent.getParameter("query"),
				this.byId("table_home")
			);
		},
		/* ENTRADAS E SAÍDAS */
		/* ================= */

		/* ============== */
		/* COMP. QUÍMICOS */
		handleSortButtonPressed: function () {
			CompQuiHandler.getViewSettingsDialog("br.com.switch.farmtenz.view.fragments.SortDialog", this)
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
				name: "br.com.switch.farmtenz.view.fragments.operations.CreateCompDialog"
			});
			this.pDialogCreateComp.then((oDialog) => oDialog.open())
		},

		onPressCreateCompQui: function (oEvent) {
			var bError = CompQuiHandler.createCompQui(this);
			if (!bError) {
				this.onPressCancelCreateCompQui();
			}
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
					name: "br.com.switch.farmtenz.view.fragments.operations.EditCompQuiDialog"
				});
				this.pDialogEditComp.then((oDialog) => oDialog.open());
			} else {
				this.byId("dialog_edit_comp_qui").close();
				this._oModelViewCompQui.setData(this._setOModelViewCompQui());
			}
		},

		onEditRowCompQui: function(oEvent) {
			this.oSelectedRowEditCompQui = oEvent.getParameter("row");

			CompQuiHandler.editRowCompQui(oEvent, this);
			this._handleDialogEditCompQui(true);
		},
		
		onDeleteRowCompQui: function(oEvent) {
			CompQuiHandler.deleteRowCompQUi(oEvent, this);
		},
		
		onPressSaveEditCompQui: function(oEvent) {
			var bError = CompQuiHandler.saveEditCompQui(this);
			
			if (!bError) {
				this._handleDialogEditCompQui(false);
			}
		},
		
		onPressCancelEditCompQui: function(oEvent) {
			this._handleDialogEditCompQui(false);
		},
		/* COMP. QUÍMICOS */
		/* ============== */

    });
});
