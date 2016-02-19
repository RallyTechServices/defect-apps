Ext.define("defects-by-field-chart", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    defaults: { margin: 10 },

    config: {
        defaultSettings: {
            stackField: null,
            bucketField: 'Project',
            allowedStates: ['Open'],
            modelName: 'Defect',
            alwaysFetch: ['FormattedID','ObjectID','State'],
            noEntryText: '(No Entry)'
        }
    },

    integrationHeaders : {
        name : "defects-by-field-chart"
    },
                        
    launch: function() {
        this._updateDisplay();
    },
    _updateDisplay: function(){
        this.removeAll();

        if (!this._validateSettings(this.getSettings())){
            return;
        }

        this._fetchData(this._getStoreConfig(this.getSettings())).then({
            success: this._buildChart,
            failure: this._showError,
            scope: this
        });
    },
    _buildChart: function(records){
        this.logger.log('_buildChart', records);

        if (!records || records.length === 0){
            this.add({
                xtype: 'container',
                html: 'No records found for the configured settings.'
            });
            return;
        }

        this.add({
            xtype: 'rallychart',
            loadMask: false,
            chartConfig: this._getChartConfig(records),
            chartData: this._getChartData(records)
        });

    },
    _getAllowedStates: function(){
        var settings = this.getSettings();
        if (Ext.isString(settings.allowedStates)){
            return settings.allowedStates.split(',');
        }
        return settings.allowedStates;
    },
    _getChartConfig: function(records){
        var field = "Field",
            settings = this.getSettings(),
            stackField = null;

        if (records && records.length > 0){
            field = records[0].getField(settings.bucketField).displayName;
            if (settings.stackField && settings.stackField.length > 0){
                stackField = records[0].getField(settings.stackField).displayName;
            }
        }

        return {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Defects by ' + field

            },
            yAxis: {
                title: {
                    text: 'Count'
                }
            },
            legend: {
                title: { text: stackField},
                enabled: settings.stackField && settings.stackField.length > 0,
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top'
            },
            plotOptions: {
                column: {
                    stacking: 'normal'
                }

            }
        };
    },
    _getChartData: function(records){
        var hash = {},
            settings=  this.getSettings(),
            noEntryText = settings.noEntryText,
            stacks = [];

        Ext.Array.each(records, function(r){
            var bucket = r.get(settings.bucketField) || noEntryText,
                stack = "Total";

            if (Ext.isObject(bucket)){
                bucket = bucket._refObjectName;
            }

            if (settings.stackField){
                stack = r.get(settings.stackField) || noEntryText;
            }

            if (Ext.isObject(stack)){
                stack = stack._refObjectName;
            }

            if (!hash[bucket]){
                hash[bucket] = {};
            }
            if (!hash[bucket][stack]){
                if (!Ext.Array.contains(stacks, stack)){
                    stacks.push(stack);
                }
                hash[bucket][stack] = 0;
            }
            hash[bucket][stack]++;
        });

        var series = [],
            categories = _.keys(hash);

        _.each(stacks, function(stack){
            var obj = { name: stack, data: [] }
            _.each(categories, function(bucket){
                obj.data.push(hash[bucket][stack] || 0);
            });
            series.push(obj);
        });

        return {
            series: series,
            categories: categories
        };
    },
    _showError: function(msg){
        Rally.ui.notify.Notifier.showError(msg);
    },
    _getStoreConfig: function(settings){
        var fetch = settings.alwaysFetch.concat([settings.bucketField]);
        if (settings.stackField){
            fetch.push(settings.stackField);
        }

        var filters = _.map(this._getAllowedStates(), function(state){ return {property: 'State', value: state}; });
        filters = Rally.data.wsapi.Filter.or(filters);
        this.logger.log('_getStoreConfig', filters.toString(), fetch);

        return {
            model: settings.modelName,
            fetch: fetch,
            filters: filters,
            limit: 'Infinity'
        };
    },
    _validateSettings: function(settings){
        if (this._getAllowedStates().length > 0){
            return true;
        }

        this.add({
            xtype: 'container',
            html: 'Please use the app settings to configure at least one Allowed State for the data set.'
        });
    },
    _fetchData: function(config){
        var deferred = Ext.create('Deft.Deferred'),
            me = this;

        this.setLoading(true);
        Ext.create('Rally.data.wsapi.Store',config).load({
            callback: function(records, operation){
                me.setLoading(false);
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
        this._updateDisplay();
    }
});
