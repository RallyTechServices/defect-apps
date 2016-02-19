Ext.define('Rally.ui.combobox.FieldOptionsCombobox', {
    requires: [],
    extend: 'Rally.ui.combobox.FieldComboBox',
    alias: 'widget.tsfieldoptionscombobox',

    _isNotHidden: function(field) {
        if (field && field.attributeDefinition ){
            return field.attributeDefinition.Constrained && field.attributeDefinition.AttributeType != 'COLLECTION';
        }
        return false;
    },
    _populateStore: function() {
        if (!this.store) {
            return;
        }
        var data = _.sortBy(
            _.map(
                _.filter(this.model.getFields(), this._isNotHidden),
                this._convertFieldToLabelValuePair,
                this
            ),
            'name'
        );

        if (this.allowNoEntry){
            data.unshift({name: this.noEntryText, value: null});
        }
        this.store.loadRawData(data);
        this.setDefaultValue();
        this.onReady();
    }
});