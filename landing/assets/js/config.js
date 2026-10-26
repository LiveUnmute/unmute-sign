// Where the two forms send their answers.
//
// Leave relayUrl empty and the site falls back to composing an email — useful
// for a preview, but nothing reaches Drive. Fill it in once the Apps Script web
// app is deployed (see google-apps-script/README.md) and both forms start
// writing to the folders in "01 Unmute".
//
// This file is public, and it is meant to be: the URL is a public entry point
// that can only append a row or create a document. It grants no access to the
// Drive it writes into.

window.UNMUTE_CONFIG = {
  relayUrl: '',
  inbox: 'contact@liveunmute.com',
};
