/**
 * A client that attaches to a document
 * @module Client
 */

var events = require("events");

var dmp = require("./DiffMatchPatch.js");

function Client(doc) {
    if (!doc) return new Error("Document must be provided when creating a client");
    this.doc = doc;

    // List of patches that need to be sent to client
    this.patchQueue = [];
    // Time to wait before sending patch messages to client
    this.patchFrequency = 500;

    // Start patch check interval
    this.patchInterval = setInterval(this.sendPatches, this.patchFrequency);

    // Apply EventEmitter properties to this
    events.EventEmitter.call(this);
}

Client.prototype.__proto__ = events.EventEmitter.prototype;

// This client is disconnecting
Client.prototype.disconnect = function disconnect() {
    this.doc.removeClient(this);
    this.doc = undefined;
    this.patchQueue = [];

    clearInterval(this.patchInterval);
};

// Applies server-side edits to be sent to the client
Client.prototype.patchClient = function patchClient(patches) {
    this.patchQueue.push(patches);
};

// Clear patchQueue
Client.prototype.recallPatches = function recallPatches() {
    this.patchQueue = [];
}

// Sends patches to client
Client.prototype.sendPatches = function sendPatches() {
    // Ignore empty
    if (!this.patchQueue || this.patchQueue.length === 0) return;

    var diffText = dmp.patch_toText(this.patchQueue);

    this.emit("patch", diffText);
    this.patchQueue = [];
};

// Applies the client's edit to the doc
Client.prototype.patchServer = function patchServer(patches) {
    this.doc.patch(patches);
};

// Gets the Document's content
Client.prototype.getContent = function getContent() {
    return (this.doc ? this.doc.getContent() : "");
};

module.exports = Client;
