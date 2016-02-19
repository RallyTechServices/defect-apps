Ext.define('Rally.technicalservices.DefectsByFieldSettings',{
    singleton: true,

    getFields: function(settings){

        console.log('settings',settings);
        return [{
            xtype: 'rallyfieldcombobox',
            name: 'bucketField',
            fieldLabel: 'Bucket by',
            model: settings.modelName
        },{
            xtype: 'rallyfieldvaluecombobox',
            name: 'allowedStates',
            fieldLabel: 'Include States',
            multiSelect: true,
            model: settings.modelName,
            field: 'State'
        },{
            xtype: 'rallyfieldcombobox',
            name: 'stackField',
            fieldLabel: 'Stacks',
            model: settings.modelName,
            allowNoEntry: true,
            noEntryText: '-- No Stacks --'
        }];
    }
});
