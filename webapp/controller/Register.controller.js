sap.ui.define([
	"br/com/switch/farmtenz/controller/BaseController",
    "sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function(BaseController, JSONModel, MessageBox) {
	"use strict";

	return BaseController.extend("br.com.switch.farmtenz.controller.Register", {

		onInit: function() {
			this._oView = this.getView();

			this._oRouter = this.getRouter();

			this._oModelView = new JSONModel(this._setOModelView());
			this._oView.setModel(this._oModelView, "loginModel");

			this.setFocus("input_email_register");
		},

		onAfterRendering: function() {
			this.resetFieldsState("register_form");
			this.setFocus("input_email_register");
		},

		_setOModelView: function() {
			return {
				RegisterForm: {
					Email: "",
					Username: "",
					Password: "",
					PasswordConfirm: "",
				},
			};
		},

		_checkRegisterForm: function() {
			let oInputEmail = this._oView.byId("input_email_register");
			let oInputUsername = this._oView.byId("input_username_register");
			let oInputPassword = this._oView.byId("input_pass_register");
			let oInputPassConfirm = this._oView.byId("input_confirm_pass_register");

			let bResultEmail = this.checkEmail(oInputEmail.getValue(), oInputEmail);
			let bResultUsername = this.checkUsername(oInputUsername.getValue(), oInputUsername);
			let bResultPassword = this.checkPassword(oInputPassword.getValue(),	oInputPassword);
			let bResultPasswordConfirm = this.checkPasswordConfirm(oInputPassConfirm.getValue(), oInputPassword.getValue(), oInputPassConfirm);

			this._oView.setBusy(true);

			if (bResultEmail && bResultUsername && bResultPassword && bResultPasswordConfirm) {
				this._oView.setBusy(false);
				return true;
			} else {
				this._oView.setBusy(false);

				var bErrorEmail = oInputEmail.getValueState() === "Error" ? true : false;
				var bErrorUsername = oInputUsername.getValueState() === "Error" ? true : false;
				var bErrorPassword = oInputPassword.getValueState() === "Error" ? true : false;
				var bErrorPassConfirm = oInputPassConfirm.getValueState() === "Error" ? true : false;

				if (bErrorEmail || bErrorUsername || bErrorPassword || bErrorPassConfirm) {
					this._oView.setBusy(false);
					MessageBox.error(this.getResourceBundle().getText("login_form_fields_error"));
				}
			}
			return false;
		},

		onRegister: function() {
			if (this._checkRegisterForm()) {
				this.register(this).then(() => {
					this._oView.setBusy(false);

					let sTokenEmail = btoa(this._oModelView.getProperty("/RegisterForm/Email"));
					let sTokenPassword = btoa(this._oModelView.getProperty("/RegisterForm/Password"));

					this.navTo("home", {
						token: sTokenEmail +":"+ sTokenPassword,
					}, true);
				});
			}
		},

		register: function(_this) {
            return new Promise(function(resolve, reject) {
                let sPassword = _this._oModelView.getProperty("/RegisterForm/Password");
                let sEmail = _this._oModelView.getProperty("/RegisterForm/Email");

                let sTokenEmail = btoa(sEmail);
				let sTokenPassword = btoa(sPassword);
				var sCookieValue = btoa(sTokenEmail+":"+sTokenPassword);

				var sCookieName = btoa("rememberMe");
				var iDays = 7;
				_this.setCookie(sCookieName, sCookieValue, iDays);

                localStorage.setItem("infoLogin", sTokenEmail+":"+sTokenPassword);
                resolve();
            });
		},

		onSubmitRegister: function() {
			this.onRegister();
		},

		onRouteLogin: function() {
			this.navTo("login");
		},
	});
});
