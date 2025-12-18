sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/ColumnListItem",
    "sap/m/Input",
    "sap/base/util/deepExtend",
    "sap/m/MessageBox",
	"sap/ui/core/Fragment"
], (Controller, JSONModel, MessageToast, ColumnListItem, Input, deepExtend, MessageBox, Fragment) => {
    "use strict";

    return Controller.extend("northwinddemodest.controller.Overview", {
        onInit: function () {
            var oModel_Input = new JSONModel({
                Name: "",
                Description: "",
                ReleaseDate: "",
                DiscontinuedDate: "",
                Rating: "",
                Price: ""
            });
            this.getView().setModel(oModel_Input, "input");

            this.oTable = this.byId("productTable");
            this.oReadOnlyTemplate = this.byId("productTable").removeItem(0);
            this.rebindTable(this.oReadOnlyTemplate, "Navigation");
            this.oEditableTemplate = new ColumnListItem({
                cells: [new Input({ value: "{Name}" }),
                new Input({ value: "{Description}" }),
                new Input({ value: "{ReleaseDate}" }),
                new Input({ value: "{DiscontinuedDate}" }),
                new Input({ value: "{Rating}" }),
                new Input({ value: "{Price}" })
                ]
            });
        },

        rebindTable: function (oTemplate, sKeyboardMode) {
            this.oTable.bindItems({
                path: "/Products",
                template: oTemplate,
                templateShareable: true,
                key: "ID"
            });
        },

        onCreate: function () {
            var oModelData = this.getView().getModel("input").getData();
            var oModel = this.getOwnerComponent().getModel();
            oModel.setUseBatch(false);

            oModel.read("/Products", {
                urlParameters: { "$orderby": "ID desc", "$top": 1 },
                success: function (oData) {
                    var iNextId = 1;

                    if (oData.results.length > 0) { iNextId = oData.results[0].ID + 1; }

                    oModel.create("/Products", { ID: iNextId, Name: oModelData.Name, Description: oModelData.Description, ReleaseDate: new Date(), Rating: oModelData.Rating, Price: oModelData.Price }, {
                        success: function (oData) { sap.m.MessageToast.show("Created ID " + oData.ID); },
                        error: function (oError) { console.error(oError.responseText); }
                    });
                    this._createProduct(iNextId);

                },
                error: function (oError) { console.error(oError); }
            });
        },

        editProducts: function () {
            this.aProductCollection = deepExtend([], this.getView().getModel().getProperty("/Products"));
            this.byId("editProducts").setVisible(false);
            this.byId("saveButton").setVisible(true);
            this.byId("cancelButton").setVisible(true);
            this.rebindTable(this.oEditableTemplate, "Edit Products");
        },

        onCancel: function () {
            this.byId("cancelButton").setVisible(false);
            this.byId("saveButton").setVisible(false);
            this.byId("editProducts").setVisible(true);
            this.getView().getModel().setProperty("/Products", this.aProductCollection);
            this.rebindTable(this.oReadOnlyTemplate, "Navigation");
        },

        onSaveTable: function (oEvent) {

            var oTable = this.byId("productTable");
            var aItems = oTable.getItems();
            var oModel = this.getOwnerComponent().getModel();
            oModel.setUseBatch(false);
            var oId = 0;

            aItems.forEach(function (oItem) {
                var aCells = oItem.getCells();
                var sName = aCells[0].getValue();
                var sDesc = aCells[1].getValue();
                var sRelDate = aCells[2].getValue();
                var sDisconDate = aCells[3].getValue();
                var sRating = aCells[4].getValue();
                var sPrice = aCells[5].getValue();

                oModel.update("/Products(" + oId + ")", {
                    Rating: sRating,
                    Name: sName
                });

                oId = oId + 1;

            });

            oModel.refresh(true);

            this.byId("saveButton").setVisible(false);
            this.byId("cancelButton").setVisible(false);
            this.byId("editProducts").setVisible(true);
            this.rebindTable(this.oReadOnlyTemplate, "Navigation");
        },

        deleteProducts: function () {
            var oTable = this.byId("productTable");
            var aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                sap.m.MessageToast.show("Please select at least one product");
                return;
            }

            var oModel = this.getOwnerComponent().getModel();
            oModel.setUseBatch(false);

            sap.m.MessageBox.confirm(
                "Delete " + aSelectedItems.length + " selected product(s)?",
                {
                    onClose: function (sAction) {
                        if (sAction === sap.m.MessageBox.Action.OK) {
                            aSelectedItems.forEach(function (oItem) {
                                var sPath = oItem.getBindingContext().getPath();
                                oModel.remove(sPath);
                            });

                            sap.m.MessageToast.show("Selected products deleted");
                        }
                    }
                }
            );
        },

        onSelectionChange: function (oEvent) {
            var oTable = oEvent.getSource();
            var oDeleteBtn = this.byId("deleteProducts");

            oDeleteBtn.setEnabled(oTable.getSelectedItems().length > 0);
        },

        onPress: function () {
            var oView = this.getView(),
                oButton = oView.byId("button");

            if (!this._oMenuFragment) {
                this._oMenuFragment = Fragment.load({
                    id: oView.getId(),
                    name: "northwinddemodest.view.Menu",
                    controller: this
                }).then(function (oMenu) {
                    oMenu.openBy(oButton);
                    this._oMenuFragment = oMenu;
                    return this._oMenuFragment;
                }.bind(this));
            } else if (this._oMenuFragment.isOpen()) {
                this._oMenuFragment.close();
            } else {
                this._oMenuFragment.openBy(oButton);
            }
        },

        onNew: function() {
            sap.m.MessageToast.show("Menu item pressed");
        }
    });
});