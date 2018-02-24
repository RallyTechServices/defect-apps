Ext.define("CArABU.app.TSApp.defect-trend-by-release", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new CArABU.technicalservices.Logger(),
    defaults: { margin: 10 },

    items: [
        {xtype:'container',itemId:'selector_box',layout:{type:'hbox'}, margin: '10 10 50 10' },
        {xtype:'container',itemId:'chart_box', margin: '50 10 10 10' }
    ],

    integrationHeaders : {
        name : "CArABU.app.TSApp"
    },
    config: {
        defaultSettings: {
            showPatterns: false,
            closedStateValues: ['Closed']
        }
    },
    launch: function() {
        var me = this;
        this._fetchAllowedValues('Defect', 'State').then({
            success: function(values){
                this.states = values;
                this._addSelector();
            },
            failure: function(msg){
                Rally.ui.notify.Notifier.showError({ message: msg });
            },
            scope: this
        });
    },
    _addSelector: function(){
        var me = this;
       
        me.down('#selector_box').add([
            {
                xtype: 'rallyreleasecombobox',
                name: 'releaseCombo',
                itemId: 'releaseCombo',
                stateful: true,
                stateId: 'releaseCombo-defect-trend',   
                fieldLabel: 'Select Release:',
                multiSelect: true,
                margin: '10 10 10 10', 
                width: 450,
                labelWidth: 100,
                cls: 'rally-checkbox-combobox',
                valueField:'Name',
                showArrows: false,
                displayField: 'Name'
                ,
                listConfig: {
                    cls: 'rally-checkbox-boundlist',
                    itemTpl: Ext.create('Ext.XTemplate',
                        '<div class="rally-checkbox-image"></div>',
                        '{[this.getDisplay(values)]}</div>',
                        {
                            getDisplay: function(values){
                                return values.Name;
                            }
                        }
                    )
                }
            },
            {
                xtype:'rallybutton',
                name: 'updateButton',
                itemId: 'updateButton',
                margin: '10 10 10 10',
                text: 'Update'
                ,
                listeners: {
                    click: me._makeChart,
                    scope: me
                }
            }
        ]);
    },


    _makeChart: function() {
        var me = this;
        

        var cb = me.down('#releaseCombo');
        //console.log(cb);
        if(cb.valueModels.length == 0){
            Rally.ui.notify.Notifier.showError({ message: "Please select one or more releases" });
            return;
        }

        var dates = [];
        var today = new Date();
        Ext.Array.each(cb.valueModels, function(value){
            dates.push(value.get('ReleaseStartDate'));
            dates.push(value.get('ReleaseDate'));
        })
        dates.sort(function(a,b){return a.getTime() - b.getTime()});
        //console.log(dates);
        if(dates.length > 1){
            var startDate = dates[0];
            var endDate = dates[dates.length -1] > today ? today : dates[dates.length -1];                            
        }
        var ti = Math.round(Rally.util.DateTime.getDifference(endDate, startDate, 'day') / 10);
        console.log('ti:',ti)

        // me.setLoading(true);
        this.setChart({
            xtype: 'rallychart',
            chartColors: ['red','green','blue','black'],
            listeners: {
                snapshotsAggregated: this.updateChartData,
                scope: this
            },
            storeType: 'Rally.data.lookback.SnapshotStore',
            storeConfig: {
                find: this.getFilterFindConfig(),
                fetch: ['State',"CreationDate"],
                hydrate: ['State'],
                limit: Infinity,
                removeUnauthorizedSnapshots: true
            },
            calculatorType: 'CArABU.calculator.DefectTrendCalculator',
            calculatorConfig: {
                activeDefectStates: this.getActiveDefectStates(),
                closedDefectStates: this.getClosedDefectStates(),
                startDate: startDate,
                endDate: endDate
            },
            chartConfig: {
                chart: {
                    type: 'xy'
                },
                title: {
                    text: 'Defect Trend',
                    style: {
                        color: '#666',
                        fontSize: '18px',
                        fontFamily: 'ProximaNova',
                        fill: '#666'
                    }
                },
                subtitle: {
                    text: Ext.util.Format.date(endDate) + ' - ' + Ext.util.Format.date(startDate),
                    style: {
                        color: '#666',
                        fontSize: '12px',
                        fontFamily: 'ProximaNova',
                        fill: '#666'
                    }
                },                
                xAxis: {
                    tickmarkPlacement: 'on',
                    tickInterval: ti,
                    title: {
                        text: 'Days',
                        style: {
                            color: '#444',
                            fontFamily: 'ProximaNova',
                            textTransform: 'uppercase',
                            fill: '#444'
                        }
                    },
                    dateTimeLabelFormats: {
                        day: '%e of %b'
                    }
                },
                yAxis: [
                    {
                        min: 0,
                        title: {
                            text: 'Defects Count',
                            style: {
                                color: '#444',
                                fontFamily: 'ProximaNova',
                                textTransform: 'uppercase',
                                fill: '#444'
                            }
                        }
                    }
                ],
                legend: {
                    itemStyle: {
                        color: '#444',
                        fontFamily: 'ProximaNova',
                        textTransform: 'uppercase'
                    },
                    borderWidth: 0
                },
                tooltip: {
                    backgroundColor: 'lightgrey',
                    headerFormat: '<span style="display:block;margin:0;padding:0 0 2px 0;text-align:center"><b style="font-family:NotoSansBold;color:white;">{point.key}</b></span><table><tbody>',
                    footerFormat: '</tbody></table>',
                    pointFormat: '<tr><td class="tooltip-label"><span style="color:{series.color};width=100px;">\u25CF</span> {series.name}</td><td class="tooltip-point">{point.y}</td></tr>',
                    shared: true,
                    useHTML: true,
                    borderColor: '#444'
                }
                ,
                loadMask:true
                // ,
                // listeners: {
                //     chartRendered: function() {
                //         me.setLoading(false);
                //     },
                //     scop:me
                // }
            }
        });
        // me.setLoading(false);
    },
    
    getActiveDefectStates: function(){
        return ['Open','Fixed'];
    },
    getClosedDefectStates: function(){
        return ['Closed'];
    },
    updateChartData: function(chart){
        var chartData = chart.getChartData();
        console.log('chartDate', chartData);
    },
    getStartDate: function(){
        return Rally.util.DateTime.add(new Date(), 'day', -30);
    },
    getFilterFindConfig: function(){

        me = this;

        var findConfig = {
            _TypeHierarchy: 'Defect',
            _ProjectHierarchy: me.getContext().getProject().ObjectID
        };

        this.logger.log('getFilterFindConfig', findConfig);
        return findConfig;
    },

    
    removeChart: function() {
        var box = this.down('#chart_box');
        box.removeAll();
    },
    
    setChart: function(config) {
        var box = this.down('#chart_box');
        
        this.removeChart();

        // var chart_config = Ext.apply({
        //     xtype:'rallychart',
        //     //loadMask: true
        //     // ,
        //     // chartColors: CA.apps.charts.Colors.getConsistentBarColors()
        // }, config);
        
        box.add(config);
    },
    _fetchAllowedValues: function(modelName, fieldName){
        var deferred = Ext.create('Deft.Deferred');
        Rally.data.ModelFactory.getModel({
            type: modelName,
            success: function(model) {
                model.getField(fieldName).getAllowedValueStore().load({
                    callback: function(records, operation, success) {
                        this.logger.log('_fetchAllowedValues', records, operation);
                        if (success){
                            var vals = _.map(records, function(r){ return r.get('StringValue'); });
                            deferred.resolve(vals);
                        } else {
                            deferred.reject("Error fetching category data");
                        }
                    },
                    scope: this
                });
            },
            scope: this
        });
        return deferred;
    },

    getSettingsFields: function() {
        var check_box_margins = '5 0 5 0';
        return [{
            name: 'saveLog',
            xtype: 'rallycheckboxfield',
            boxLabelAlign: 'after',
            fieldLabel: '',
            margin: check_box_margins,
            boxLabel: 'Save Logging<br/><span style="color:#999999;"><i>Save last 100 lines of log for debugging.</i></span>'

        }];
    },

    getOptions: function() {
        var options = [
            {
                text: 'About...',
                handler: this._launchInfo,
                scope: this
            }
        ];

        return options;
    },

    _launchInfo: function() {
        if ( this.about_dialog ) { this.about_dialog.destroy(); }

        this.about_dialog = Ext.create('Rally.technicalservices.InfoLink',{
            showLog: this.getSetting('saveLog'),
            logger: this.logger
        });
    },

    isExternal: function(){
        return typeof(this.getAppId()) == 'undefined';
    },
});