/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["northwinddemodest/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
