Ext.define('CArABU.app.DefectsByFieldSettings',{
    singleton: true,

    getFields: function(settings, states){
        var labelWidth = 150,
            width = 400;

        var allowedStates = settings && settings.allowedStates;
        if (allowedStates && Ext.isString(allowedStates)){
            allowedStates = allowedStates.split(',');
        }

        var stateOptions = _.map(states, function(s){
            var checked = Ext.Array.contains(allowedStates, s);
            return { boxLabel: s, name: 'allowedStates', inputValue: s, checked: checked };
        });


        return [
        // {
        //     xtype:'colorpicker',
        //     itemId: 'chartColor'
        // },        
        {
            xtype: 'tsfieldoptionscombobox',
            name: 'bucketField',
            fieldLabel: 'Bucket by',
            labelWidth: labelWidth,
            labelAlign: 'right',
            width: width,
            model: settings.modelName,
            allowNoEntry: false
        }
        ,{
            xtype: 'rallynumberfield',
            fieldLabel: 'Show top ',
            labelWidth: labelWidth,
            labelAlign: 'right',
            name: 'showTopTen',
            emptyText: 'Leave Blank to show all'
        }
        ];
    }
});
