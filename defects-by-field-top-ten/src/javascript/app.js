Ext.define("CArABU.app.TSApp", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new CArABU.technicalservices.Logger(),
    defaults: { margin: 10 },


    items: [
        {xtype:'container',itemId:'selector_box',layout:{type:'hbox'}, margin: '10 10 50 10' },
        {xtype:'container',itemId:'display_box', margin: '50 10 10 10' }
    ],

    config: {
        defaultSettings: {
            stackField: null,
            bucketField: 'Project',
            allowedStates: ['Open'],
            modelName: 'Defect',
            alwaysFetch: ['FormattedID','ObjectID','State'],
            noEntryText: '(No Entry)',
            query: '',
            showNoDataCategories: false,
            showTopTen: true
        }
    },

    integrationHeaders : {
        name : "defects-by-field-chart"
    },
                        
    launch: function() {
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
        //this._updateDisplay();
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
                multiSelect: true,
                margin: '10 10 10 10', 
                width: 450,
                labelWidth: 100,
                cls: 'rally-checkbox-combobox',
                showArrows: false,
                valueField:'Name',
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
                text: 'Update',
                listeners: {
                    click: me._updateDisplay,
                    scope: me
                }
            }
        ]);
    },


    _updateDisplay: function(){
        var me = this;
        me.down('#display_box').removeAll();

        if (!this._validateSettings(this.getSettings())){
            return;
        }
        this._fetchAllowedValues(this.getSettings().modelName, this.getSettings().bucketField).then({
            success: function(values){
                this.allCategories = values;
                this._fetchData(this._getStoreConfig(this.getSettings())).then({
                    success: this._buildChart,
                    failure: this._showError,
                    scope: this
                });
            },
            failure: function(msg){
                Rally.ui.notify.Notifier.showError({message: msg});
            },
            scope: this
        });
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

    _buildChart: function(records){
        this.logger.log('_buildChart', records);
        var settings = this.getSettings();
        if (!records || records.length === 0){
            this.add({
                xtype: 'container',
                html: 'No records found for the configured settings.'
            });
            return;
        }
        this.down('#display_box').add({
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
        console.log(records);
        if (records && records.length > 0){
            field = records[0].getField(settings.bucketField).displayName;
            if (settings.stackField && settings.stackField.length > 0){
                stackField = records[0].getField(settings.stackField).displayName;
            }
        }

        var rotation = 0;
        if (this.allCategories && this.allCategories.length > 20){
            rotation = 65;
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
            xAxis: {
                labels: {
                    rotation: rotation
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
        var me = this;
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

        if(settings.showTopTen === 'true' || settings.showTopTen === true){
            var x = me._sortProperties(hash, 'Total', true, true);
            var hash_again = {}
            var length = x.length < 10 ? x.length : 10;
            for (i = 0; i < length ; i++) { 
                hash_again[x[i][0]] = x[i][1]
            }
            console.log('hash>>',hash);
            console.log('hash1>>',hash_again);

            hash = hash_again;            
        }



        var series = [],
            categories = _.keys(hash);

        if (settings.showNoDataCategories === 'true' || settings.showNoDataCategories === true){
            categories = this.allCategories || categories;
        }

        _.each(stacks, function(stack){
            var obj = { name: stack, data: [] }
            _.each(categories, function(bucket){
                var val = hash[bucket] && hash[bucket][stack] || 0;
                obj.data.push(val);
            });
            series.push(obj);
        });
        console.log('series>>',series);
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
        // if (settings.stackField){
        //     fetch.push(settings.stackField);
        // }

        // var filters = _.map(this._getAllowedStates(), function(state){ return {property: 'State', value: state}; });
        // filters = Rally.data.wsapi.Filter.or(filters);

        // if (settings.query && settings.query.length > 0){
        //     var queryFilter = Rally.data.wsapi.Filter.fromQueryString(settings.query);
        //     this.logger.log('_getStoreConfig -> query filter:', queryFilter.toString(), 'allowed state filter:', filters.toString());
        //     filters = filters.and(queryFilter);
        // }

        var config = {
            model: settings.modelName,
            fetch: fetch,
            limit: 'Infinity'
        };

        var r_filters = [];
        Ext.Array.each(this.down('#releaseCombo').value, function(rel){
            r_filters.push({
                property: 'Release.Name',
                value: rel
            })
        });
        if(r_filters.length > 0){
            r_filters = Rally.data.wsapi.Filter.or(r_filters)
            config['filters'] = r_filters;            
        }

        this.logger.log('_getStoreConfig', r_filters && r_filters.toString(), fetch);

        return config;
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
        return CArABU.app.DefectsByFieldSettings.getFields(this.getSettings(), this.states);
    },

    // getSettingsFields: function() {
    //     var check_box_margins = '5 0 5 0';
    //     return [{
    //         name: 'saveLog',
    //         xtype: 'rallycheckboxfield',
    //         boxLabelAlign: 'after',
    //         fieldLabel: '',
    //         margin: check_box_margins,
    //         boxLabel: 'Save Logging<br/><span style="color:#999999;"><i>Save last 100 lines of log for debugging.</i></span>'

    //     }];
    // },

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

    _sortProperties: function(obj, sortedBy, isNumericSort, reverse) {
            sortedBy = sortedBy || 1; // by default first key
            isNumericSort = isNumericSort || false; // by default text sort
            reverse = reverse || false; // by default no reverse

            var reversed = (reverse) ? -1 : 1;

            var sortable = [];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    sortable.push([key, obj[key]]);
                }
            }
            if (isNumericSort)
                sortable.sort(function (a, b) {
                    return reversed * (a[1][sortedBy] - b[1][sortedBy]);
                });
            else
                sortable.sort(function (a, b) {
                    var x = a[1][sortedBy].toLowerCase(),
                        y = b[1][sortedBy].toLowerCase();
                    return x < y ? reversed * -1 : x > y ? reversed : 0;
                });
            return sortable; 
        }

});
