sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/History"
], function (Controller, UIComponent, History) {
	"use strict";

	return Controller.extend("br.com.switch.salestem.controller.BaseController", {

		getOwnerComponent: function () {
			return Controller.prototype.getOwnerComponent.call(this);
		},

		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		getResourceBundle: function () {
			var oModel = this.getOwnerComponent().getModel("i18n");
			return oModel.getResourceBundle();
		},

		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		getLanguage: function () {
			return sap.ui.getCore().getConfiguration().getLanguage();
		},

		getSystemLanguage: function () {
			let userLocale =
				navigator.languages && navigator.languages.length
					? navigator.languages[0]
					: navigator.language;

			return userLocale;
		},

		getSystemTheme: function () {
			let bDarkTheme = window.matchMedia("(prefers-color-scheme: dark)");
			sap.ui.getCore().applyTheme(bDarkTheme.matches ? "sap_horizon_dark" : "sap_horizon");
		},
		
		setModel: function (oModel, sName) {
			this.getView().setModel(oModel, sName);
			return this;
		},

		navTo: function (sName, oParameters, bReplace) {
			this.getRouter().navTo(sName, oParameters, undefined, bReplace);
		},

		onNavBack: function (sRoute) {
			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo(sRoute, {}, undefined, true);
			}
		},

		onSideNavButtonPress: function () {
			let oToolPage = this.byId("toolPageId");
			let bSideExpanded = oToolPage.getSideExpanded();

			this._setToggleButtonTooltip(bSideExpanded);

			oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
		},

		setFocus: function(sId) {
			let oInput = this.getView().byId(sId);

			setTimeout(function() {
				oInput.focus();
			}, 0);
		},

		_setToggleButtonTooltip: function (bLarge) {
			let oToggleButton = this.byId('sideNavigationToggleButton');
			let oResourceBundle = this.getResourceBundle();
			if (bLarge) {
				oToggleButton.setTooltip(oResourceBundle.getText('sideNavigationToggleButtonTooltipCollapsed'));
			} else {
				oToggleButton.setTooltip(oResourceBundle.getText('sideNavigationToggleButtonTooltipExpanded'));
			}
		},

		checkEmail: function(sEmail, oInputEmail) {
			const rRegexEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g;
			let oResourceBundle = this.getResourceBundle();

			if (sEmail === "") {
				oInputEmail.setValueState(sap.ui.core.ValueState.Error);
				oInputEmail.setValueStateText(oResourceBundle.getText("form.emailRequired"));
				return false;
			}

			if (!rRegexEmail.test(sEmail)) {
				oInputEmail.setValueState(sap.ui.core.ValueState.Error);
				oInputEmail.setValueStateText(oResourceBundle.getText("form.emailInvalid"));
				return false;
			}
			oInputEmail.setValueState(sap.ui.core.ValueState.None);
			oInputEmail.setValueStateText("");
			return true;
		},

		checkUsername: function(sUsername, oInputUsername) {
			const rRegexUsername = /^.{3,}$/g;
			let oResourceBundle = this.getResourceBundle();

			if (sUsername === "") {
				oInputUsername.setValueState(sap.ui.core.ValueState.Error);
				oInputUsername.setValueStateText(oResourceBundle.getText("form.usernameRequired"));
				return false;
			}

			if (!rRegexUsername.test(sUsername)) {
				oInputUsername.setValueState(sap.ui.core.ValueState.Error);
				oInputUsername.setValueStateText(oResourceBundle.getText("form.usernameInvalid"));
				return false;
			}
			oInputUsername.setValueState(sap.ui.core.ValueState.None);
			oInputUsername.setValueStateText("");
			return true
		},

		checkPassword: function(sPassword, oInputPass) {
			const rRegexPassword = /^.{8,}$/g;
			let oResourceBundle = this.getResourceBundle();

			if (sPassword === "") {
				oInputPass.setValueState(sap.ui.core.ValueState.Error);
				oInputPass.setValueStateText(oResourceBundle.getText("form.passwordRequired"));
				return false;
			}

			if (!rRegexPassword.test(sPassword)) {
				oInputPass.setValueState(sap.ui.core.ValueState.Error);
				oInputPass.setValueStateText(oResourceBundle.getText("form.passwordInvalid"));
				return false;
			}
			oInputPass.setValueState(sap.ui.core.ValueState.None);
			oInputPass.setValueStateText("");
			return true
		},

		checkPasswordConfirm: function(sPasswordConfirm, sPassword, oInputConfPass) {
			let oResourceBundle = this.getResourceBundle();

			if (sPasswordConfirm === "") {
				oInputConfPass.setValueState(sap.ui.core.ValueState.Error);
				oInputConfPass.setValueStateText(oResourceBundle.getText("form.confirmPasswordRequired"));
				return false;
			}

			if (sPasswordConfirm !== sPassword) {
				oInputConfPass.setValueState(sap.ui.core.ValueState.Error);
				oInputConfPass.setValueStateText(oResourceBundle.getText("form.confirmPasswordError"));
				return false;
			}
			oInputConfPass.setValueState(sap.ui.core.ValueState.None);
			oInputConfPass.setValueStateText("");
			return true
		},

		setCookie: function(sName, sValue, iExdays) {
			let oDate = new Date();
			oDate.setTime(oDate.getTime() + (iExdays*24*60*60*1000));
			let sExpires = `expires=${oDate.toUTCString()}`;
			document.cookie = `${sName}=${sValue};${sExpires};path=/`;
		},

		resetFieldsState: function(sFormId) {
			let oVBox = this.byId(sFormId);

			oVBox.getItems().forEach(oItem => {
				if (oItem.getMetadata().getName() === "sap.m.Input") {
					this.resetStateField(oItem);
				}
			});
		},

		resetStateField: function (oInput) {
			if (oInput.setValueState) {
				oInput.setValueState("None");
			}
			if (oInput.setValueStateText) {
				oInput.setValueStateText("");
			}
		},

		onLiveChangeEmail: function(oEvent) {
			let oInputEmail = oEvent.getSource();
			let sEmail = oInputEmail.getValue();

            this.checkEmail(sEmail, oInputEmail);
        },

		onLiveChangePass: function(oEvent) {
			let oInputPass = oEvent.getSource();
			let sPassword = oInputPass.getValue();

			this.checkPassword(sPassword, oInputPass);
		},

		onLiveChangeUsername: function(oEvent) {
			let oInputUsername = oEvent.getSource();
			let sUsername = oInputUsername.getValue();

			this.checkUsername(sUsername, oInputUsername);
		},

		onLogout: function() {
			localStorage.removeItem("infoLogin");
			localStorage.removeItem("infoRegister");
			this.navTo("login", {}, true);
		},

		applyTheme: function(sTheme) {
			sap.ui.getCore().applyTheme(sTheme);
		},

		applyLanguage: function(sLanguage) {
			sap.ui.getCore().getConfiguration().setLanguage(sLanguage);
		},

		optimizeColumns: function (oEvent) {
			var that = this;

			//Otimiza colunas
			if (oEvent.mySmTable) {
				var oTable = oEvent.mySmTable.getTable();
				if (oTable) {
					oEvent.mySmTable.setBusy(true);
					setTimeout(function () {
						that.optCols(oTable);
						oEvent.mySmTable.setBusy(false);
					}, 1000);
				}
			}
		},

		optCols: function (oTable) {
			var aColmuns = oTable.getColumns();
			for (var i = aColmuns.length; i >= 0; i--) {
				oTable.autoResizeColumn(i);
			}
		},

		/**
		 * Convert to Upper Case the Object Values
		 * @public
		 * @param {Object} oObject - Object to be converted
		 * @returns {Object} - Object with the values in Upper Case
		 */
		toUpperCaseObjectValues: function(oObject) {
			const oObjectAux = oObject;
			const oObjectFinal = {};

			for (const sKey in oObject) {
				if (oObjectAux.hasOwnProperty(sKey) && typeof oObjectAux[sKey] === "string") {
					oObjectFinal[sKey] = oObjectAux[sKey].toUpperCase();
				}
			}
			return oObjectFinal;
		},
	});
});
