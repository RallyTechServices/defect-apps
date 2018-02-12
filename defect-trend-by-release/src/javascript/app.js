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
                stateId: me.getContext().getScopedStateId('releaseCombo'),   
                fieldLabel: 'Select Release:',
                margin: '10 10 10 10', 
                width: 450,
                labelWidth: 100,
                listeners:{
                    change: function(cb){
                        console.log(cb, cb.getRecord());
                        me.startDate = cb.getRecord().get('ReleaseStartDate');
                        me.endDate = cb.getRecord().get('ReleaseDate');
                    }
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
        
        //this.setLoading(true);
        
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
                startDate: me.startDate,
                endDate: me.endDate
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
                xAxis: {
                    tickmarkPlacement: 'on',
                    tickInterval: 5,
                    title: {
                        text: 'Days',
                        style: {
                            color: '#444',
                            fontFamily: 'ProximaNova',
                            textTransform: 'uppercase',
                            fill: '#444'
                        }
                    },
                    plotLines: this.getPlotlines()
                },
                yAxis: [
                    {
                        min: 0,
                        title: {
                            text: 'Count',
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
            }
        });
    },
    getPlotlines: function(){
        var plotLines = [];

        this.logger.log('getPlotlines', this.milestoneData);

        Ext.Object.each(this.milestoneData, function(oid, data){
            this.logger.log('getPlotlines', oid, data);
            if (data.TargetDate){

                var day = this.getStartDate(),
                    dateIndex = 0;

                while (data.TargetDate > day){
                    day = Rally.util.DateTime.add(day, 'day', 1);
                    if (day.getDay() > 0 && day.getDay() < 6){
                        dateIndex++;
                    }
                }

                var color = data.DisplayColor || "#F6F6F6",
                    style = 'solid';
                if (color === "##F6F6F6"){
                    style = 'dash';
                }
                plotLines.push({
                    color: color,
                    dashStyle: style,
                    width: 2,
                    value: dateIndex-1,
                    label: {
                        rotation: 0,
                        y: 15,
                        style: {
                            color: '#888',
                            fontSize: '11px',
                            fontFamily: 'ProximaNovaSemiBold',
                            fill: '#888'
                        },
                        text: data.Name
                    },
                    zIndex: 3
                });
            }
        }, this);
        return plotLines;

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


        var findConfig = {
            _TypeHierarchy: 'Defect'
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

        var chart_config = Ext.apply({
            xtype:'rallychart',
            loadMask: false
            // ,
            // chartColors: CA.apps.charts.Colors.getConsistentBarColors()
        }, config);
        
        box.add(chart_config);
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

    _displayGridGivenStore: function(store,field_names){
        this.down('#grid_box1').add({
            xtype: 'rallygrid',
            store: store,
            columnCfgs: field_names
        });
    },

    _displayGridGivenRecords: function(records,field_names){
        var store = Ext.create('Rally.data.custom.Store',{
            data: records
        });

        var cols = Ext.Array.map(field_names, function(name){
            return { dataIndex: name, text: name, flex: 1 };
        });
        this.down('#grid_box2').add({
            xtype: 'rallygrid',
            store: store,
            columnCfgs: cols
        });
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

    _getTickInterval: function(granularity) {
        if ( Ext.isEmpty(granularity) ) { return 30; }
        
        
        granularity = granularity.toLowerCase();
        if (this.timebox_limit < 30) {
            return 1;
        }
        if ( granularity == 'day' ) { return 30; }
        
        return 1;
        
    }


});
