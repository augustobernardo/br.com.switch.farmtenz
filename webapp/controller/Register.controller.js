sap.ui.define([
	"br/com/switch/salestem/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("br.com.switch.salestem.controller.Register", {

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

			if (bResultEmail && bResultUsername && bResultPassword && bResultPasswordConfirm) {
				return true;
			}
			return false;
		},

		onRegister: function() {
			if (this._checkRegisterForm()) {
				let sUsername = this._oModelView.getProperty("/RegisterForm/Username");
				let sPassword = this._oModelView.getProperty("/RegisterForm/Password");
				let sEmail = this._oModelView.getProperty("/RegisterForm/Email");
				let sConfirmPassword = this._oModelView.getProperty("/RegisterForm/PasswordConfirm");

				this._oView.setBusy(true);

				let sTokenEmail = btoa(sEmail);
				let sTokenPassword = btoa(sPassword);

				let sCookieName = btoa("rememberMe");
				let sCookieValue = btoa(sEmail+":"+sPassword);
				let iDays = 7;
				this.setCookie(sCookieName, sCookieValue, iDays);

				localStorage.setItem("infoRegister", sTokenEmail+":"+sTokenPassword);

                this.navTo("home", {
                    token: sCookieValue+":"+sTokenGen,
                }, true);

				this._oView.setBusy(false);
			}
		},

		onSubmitRegister: function() {
			this.onRegister();
		},

		onRouteLogin: function() {
			this.navTo("login");
		},
	});
});
