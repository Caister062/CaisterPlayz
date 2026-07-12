const oauthHandler = (c) => {
    const state = c.request.formValue("state") || "";
    const code = c.request.formValue("code") || "";
    const error = c.request.formValue("error") || "";
    const errorDesc = c.request.formValue("error_description") || "";
    
    const frontendUrl = "https://caister062.github.io/CaisterPlayz/";
    return c.redirect(302, frontendUrl + "?state=" + encodeURIComponent(state) + "&code=" + encodeURIComponent(code) + "&error=" + encodeURIComponent(error) + "&error_description=" + encodeURIComponent(errorDesc));
};

routerAdd("GET", "/api/oauth-redirect", oauthHandler);
routerAdd("POST", "/api/oauth-redirect", oauthHandler);
