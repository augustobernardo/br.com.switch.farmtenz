sap.ui.define([
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/ui/Device",
	"sap/ui/core/ValueState"
],function(Sorter, Filter, FilterOperator, Fragment, Device, ValueState) {
	"use strict";

	return {

		/**
		 * Set the Filter for the Table
		 * @param {String} sValue - Value to be filtered
		 * @param {Object} oTable - Table to be filtered
		 */
		setFilterBinding: function(sValue, oTable) {
			var aFilters = [];

			if (sValue) {
				aFilters.push(new Filter("NomeCompQui", FilterOperator.Contains, sValue));
			}
			var oBinding = oTable.getBinding();
			oBinding.filter(aFilters);
		},

		/**
		 * Set the Sorter for the Table
		 * @param {Object} oTable - Table to be sorted
		 * @param {Object} oEvent - Event from the Button of Dialog
		 */
		handleSortDialogConfirm: function(oTable, oEvent) {
			var mParams = oEvent.getParameters();
			var oBinding = oTable.getBinding();
			var sPath;
			var bDescending;
			var aSorters = [];

			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			
			oBinding.sort(aSorters);
		},

		/**
		 * Get the ViewSettingsDialog Fragment
		 * @param {String} sDialogFragmentName - Name of the Fragment
		 * @param {Object} _this - This of the Controller
		 * @returns {Object} - Fragment
		 */
		getViewSettingsDialog: function (sDialogFragmentName, _this) {
			var pDialog = _this._mViewSettingsDialogs[sDialogFragmentName];
			var oView = _this._oView;

			if (!pDialog) {
				pDialog = Fragment.load({
					id: oView.getId(),
					name: sDialogFragmentName,
					controller: _this
				}).then(function (oDialog) {
					if (Device.system.desktop) {
						oDialog.addStyleClass("sapUiSizeCompact");
					}
					oDialog.setModel(oView.getModel("i18n"), "i18n");
					return oDialog;
				});
				_this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
			}
			return pDialog;
		},

		/**
		 * Load the Fragment
		 * @param {Object} _this - Controller of the View
		 */
		createCompQui: function(_this) {
			var oInputNomeComp = _this.byId("inp_create_comp_qui_name");
			var oInputFormula = _this.byId("inp_create_comp_qui_formula");
			var oSelectMeasure = _this.byId("sel_create_comp_qui_measure");
			var sNomeComp = _this._oModelViewCompQui.getProperty("/NewCompQui/NomeComp");
			var sFormula = _this._oModelViewCompQui.getProperty("/NewCompQui/Formula");
			var sFormaMedida = oSelectMeasure.getSelectedItem().getText();

			_this._oView.setBusy(true);

			if (sNomeComp === "" || sFormula === "") {
				if (sNomeComp === "") {
					_this._oModelViewCompQui.setProperty("/StateControl/NomeCompState", ValueState.Error);
				}
				if (sFormula === "") {
					_this._oModelViewCompQui.setProperty("/StateControl/FormulaState", ValueState.Error);
				}
				return;				
			}

			_this._oModelViewCompQui.setProperty("/StateControl/NomeCompState", ValueState.None);
			_this._oModelViewCompQui.setProperty("/StateControl/FormulaState", ValueState.None);

			var oTable = _this.byId("table_comp_qui");
			var oBinding = oTable.getBinding();
			var sPath = oBinding.getPath();
			
			var oNewCompQui = {
				"NomeCompQui": sNomeComp,
				"FormulaCompQui": sFormula,
				"FormaMedidaCompQui": sFormaMedida
			}

			if (this._checkCompQuiExists(_this, oNewCompQui, oBinding.getModel().getProperty(sPath))) {
				_this._oView.setBusy(false);
				sap.m.MessageToast.show(_this.getResourceBundle().getText("compQuiAlreadyExists"));
				return;
			} else {
				var oModel = oBinding.getModel();
				var aItems = oModel.getProperty(sPath);
				
				aItems.push(oNewCompQui);
				oModel.setProperty(sPath, aItems);
				oModel.refresh(true);
	
				_this._oModelViewCompQui.setData(_this._setOModelViewCompQui());
			}
			_this._oView.setBusy(false);
		},

		_checkCompQuiExists: function(_this, oEntry, aTableItems) {
			var bExists = false;
			var oEntryAux = this._toUpperCaseObjectValues(oEntry);

			for (var i = 0; i < aTableItems.length; i++) {
				var oItem = this._toUpperCaseObjectValues(aTableItems[i]);

				if (oEntryAux.NomeCompQui == oItem.NomeCompQui 
					&& oEntryAux.FormulaCompQui == oItem.FormulaCompQui 
					&& oEntryAux.FormaMedidaCompQui == oItem.FormaMedidaCompQui) {
					bExists = true;
					break;
				}
			}
			return bExists;
		},

		_toUpperCaseObjectValues: function(oObject) {
			const oObjectAux = oObject;
			const oObjectFinal = {};

			for (const sKey in oObject) {
				if (oObjectAux.hasOwnProperty(sKey)) {
					oObjectFinal[sKey] = oObjectAux[sKey].toUpperCase();
				}
			}
			return oObjectFinal;
		}
	};
});
