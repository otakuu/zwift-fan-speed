const settings = require('./settings');
var ZwiftAccount = require("zwift-mobile-api");
var account = new ZwiftAccount(settings.username, settings.password);

// Get profile for "me"
account.getProfile().profile().then(p => {
    console.log(p);  // JSON of rider profile (includes id property you can use below)
});

