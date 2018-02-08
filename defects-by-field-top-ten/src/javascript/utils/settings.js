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
        //     name: 'saveLog',
        //     xtype: 'rallycheckboxfield',
        //     boxLabelAlign: 'after',
        //     fieldLabel: '',
        //     margin: check_box_margins,
        //     boxLabel: 'Save Logging<br/><span style="color:#999999;"><i>Save last 100 lines of log for debugging.</i></span>'

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
            xtype: 'rallycheckboxfield',
            fieldLabel: 'Show top Ten',
            labelWidth: labelWidth,
            width: width,
            labelAlign: 'right',
            name: 'showTopTen'
        }
        //,
        // {
        //     xtype: 'tsfieldoptionscombobox',
        //     name: 'stackField',
        //     fieldLabel: 'Stacks',
        //     model: settings.modelName,
        //     labelWidth: labelWidth,
        //     width: width,
        //     labelAlign: 'right',
        //     allowNoEntry: true,
        //     noEntryText: '-- No Stacks --',
        //     noEntryValue: null
        // }
        // ,
        // {
        //     xtype: 'checkboxgroup',
        //     fieldLabel: 'Include States',
        //     labelWidth: labelWidth,
        //     width: width,
        //     labelAlign: 'right',
        //     columns: 2,
        //     vertical: true,
        //     margin: '15 0 15 0',
        //     items: stateOptions

        // }
        // ,{
        //     xtype: 'rallycheckboxfield',
        //     fieldLabel: 'Include empty categories',
        //     labelWidth: labelWidth,
        //     width: width,
        //     labelAlign: 'right',
        //     name: 'showNoDataCategories'
        // }
        // ,{
        //     xtype: 'textarea',
        //     fieldLabel: 'Query',
        //     name: 'query',
        //     anchor: '100%',
        //     cls: 'query-field',
        //     labelAlign: 'right',
        //     labelWidth: labelWidth,
        //     margin: '0 70 0 0',
        //     plugins: [
        //         {
        //             ptype: 'rallyhelpfield',
        //             helpId: 194
        //         },
        //         'rallyfieldvalidationui'
        //     ],
        //     validateOnBlur: false,
        //     validateOnChange: false,
        //     validator: function(value) {
        //         try {
        //             if (value) {
        //                 Rally.data.wsapi.Filter.fromQueryString(value);
        //             }
        //             return true;
        //         } catch (e) {
        //             return e.message;
        //         }
        //     }
        // }
        ];
    }
});
