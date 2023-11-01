sap.ui.define([
	"br/com/switch/salestem/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("br.com.switch.salestem.controller.Login", {

        onInit: function() {
            this._oView = this.getView();
            this._oRouter = this.getRouter();

            this._oModelView = new JSONModel(this._setOModelView());
            this._oView.setModel(this._oModelView, "loginModel");

            
            this.setFocus("input_email");
        },

        onAfterRendering: function() {
			this.resetFieldsState("login_form");
            this.setFocus("input_email");
        },

        _setOModelView: function() {
            return {
                LoginForm: {
                    Email: "",
                    Password: "",
                    RememberMe: false,
                },
            };
        },

        _checkLoginForm: function() {
            let sEmail = this._oModelView.getProperty("/LoginForm/Email");
            let sPassword = this._oModelView.getProperty("/LoginForm/Password");

            let bResultEmail = this.checkEmail(sEmail, this._oView.byId("input_email"));
            let bResultPassword = this.checkPassword(sPassword, this._oView.byId("input_pass"));

            if (bResultEmail && bResultPassword) {
                return true;
            }
            return false;
        },

        onLogin: function() {
            if (this._checkLoginForm()) {
                let sPassword = this._oModelView.getProperty("/LoginForm/Password");
                let sEmail = this._oModelView.getProperty("/LoginForm/Email");
                let bRememberMe = this._oModelView.getProperty("/LoginForm/RememberMe");

                let sTokenEmail = btoa(sEmail);
				let sTokenPassword = btoa(sPassword);

                // encrypt the password and save it in a cookie that expires in 7 days
                if (bRememberMe) {
                    var sCookieName = btoa("rememberMe");
                    var sCookieValue = btoa(sTokenEmail+":"+sTokenPassword);
                    var iDays = 7;
                    this.setCookie(sCookieName, sCookieValue, iDays);
                }

                let sTokenGen = this.generateToken();

                localStorage.setItem("infoLogin", sTokenEmail+":"+sTokenPassword);

                this.navTo("home", {
                    token: sCookieValue+":"+sTokenGen,
                }, true);
            }
        },
		
        onSubmitLogin: function() {
            this.onLogin();
        },

        onRouteRegister: function() {
            this.resetFieldsState("login_form");
            this.navTo("register", {}, {});
        },

        onRouteForgot: function() {
            this.navTo("forgot", {}, {});
        },
    });
});