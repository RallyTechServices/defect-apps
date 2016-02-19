Ext.define("DefectBurndown", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    defaults: { margin: 10 },

    config: {
        defaultSettings: {
            includeStates: ['Open', 'Submitted'],
            modelName: 'Defect',
            includeSeverity: ['Critical','Major Problem'],
            alwaysFetch: ['FormattedID','ObjectID','State','Severity','_ValidFrom','_ValidTo']
        }
    },

    integrationHeaders : {
        name : "DefectBurndown"
    },

    launch: function() {
        this._buildChart(this.getSettings());
    },
    _buildChart: function(settings){
        this.logger.log('_buildChart');
        this.removeAll();
        var startDate = Rally.util.DateTime.add(new Date(), 'day', -100),
            endDate = new Date(),
            storeConfig = this._getStoreConfig(settings, startDate, endDate);

        this.add({
            xtype: 'rallychart',
            storeType: 'Rally.data.lookback.SnapshotStore',
            storeConfig: storeConfig,
            calculatorType: 'DefectBurndownCalculator',
            calculatorConfig: {
                includeSeverity: settings.includeSeverity,
                startDate: Rally.util.DateTime.toIsoString(startDate, true),
                endDate: Rally.util.DateTime.toIsoString(endDate, true)
            },
            chartConfig: this._getChartConfig()
        });

        //this.add({
        //    xtype: 'rallychart',
        //    loadMask: false,
        //    chartConfig: this._getChartConfig(),
        //    chartData: this._getChartData(records)
        //});

    },
    _getChartConfig: function(){
        return {
            chart: {
                defaultSeriesType: 'area',
                zoomType: 'xy'
            },
            title: {
                text: null
            },
            xAxis: {
                categories: [],
                tickmarkPlacement: 'on',
                tickInterval: 5,
                title: {
                    text: 'Date',
                    margin: 10
                }
            },
            yAxis: [
                {
                    title: {
                        text: 'Count'
                    }
                }
            ],
            tooltip: {
                formatter: function() {
                    return '' + this.x + '<br />' + this.series.name + ': ' + this.y;
                }
            },
            plotOptions: {
                series: {
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    },
                    groupPadding: 0.01
                },
                column: {
                    stacking: null,
                    shadow: false
                }
            }
        };
    },
    _showError: function(msg){
        Rally.ui.notify.Notifier.showError(msg);
    },
    _getStoreConfig: function(settings, startDate, endDate){
        var fetch = settings.alwaysFetch;

        startDate = Rally.util.DateTime.toIsoString(startDate);
        endDate = Rally.util.DateTime.toIsoString(endDate);

        return {
            fetch: fetch,
            find: {
                _ProjectHierarchy: this.getContext().getProject().ObjectID,
                _TypeHierarchy: 'Defect',
                State: {$in: settings.includeStates},
                _ValidTo: {$gte: startDate},
                _ValidFrom: {$lte: endDate}
            },
            hydrate: ["State","Severity"],
            limit: "Infinity",
            removeUnauthorizedSnapshots: true
        };

    },
    _fetchData: function(config){
        var deferred = Ext.create('Deft.Deferred'),
            me = this;

        Ext.create('Rally.data.lookback.SnapshotStore', config).load({
            callback: function(records, operation){
                me.logger.log('_fetchData', operation, records);
                if (operation.wasSuccessful()){
                    deferred.resolve(records);
                } else {
                    deferred.reject(operation.error.errors.join(','));
                }
            }
        });

        return deferred;
    },
    getSettingsFields: function(){
        return Rally.technicalservices.DefectsByFieldSettings.getFields(this.getSettings());
    },
    getOptions: function() {
        return [
            {
                text: 'About...',
                handler: this._launchInfo,
                scope: this
            }
        ];
    },

    _launchInfo: function() {
        if ( this.about_dialog ) { this.about_dialog.destroy(); }
        this.about_dialog = Ext.create('Rally.technicalservices.InfoLink',{});
    },

    isExternal: function(){
        return typeof(this.getAppId()) == 'undefined';
    },

    //onSettingsUpdate:  Override
    onSettingsUpdate: function (settings){
        this.logger.log('onSettingsUpdate',settings);
        // Ext.apply(this, settings);
        this._buildChart(settings);

    }
});
