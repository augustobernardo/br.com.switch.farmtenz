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
		 * @public
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
		 * @public
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
		 * @public
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
		 * Create the Chemical Composition
		 * @public
		 * @param {Object} _this - Controller of the View
		 */
		createCompQui: function(_this) {
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

		/**
		 * Check if the Chemical Composition already exists
		 * @private
		 * @param {Object} _this - Controller of the View
		 * @param {Object} oEntry - Object with the new Chemical Composition
		 * @param {Array} aTableItems - Array with the Chemical Composition
		 * @returns {Boolean} - True if the Chemical Composition already exists
		 */
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

		/**
		 * Convert to Upper Case the Object Values
		 * @private
		 * @param {Object} oObject - Object to be converted
		 * @returns {Object} - Object with the values in Upper Case
		 */
		_toUpperCaseObjectValues: function(oObject) {
			const oObjectAux = oObject;
			const oObjectFinal = {};

			for (const sKey in oObject) {
				if (oObjectAux.hasOwnProperty(sKey)) {
					oObjectFinal[sKey] = oObjectAux[sKey].toUpperCase();
				}
			}
			return oObjectFinal;
		},

		/**
		 * Edit the line of Chemical Composition
		 * @public
		 * @param {Object} oEvent - Event of the Button
		 * @param {Object} _this - Controller of the View
		 */
		editRowCompQui: function(oEvent, _this) {
			var oRow = oEvent.getSource().getParent();
			var oRowContext = oRow.getBindingContext("compQuiTable");
			var oRowObject = oRowContext.getObject();
			var sSelectedKey = oRowObject.FormaMedidaCompQui.toLocaleLowerCase().trim() === "gramas" ? "0" : "1";

			var oModelEdit = {
				NomeComp: oRowObject.NomeCompQui,
				Formula: oRowObject.FormulaCompQui,
				FormaMedidaCompQui: sSelectedKey,
			};

			_this._oModelViewCompQui.setProperty("/EditRow", true);
			_this._oModelViewCompQui.setProperty("/NewCompQui", oModelEdit)
		},

		/**
		 * Delete the line of Chemical Composition
		 * @public
		 * @param {Object} oEvent - Event of the Button
		 * @param {Object} _this - Controller of the View
		 */
		deleteRowCompQUi: function(oEvent, _this) {
			var oRow = oEvent.getSource().getParent();
			var oRowContext = oRow.getBindingContext("compQuiTable");
			var oRowObject = oRowContext.getObject();
			
			var oModelTable = _this._oModelViewTableCompQui.getProperty("/TableCompQui");
			var oItems = oModelTable.Items;
			var oIndex = oItems.findIndex(x => x.NomeCompQui === oRowObject.NomeCompQui);
			
			oItems.splice(oIndex, 1);
			_this._oModelViewTableCompQui.setProperty("/TableCompQui/Items", oItems);
			_this._oModelViewTableCompQui.refresh();
		},

		/**
		 * Save the Chemical Composition
		 * @public
		 * @param {Object} _this - Controller of the View
		 */
		saveEditCompQui: function(_this) {
			var oRowTable = _this.getView().getModel("compQuiTable").getData().TableCompQui.Items[0];
			var oEditedCompQui = _this.getView().getModel("compQuiView").getData().NewCompQui;

			var sGrama = _this.getResourceBundle().getText("select.item.measure.grama");
			var sMililitro = _this.getResourceBundle().getText("select.item.measure.mililitro");
			var sFormaMedida = oEditedCompQui.FormaMedidaCompQui === "0" ? sGrama : sMililitro;

			var aCompQuiTableData = _this.getView().getModel("compQuiTable");
			var sPathRowOld = _this.oSelectedRowEditCompQui.oBindingContexts.compQuiTable.sPath;
			var oRowOld = aCompQuiTableData.getProperty(sPathRowOld);

			var aItems = aCompQuiTableData.getData().TableCompQui.Items;
			var aItemsNew = aItems.map(function(oItem) {
				if (oItem.NomeCompQui === oRowOld.NomeCompQui &&
					oItem.FormulaCompQui === oRowOld.FormulaCompQui &&
					oItem.FormaMedidaCompQui === oRowOld.FormaMedidaCompQui) {
					
					return {
						"NomeCompQui": oEditedCompQui.NomeComp,
						"FormulaCompQui": oEditedCompQui.Formula,
						"FormaMedidaCompQui": sFormaMedida
					};
				} else {
					return oItem;
				}
			});
			aCompQuiTableData.setProperty("/TableCompQui/Items", aItemsNew);
			aCompQuiTableData.refresh(true);
		},
	};
});
