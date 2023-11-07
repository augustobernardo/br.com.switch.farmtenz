sap.ui.define([
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/ui/Device"
],function(Sorter, Filter, FilterOperator, Fragment, Device) {
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
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters);
		},

		/**
		 * Set the Sorter for the Table
		 * @param {Object} oTable - Table to be sorted
		 * @param {Object} oEvent - Event from the Button of Dialog
		 */
		handleSortDialogConfirm: function(oTable, oEvent) {
			var mParams = oEvent.getParameters();
			var oBinding = oTable.getBinding("items");
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
	};
});
