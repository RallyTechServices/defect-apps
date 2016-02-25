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
            alwaysFetch: ['FormattedID','ObjectID','State','Severity','CreationDate',"_PreviousValues.State",'_ValidFrom','_ValidTo','_SnapshotNumber'],
            excludeUserStoryDefects: true,
            granularity: 'day',
            dateType: 'release',
            offsetStartDate: -60,
            offsetEndDate: 0,
            customStartDate: Rally.util.DateTime.add(new Date(), 'day', -60),
            customEndDate: Rally.util.DateTime.add(new Date())
        }
    },

    integrationHeaders : {
        name : "DefectBurndown"
    },

    severityAllowedValues: undefined,
    stateAllowedValues: undefined,

    launch: function() {
        this._initializeApp();
    },

    _initializeApp: function(){

        Rally.data.ModelFactory.getModel({
            type: 'Defect',
            success: function (model) {
                this.model = model;
                Deft.Promise.all([
                    this._fetchAllowedValues(model, 'State'),
                    this._fetchAllowedValues(model, 'Severity')]).then({

                    success: function (results) {
                        this.logger.log('launch', results);
                        this.stateAllowedValues = results[0];
                        this.severityAllowedValues = results[1];

                        if (this._validateSettings(this.getSettings())){
                            this._addSeverityOptions();
                        }
                    },
                    failure: function (msg) {
                        Rally.ui.notify.Notifier.showError({message: msg});
                    },
                    scope: this
                });
            },
            scope: this
        });
    },
    _validateSettings: function(settings){
        this.logger.log('_validateSettings', settings);
        var msg = 'Please configure included defect states in the App Settings.';
        if (settings && settings.includeStates && settings.includeStates.length > 0){
            var startDate = this._getStartDate(),
                endDate = this._getEndDate();

            if (startDate && endDate){
                if (Date.parse(startDate) < Date.parse(endDate)){
                    return true;
                }
                msg = "Please select a Start Date that falls before the selected End Date."

            } else {

                if (settings.dateType === "release"){
                    msg = "A release date range has been selected in the App Settings.  Please confirm app is being run on a release scoped dashboard page."
                } else {
                    msg = "Please select a valid custom date range in the App Settings."
                }
            }
        }
        this.removeAll();
        this.add({
            xtype: 'container',
            html: msg
        });
        return false;
    },
    _addSeverityOptions: function(){
        this.removeAll();

        var labelWidth = 100,
            severityOptions = _.map(this.severityAllowedValues, function(s){
               return { boxLabel: s || "None",  inputValue: s, checked: true };
            }),
            columns = Math.min(8, severityOptions.length),
            width = columns * 12 + '%';

        var cg = this.add({
            xtype: 'checkboxgroup',
            fieldLabel: 'Include Severity',
            labelAlign: 'right',
            itemId: 'includeSeverity',
            labelWidth: labelWidth,
            columns: columns,
            width: width,
            margin: '10 10 25 10',
            vertical: true,
            items: severityOptions
        });
        cg.on('change', this._buildChart, this);
        this._buildChart();
    },
    _buildChart: function(cg){
        var settings = this.getSettings();
        this.logger.log('_buildChart',  settings.includeStates);

        if (this.down('rallychart')){
            this.down('rallychart').destroy();
        }

        var query = settings.query,
            startDate = this._getStartDate(),
            endDate = this._getEndDate(),
            storeConfig = this._getStoreConfig(settings, startDate, endDate, query);

        var includeSeverity = this.severityAllowedValues;
        if (cg && cg.getValue){
            includeSeverity = _.values(cg.getValue());
        }

        this.add({
            xtype: 'rallychart',
            storeType: 'Rally.data.lookback.SnapshotStore',
            storeConfig: storeConfig,
            calculatorType: 'DefectBurndownCalculator',
            calculatorConfig: {
                includeSeverity: includeSeverity,
                includeStates: settings.includeStates,
                startDate: Rally.util.DateTime.toIsoString(startDate, true),
                endDate: Rally.util.DateTime.toIsoString(endDate, true),
                granularity: settings.granularity
            },
            chartConfig: this._getChartConfig()
        });
    },
    _getStartDate: function(){
        var settings = this.getSettings(),
            startDate = null;

        switch (settings.dateType){
            case "release":
                startDate = this.getContext().getTimeboxScope() &&
                    this.getContext().getTimeboxScope().type === 'release' &&
                    this.getContext().getTimeboxScope().getRecord() &&
                        Rally.util.DateTime.fromIsoString(this.getContext().getTimeboxScope().getRecord().get('ReleaseStartDate')) || null;
                break;

            case "offset":
                startDate = Rally.util.DateTime.add(new Date(), 'day', settings.offsetStartDate);
                break;

            case "custom":
                startDate = settings.customStartDate;
                break;
        }
        if (startDate){
            return new Date(startDate);
        }
        return null;
    },
    _getEndDate: function(){
        var settings = this.getSettings(),
            endDate = null;

        switch (settings.dateType){
            case "release":
                endDate = this.getContext().getTimeboxScope() &&
                    this.getContext().getTimeboxScope().type === 'release' &&
                    this.getContext().getTimeboxScope().getRecord() &&
                    Rally.util.DateTime.fromIsoString(this.getContext().getTimeboxScope().getRecord().get('ReleaseDate')) || null;
                break;

            case "offset":
                endDate = Rally.util.DateTime.add(new Date(), 'day', settings.offsetEndDate);
                break;

            case "custom":
                endDate = settings.customEndDate;
                break;
        }
        if (endDate){
            return new Date(endDate);
        }
        return null;
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
    _getStoreConfig: function(settings, startDate, endDate, query){
        var fetch = settings.alwaysFetch;

        startDate = Rally.util.DateTime.toIsoString(startDate);
        endDate = Rally.util.DateTime.toIsoString(endDate);
        var includeStates = settings.includeStates;
        if (Ext.isString(includeStates)){
            includeStates = includeStates.split(',');
        }

        var find = {
            _ProjectHierarchy: this.getContext().getProject().ObjectID,
            _TypeHierarchy: 'Defect',
            "$or": [{State: {$in: includeStates}}, {"_PreviousValues.State": {$in: includeStates}}],
            _ValidTo: {$gte: startDate},
            _ValidFrom: {$lte: endDate}
        };
        if (settings.excludeUserStoryDefects === false || settings.excludeUserStoryDefects === 'false'){
            find["Requirement"] = null;
        }

        this.logger.log('_getStoreConfig', fetch, find)
        return {
            fetch: fetch,
            find: find,
            hydrate: ["State","Severity","_PreviousValues.State"],
            limit: "Infinity",
            compress: true,
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
        return Rally.technicalservices.DefectsByFieldSettings.getFields(this.getSettings(), this.stateAllowedValues);
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
        if (this._validateSettings(settings)){
            this._addSeverityOptions();
        }
        //this._buildChart(settings);

    },
    _fetchAllowedValues: function(model, fieldName){
        var deferred = Ext.create('Deft.Deferred');

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

        return deferred;
    }
});
