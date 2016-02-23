Ext.define('Rally.technicalservices.DefectsByFieldSettings',{
    singleton: true,

    getFields: function(settings, states){
        var labelWidth = 150,
            width = 300;
        

        var stateOptions = _.map(states, function(s){
            console.log('state', s,Ext.Array.contains(settings.allowedStates, s));
            var checked = Ext.Array.contains(settings.allowedStates, s);
            return { boxLabel: s, name: 'allowedStates', inputValue: s, checked: checked };
        });


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
            xtype: 'checkboxgroup',
            fieldLabel: 'Include States',
            labelWidth: labelWidth,
            width: width,
            labelAlign: 'right',
            columns: 1,
            vertical: true,
            items: stateOptions
        }, {
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
        },{
            xtype: 'rallycheckboxfield',
            fieldLabel: 'Include empty categories',
            labelWidth: labelWidth,
            width: width,
            labelAlign: 'right',
            name: 'showNoDataCategories'
        },{
            xtype: 'textarea',
            fieldLabel: 'Query',
            name: 'query',
            anchor: '100%',
            cls: 'query-field',
            labelAlign: 'right',
            labelWidth: labelWidth,
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
