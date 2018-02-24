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

        var colors = Ext.create('Ext.data.Store', {
            fields: ['Name'],
            data : [{Name:'Black'}, {Name:'Grey'}, {Name:'Yellow'}, {Name:'Red'}, {Name:'Blue'}, {Name:'Green'}, {Name:'Brown'}, {Name:'Pink'}, {Name:'Orange'}, {Name:'Purple'}]
        });


        return [
        // {
        //     xtype:'colorpicker',
        //     itemId: 'chartColor'
        // },
        {
            xtype: 'combobox',
            name: 'chartColor',            
            fieldLabel: 'Choose Color',
            store: colors,
            labelWidth: labelWidth,
            labelAlign: 'right',
            width: width,            
            queryMode: 'local',
            displayField: 'Name',
            valueField: 'Name'            
        },
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
