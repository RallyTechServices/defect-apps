Ext.define('Rally.technicalservices.DefectsByFieldSettings',{
    singleton: true,

    getFields: function(settings){
        var labelWidth = 100,
            width = 250;
        console.log('settings',settings);
        return [{
            xtype: 'tsfieldoptionscombobox',
            name: 'bucketField',
            fieldLabel: 'Bucket by',
            labelWidth: labelWidth,
            labelAlign: 'right',
            width: width,
            model: settings.modelName,
            allowNoEntry: false
        },{
            xtype: 'rallyfieldvaluecombobox',
            name: 'allowedStates',
            fieldLabel: 'Include States',
            labelWidth: labelWidth,
            width: width,
            labelAlign: 'right',
            multiSelect: true,
            model: settings.modelName,
            value: settings.allowedStates,
            field: 'State'
        },{
            xtype: 'tsfieldoptionscombobox',
            name: 'stackField',
            fieldLabel: 'Stacks',
            model: settings.modelName,
            labelWidth: labelWidth,
            width: width,
            labelAlign: 'right',
            allowNoEntry: true,
            noEntryText: '-- No Stacks --',
            noEntryValue: null
        }];
    }
});
