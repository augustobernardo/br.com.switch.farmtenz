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
         * Create the Input and Output Data
         * @public
         * @param {Object} _this - Controller of the View
         */
        createInpOut: function(_this) {
            var oObject = _this._oModelViewInpOut.getProperty("/NewInpOut");
			var oObjectAux = oObject;
			var oObjectFinal = {};

			if (this._checkFormInpOut(_this)) {
				_this._oView.setBusy(false);
				return false;
			}
			
			for (const sKey in oObject) {
				if (oObjectAux.hasOwnProperty(sKey) && typeof oObjectAux[sKey] === "string") {
					oObjectAux[sKey].toUpperCase();
				} 
			}

            var oTable = _this._oModelViewTableInpOut.getProperty("/TableInOut");
            var aItems = oTable.Items;
            var iLastId = aItems.length > 0 ? aItems[aItems.length - 1].IdInpOut : 0;
			
            var sEntrada = _this.getResourceBundle().getText("table.column.inpOut.input");
            var sSaida = _this.getResourceBundle().getText("table.column.inpOut.output");

			var bHaveCommad = oObjectAux.Quantidade.indexOf(",") > -1;
			if (bHaveCommad) {
				oObjectAux.Quantidade = oObjectAux.Quantidade.replace(",", ".");
			} else{
				oObjectAux.Quantidade = oObjectAux.Quantidade.replace(".", ",");
			}

			var oNewInpOut = {
				"IdInpOut": iLastId + 1,
				"NomeComp": oObjectAux.NomeComp,
				"Quantidade": oObjectAux.Quantidade,
				"Observacoes": oObjectAux.Observacoes,
				"Formula": oObjectAux.Formula,
				"FormaMedidaCompQui": oObjectAux.FormaMedidaCompQui,
				"Tipo": oObjectAux.TipoSelectedKey === 0 ? sEntrada : sSaida,
				"TipoSelectedKey": oObjectAux.TipoSelectedKey,
				"StatusIcon": oObjectAux.TipoSelectedKey.toString() === "0" ? "sap-icon://inbox" : "sap-icon://outbox",
				"StatusState": oObjectAux.TipoSelectedKey === 0 ? ValueState.Success : ValueState.Error,
				"DataRegistro": oObjectAux.DataRegistro,
				"DataRegistroFormatted": oObjectAux.DataRegistroFormatted.split("-").reverse().join("/"),
			}

            if (this._checkInpOutExists(_this, oNewInpOut, aItems)) {
                _this._oView.setBusy(false);
				sap.m.MessageToast.show(_this.getResourceBundle().getText("inpOutAlreadyExists"));
				return false;
            }

            aItems.push(oNewInpOut);
            _this._oModelViewTableInpOut.setProperty("/TableInOut/Items", aItems);
            _this._oModelViewTableInpOut.refresh(true);
			_this._oView.setBusy(false);

			_this.setLocalStorage("inpOutTable", aItems);
			return true;
        },

		/**
		 * Check if the Input and Output Data is valid
		 * @private
		 * @param {Object} _this - Controller of the View
		 * @returns {Boolean} - If the Input and Output Data is valid
		 */
		_checkFormInpOut: function(_this) {
			var sNomeComp = _this._oModelViewInpOut.getProperty("/NewInpOut/NomeComp");
			var sDataRegistro = _this._oModelViewInpOut.getProperty("/NewInpOut/DataRegistroFormatted");
			var sObservacoes = _this._oModelViewInpOut.getProperty("/NewInpOut/Observacoes");
			var sQuantidade = _this._oModelViewInpOut.getProperty("/NewInpOut/Quantidade");
			var bError = false;

			_this._oView.setBusy(true);

			if (sNomeComp === "" || sDataRegistro === "" || sObservacoes === "" || sQuantidade === "") {
				if (sNomeComp === "") {
					_this._oModelViewInpOut.setProperty("/StateControl/NomeCompState", ValueState.Error);
				}
				if (sQuantidade === "") {
					_this._oModelViewInpOut.setProperty("/StateControl/QuantidadeState", ValueState.Error);
				}
				if (sDataRegistro === "") {
					_this._oModelViewInpOut.setProperty("/StateControl/DataRegistroState", ValueState.Error);
				}
				if (sObservacoes === "") {
					_this._oModelViewInpOut.setProperty("/StateControl/ObservacoesState", ValueState.Error);
				}
				bError = true;
			} else {
				_this._oModelViewInpOut.setProperty("/StateControl/NomeCompState", ValueState.None);
				_this._oModelViewInpOut.setProperty("/StateControl/QuantidadeState", ValueState.None);
				_this._oModelViewInpOut.setProperty("/StateControl/DataRegistroState", ValueState.None);
				_this._oModelViewInpOut.setProperty("/StateControl/ObservacoesState", ValueState.None);
			}
			return bError;
		},

		/**
		 * Check if the Input and Output Data already exists
		 * @private
		 * @param {Object} _this - Controller of the View
		 * @param {Object} oEntry - Input and Output Data
		 * @param {Object} aTableItems - Items of the Table
		 * @returns {Boolean} - If the Input and Output Data already exists
		 */
        _checkInpOutExists: function(_this, oEntry, aTableItems) {
            var bExists = false;
            var oEntryAuxParam = oEntry;
            var oEntryAux = _this.toUpperCaseObjectValues(oEntryAuxParam);

            for (var i = 0; i < aTableItems.length; i++) {
                var oItem = _this.toUpperCaseObjectValues(aTableItems[i]);

                if (oEntryAux.NomeComp == oItem.NomeComp 
                    && oEntryAux.IdInpOut == oItem.IdInpOut
                    && oEntryAux.Tipo == oItem.Tipo
                    && oEntryAux.TipoSelectedKey == oItem.TipoSelectedKey
                    && oEntryAux.Formula == oItem.Formula 
                    && oEntryAux.FormaMedidaCompQui == oItem.FormaMedidaCompQui) {
                    bExists = true;
                    break;
                }
            }
            return bExists;
        },


		/**
		 * Delete the line of Input and Output Data
		 * @public
		 * @param {Object} oEvent - Event of the Button
		 * @param {Object} _this - Controller of the View
		 */
		deleteRowInpOut: function(oEvent, _this) {
			var oRow = oEvent.getSource().getParent();
			var oRowContext = oRow.getBindingContext("inpOutTable");
			var oRowObject = oRowContext.getObject();
			
			var oModelTable = _this._oModelViewTableInpOut.getProperty("/TableInOut");
			var oItems = oModelTable.Items;
			var oIndex = oItems.findIndex(x => 
				x.IdInpOut == oRowObject.IdInpOut
				&& x.Tipo == oRowObject.Tipo
				&& x.TipoSelectedKey == oRowObject.TipoSelectedKey
				&& x.Formula == oRowObject.Formula 
				&& x.FormaMedidaCompQui == oRowObject.FormaMedidaCompQui);
			
			oItems.splice(oIndex, 1);
			_this._oModelViewTableInpOut.setProperty("/TableInOut/Items", oItems);
			_this._oModelViewTableInpOut.refresh();

			_this.setLocalStorage("inpOutTable", oItems);
		},

		/**
		 * Edit the line of Input and Output Data
		 * @public
		 * @param {Object} oEvent - Event of the Button
		 * @param {Object} _this - Controller of the View
		 */
		editRowInpOut: function(oEvent, _this) {
			var oObject = oEvent.getSource().getBindingContext("inpOutTable").getObject();
			var oObjectAux = oObject;
			var oObjectFinal = {};

			for (const sKey in oObject) {
				if (oObjectAux.hasOwnProperty(sKey) && typeof oObjectAux[sKey] === "string") {
					oObjectAux[sKey].toUpperCase();
				} 
			}
			_this._oModelViewInpOut.setProperty("/NewInpOut", oObject);
			_this._oModelViewInpOut.refresh(true);
		},


		/**
		 * Save the line of Input and Output Data
		 * @public
		 * @param {Object} _this - Controller of the View
		 */

		saveEditInpOut: function(_this) {
			var oRowTable = _this.getView().getModel("inpOutTable").getData().TableInOut.Items[0];
			var oEditedInpOut = _this.getView().getModel("inpOutView").getData().NewInpOut;

			var sGrama = _this.getResourceBundle().getText("select.item.measure.grama");
			var sMililitro = _this.getResourceBundle().getText("select.item.measure.mililitro");
			
			var sFormaMedidaSelected = oEditedInpOut.FormaMedidaCompQui;
			var sFormaMedida = sFormaMedidaSelected === "0" ? sGrama : sMililitro;

			var aInpOutTableData = _this.getView().getModel("inpOutTable");
			var sPathRowOld = _this.oSelectedRowEditInpOut.oBindingContexts.inpOutTable.sPath;
			var oRowOld = aInpOutTableData.getProperty(sPathRowOld);

			var aItems = aInpOutTableData.getData().TableInOut.Items;

			var sEntrada = _this.getResourceBundle().getText("table.column.inpOut.input");
			var sSaida = _this.getResourceBundle().getText("table.column.inpOut.output");

			if (this._checkFormInpOut(_this)) {
				return true;
			}

			var aItemsNew = aItems.map(function(oItem) {
				var oItemAux = JSON.stringify(oItem);
				var oRowOldAux = JSON.stringify(oRowOld);

				if (oItemAux === oRowOldAux) {
					
					return {
						"IdInpOut": oEditedInpOut.IdInpOut,
						"NomeComp": oEditedInpOut.NomeComp,
						"Quantidade": oEditedInpOut.Quantidade,
						"Observacoes": oEditedInpOut.Observacoes,
						"Formula": oEditedInpOut.Formula,
						"FormaMedidaCompQui": oEditedInpOut.FormaMedidaCompQui,
						"Tipo": oEditedInpOut.TipoSelectedKey === 0 ? sEntrada : sSaida,
						"TipoSelectedKey": oEditedInpOut.TipoSelectedKey,
						"StatusIcon": oEditedInpOut.TipoSelectedKey.toString() === "0" ? "sap-icon://inbox" : "sap-icon://outbox",
						"StatusState": oEditedInpOut.TipoSelectedKey === 0 ? ValueState.Success : ValueState.Error,
						"DataRegistro": oEditedInpOut.DataRegistro,
						"DataRegistroFormatted": oEditedInpOut.DataRegistroFormatted.split("-").reverse().join("/"),
					};
				} else {
					return oItem;
				}
			});
			
			aInpOutTableData.setProperty("/TableInOut/Items", aItemsNew);
			_this._oModelViewTableInpOut.refresh(true);

			_this.setLocalStorage("inpOutTable", aItemsNew);
			
			_this.getView().setBusy(false);
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
		 * Set the Sorter for the Table
		 * @public
		 * @param {Object} oTable - Table to be sorted
		 * @param {Object} oEvent - Event from the Button of Dialog
		 */
		handleSortDialogConfirmInpOut: function(oTable, oEvent) {
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
		 * Set the Filter for the Table
		 * @public
		 * @param {String} sValue - Value to be filtered
		 * @param {Object} oTable - Table to be filtered
		 */
		setFilterBinding: function(sValue, oTable) {
			var aFilters = [];

			if (sValue) {
				aFilters.push(new Filter("NomeComp", FilterOperator.Contains, sValue));
			}
			var oBinding = oTable.getBinding();
			oBinding.filter(aFilters);
		},
	};
});
