Ext.define('Rally.technicalservices.DefectsByFieldSettings',{
    singleton: true,

    getFields: function(settings){

        console.log('settings',settings);
        return [{
            xtype: 'rallyfieldvaluecombobox',
            name: 'includeStates',
            fieldLabel: 'Include States',
            multiSelect: true,
            model: settings.modelName,
            field: 'State'
        },{
            xtype: 'rallyfieldvaluecombobox',
            name: 'includeSeverity',
            fieldLabel: 'Include Severity',
            multiSelect: true,
            model: settings.modelName,
            field: 'Severity'
        },{
            xtype: 'textarea',
            fieldLabel: 'Query',
            name: 'query',
            anchor: '100%',
            cls: 'query-field',
            margin: '0 70 0 0',
            plugins: [
                {
                    ptype: 'rallyhelpfield',
                    helpId: 194
                },
                'rallyfieldvalidationui'
            ],
            validateOnBlur: false,
            validateOnChange: false,
            validator: function(value) {
                try {
                    if (value) {
                        Rally.data.wsapi.Filter.fromQueryString(value);
                    }
                    return true;
                } catch (e) {
                    return e.message;
                }
            }
        }];
    }
});
