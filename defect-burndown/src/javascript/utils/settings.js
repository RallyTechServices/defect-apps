Ext.define('Rally.technicalservices.DefectsByFieldSettings',{
    singleton: true,

    getFields: function(settings, states){

        console.log('settings',settings);

        var labelWidth = 200,
            stateOptions = _.map(states, function(s){
            console.log('state', s,Ext.Array.contains(settings.includeStates, s));
            var checked = Ext.Array.contains(settings.includeStates, s);
            return { boxLabel: s, name: 'includeStates', inputValue: s, checked: checked };
        });

        var granularityStore = Ext.create('Ext.data.Store',{
            fields: ['name','value'],
            data: [
                    {name: "Day", value: 'day'},
                    {name: "Week", value: 'week'},
                    {name: "Month", value: 'month'}
            ]
        });


        return [{
            xtype: 'combobox',
            fieldLabel: 'Granularity',
            labelAlign: 'right',
            labelWidth: labelWidth,
            name: 'granularity',
            store: granularityStore,
            displayField: 'name',
            valueField: 'value',
        },{
            xtype: 'checkboxgroup',
            fieldLabel: 'Include States',
            labelAlign: 'right',
            labelWidth: labelWidth,
            columns: 2,
            width: 700,
            margin: '0 0 25 0',
            vertical: true,
            items: stateOptions
        }, {
            xtype: 'rallycheckboxfield',
            name: 'excludeUserStoryDefects',
            fieldLabel: 'Exclude User Story Defects',
            labelAlign: 'right',
            margin: '0 0 10 0',
            labelWidth: labelWidth
        }, {
            xtype: 'radiogroup',
            fieldLabel: 'Date Range',
            labelAlign: 'right',
            labelWidth: labelWidth,
            columns: 1,
            margin: '0 0 0 0',
            vertical: true,
            listeners: {
                change: function(rg){
                    _.each(rg.items.items, function(i){
                        if (i && i.updateDateType){
                            i.updateDateType(rg.getValue().dateType);
                        }
                    });
                }
            },
            items: [
                {
                    name: "dateType",
                    itemId: "release",
                    boxLabel: "Selected Release",
                    baseLabel: "Selected Release",
                    inputValue: "release",
                    checked: settings.dateType === "release"
                }, {
                    name: "dateType",
                    itemId: "custom",
                    boxLabel: "Custom",
                    baseLabel: "Custom",
                    inputValue: "custom",
                    checked: settings.dateType === "custom"
                },{
                        xtype: 'rallydatefield',
                        name: 'customStartDate',
                        labelAlign: 'right',
                        labelWidth: labelWidth - 100,
                        fieldLabel: 'Start Date',
                        disabled: settings.dateType !== "custom",
                        value: settings.customStartDate,
                        updateDateType: function(dateType){
                            this.setDisabled(dateType !== "custom");
                        }
                    }, {
                        xtype: 'rallydatefield',
                        name: 'customEndDate',
                        labelAlign: 'right',
                        labelWidth: labelWidth - 100,
                        fieldLabel: 'End Date',
                        disabled: settings.dateType !== "custom",
                        value: settings.customEndDate,
                        margin: '0 0 15 0',
                        updateDateType: function(dateType){
                            this.setDisabled(dateType !== "custom");
                        }

                }, {
                    name: "dateType",
                    itemId: "offset",
                    boxLabel: "Days from Today (e.g. Start Date = -30 displays data starting on " + Rally.util.DateTime.formatWithDefault(Rally.util.DateTime.add(new Date(), 'day', -30)) + ")",
                    baseLabel: "Days from Today (e.g. Start Date = -30 displays data starting on " + Rally.util.DateTime.formatWithDefault(Rally.util.DateTime.add(new Date(), 'day', -30)) + ")",
                    inputValue: "offset",
                    checked: settings.dateType === "offset"
                }, {
                        xtype: 'rallynumberfield',
                        name: 'offsetStartDate',
                        labelAlign: 'right',
                        labelWidth: labelWidth - 100,
                        fieldLabel: 'Start Date',
                        disabled: settings.dateType !== "offset",
                        value: settings.offsetStartDate,
                        maxValue: -1,
                        updateDateType: function(dateType){
                            this.setDisabled(dateType !== "offset");
                        }
                    }, {
                        xtype: 'rallynumberfield',
                        name: 'offsetEndDate',
                        labelAlign: 'right',
                        labelWidth: labelWidth - 100,
                        fieldLabel: 'End Date',
                        value: settings.offsetEndDate,
                        maxValue: 0,
                        disabled: settings.dateType !== "offset",
                        updateDateType: function(dateType){
                            this.setDisabled(dateType !== "offset");
                        }
                }]
        }];
        //},{
            //xtype: "fieldcontainer",
            //layout: {type: 'hbox'},
            //items: [{
            //    xtype: "container",
            //    minWidth: 250,
            //    items: [
            //        {
            //            xtype: "label",
            //            text: "Start Date",
            //            cls: "settingsLabel"
            //        },
            //        {
            //            xtype: "radiogroup",
            //            name: "startdate",
            //            itemId: "startdategroup",
            //            columns: 1,
            //            vertical: true,
            //            items: [
            //                {
            //                    name: "startdate",
            //                    itemId: "release",
            //                    boxLabel: "Use Release",
            //                    baseLabel: "Actual Start Date",
            //                    inputValue: "actualstartdate",
            //                    checked: startDate[0] === "actualstartdate"
            //                },
            //                {
            //                    name: "startdate",
            //                    itemId: "plannedstartdate",
            //                    boxLabel: "Planned Start Date",
            //                    baseLabel: "Planned Start Date",
            //                    inputValue: "plannedstartdate",
            //                    checked: startDate[0] === "plannedstartdate"
            //                },
            //                {
            //                    xtype: "container",
            //                    layout: {
            //                        type: "hbox"
            //                    },
            //                    items: [
            //                        {
            //                            xtype: "radiofield",
            //                            name: "startdate",
            //                            itemId: "startdatemanual",
            //                            boxLabel: " ",
            //                            inputValue: "selecteddate",
            //                            checked: startDate[0] === "selecteddate"
            //                        },
            //                        {
            //                            xtype: "rallydatefield",
            //                            name: "startdate",
            //                            itemId: "startdatefield",
            //                            inputValue: "selecteddate",
            //                            value: startDate[1] || ''
            //                        }
            //                    ]
            //                }
            //            ]
            //        },
            //        {
            //            xtype: "container",
            //            minWidth: 250,
            //            items: [
            //                {
            //                    xtype: "label",
            //                    text: "End Date",
            //                    cls: "settingsLabel"
            //                },
            //                {
            //                    xtype: "radiogroup",
            //                    name: "enddate",
            //                    itemId: "enddategroup",
            //                    columns: 1,
            //                    vertical: true,
            //                    items: [
            //                        {
            //                            name: "enddate",
            //                            itemId: 'today',
            //                            boxLabel: "Today",
            //                            inputValue: "today",
            //                            checked: endDate[0] === "today"
            //                        },
            //                        {
            //                            name: "enddate",
            //                            itemId: "actualenddate",
            //                            boxLabel: "Actual End Date",
            //                            baseLabel: "Actual End Date",
            //                            inputValue: "actualenddate",
            //                            checked: endDate[0] === "actualenddate"
            //                        },
            //                        {
            //                            name: "enddate",
            //                            itemId: "plannedenddate",
            //                            boxLabel: "Planned End Date",
            //                            baseLabel: "Planned End Date",
            //                            inputValue: "plannedenddate",
            //                            checked: endDate[0] === "plannedenddate"
            //                        },
            //                        {
            //                            xtype: "container",
            //                            layout: {
            //                                type: "hbox"
            //                            },
            //                            items: [
            //                                {
            //                                    xtype: "radiofield",
            //                                    name: "enddate",
            //                                    itemId: "enddatemanual",
            //                                    boxLabel: " ",
            //                                    inputValue: "selecteddate",
            //                                    checked: endDate[0] === "selecteddate"
            //                                },
            //                                {
            //                                    xtype: "rallydatefield",
            //                                    name: "enddate",
            //                                    itemId: "enddatefield",
            //                                    inputValue: "selecteddate",
            //                                    value: endDate[1] || ""
            //                                }
            //                            ]
            //                        }
            //                    ]
            //                }
            //            ]
            //        }
            //    ]
            //}]
        //},{
        //    xtype: 'textarea',
        //    labelAlign: 'right',
        //    fieldLabel: 'Query',
        //    name: 'query',
        //    labelWidth: labelWidth,
        //    anchor: '100%',
        //    cls: 'query-field',
        //    margin: '0 70 0 0',
        //    plugins: [
        //        {
        //            ptype: 'rallyhelpfield',
        //            helpId: 194
        //        },
        //        'rallyfieldvalidationui'
        //    ],
        //    validateOnBlur: false,
        //    validateOnChange: false,
        //    validator: function(value) {
        //        try {
        //            if (value) {
        //                Rally.data.wsapi.Filter.fromQueryString(value);
        //            }
        //            return true;
        //        } catch (e) {
        //            return e.message;
        //        }
        //    }
        //}];
    }
});
