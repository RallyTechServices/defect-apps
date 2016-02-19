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
        }];
    }
});
