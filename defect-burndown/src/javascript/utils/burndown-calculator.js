Ext.define('SnapsCalculator',{
    constructor: function(config){

        var snaps = config.snaps,
            dateBuckets = config.dateBuckets,
            currentSnapIndex = snaps.length - 1,
            granularity = config.granularity,
            includeStates = config.includeStates,
            excludeUserStoryDefects = config.excludeUserStoryDefects,
            includeSeverity = config.includeSeverity,
            includeField = config.includeField,
            includeFieldValues = config.includeFieldValues || [];

        this.creationDate = Rally.util.DateTime.fromIsoString(snaps[currentSnapIndex].CreationDate);
        this.severity = snaps[currentSnapIndex].Severity;
        this.snaps = snaps;

            var snapIndex = 0,
                snap = snaps[snapIndex],
                validFrom = Rally.util.DateTime.fromIsoString(snap._ValidFrom),
                validTo =  Rally.util.DateTime.fromIsoString(snap._ValidTo),
                endDate = Rally.util.DateTime.add(dateBuckets[0], granularity, -1),
                startDate;


            var created = _.map(dateBuckets, function(a){ return 0; }),
                active = _.map(dateBuckets, function(a){ return 0; }),
                closed = _.map(dateBuckets, function(a){ return 0; });

            var include = Ext.Array.contains(includeSeverity, this.severity);
            if (excludeUserStoryDefects && snaps[currentSnapIndex].Requirement){
                include = false;
            }
            
            if ( !Ext.isEmpty(includeField) && includeFieldValues.length > 0 ) {
                if ( !Ext.Array.contains(includeFieldValues, snap[includeField]) ) {
                    include = false;
                }
                
            }

            if (include) {
                for (var dateIndex = 0; dateIndex < dateBuckets.length; dateIndex++) {
                    startDate = endDate;
                    endDate = dateBuckets[dateIndex];

                    if (this.creationDate <= endDate && this.creationDate > startDate) {
                        created[dateIndex]++;
                    }

                    //Now make sure we have the current snapshot for the date bucket
                    if (validTo < endDate) {
                        snap = null;
                        while (validTo < endDate && snapIndex < snaps.length - 1) {
                            snapIndex++;
                            snap = snaps[snapIndex];
                            validTo = Rally.util.DateTime.fromIsoString(snap._ValidTo);
                            validFrom = Rally.util.DateTime.fromIsoString(snap._ValidFrom);
                        }
                    }
                    if (snap && validFrom < endDate) {
                        if (Ext.Array.contains(includeStates, snap.State)) {
                            active[dateIndex]++;
                        }

                        if (!Ext.Array.contains(includeStates, snap.State) &&
                            snap._PreviousValues && Ext.Array.contains(includeStates, snap._PreviousValues.State) &&
                            validFrom > startDate) {
                            closed[dateIndex]++;
                        }
                    }
                }
            }

        this.created = created;
        this.active = active;
        this.closed = closed;

    }
});


Ext.define("DefectBurndownCalculator",{
    extend: "Rally.data.lookback.calculator.BaseCalculator",
    config: {
        /**
         * @cfg {String[]} workDays
         * The days of the week to include in aggregation calculations
         */
        workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],

        /**
         * @cfg {Object[]} holidays
         * Configure the days to exclude from the aggregation calculations. They are objects with `year`, `day`, and
         * `month` properties. For example:
         *   {"year": 2011, "month": 12, "day": 25}
         */
        holidays: [],

        /**
         * @cfg {Date} startDate
         * Set the start date of the calculation; no data will be emitted before this time point.
         */
        startDate: undefined,

        /**
         * @cfg {Date} endDate
         * Set the end date of the calculation; no data will be emitted after this time point.
         */
        endDate: undefined,

        /**
         * @cfg {String} timeZone
         * Set the time zone used during aggregation calculations. In the format of the zoneinfo database. See
         * http://en.wikipedia.org/wiki/List_of_tz_database_time_zones for a list.
         */
        timeZone: "GMT",

        dateFormat: {
            day: 'm-d-Y',
            week: 'M d, Y',
            month: 'M Y'
        },
        
        /*
         * @cfg {String} includeField
         * Set this to a field on the defects that the includeFieldValues array draws
         * values from, then items will be limited to those that have one of the includeFieldValues
         * array values
         */
        includeField: null,
        /*
         * @cfg [{String}] includeFieldValues
         * An array of values that will be considered when the field is defined in includeField above
         * 
         * If the array is empty, then all values will be accepted
         */
        includeFieldValues: []
    },

    runCalculation: function (snapshots) {
        console.log('runCalculation', this.startDate, this.endDate)

        var granularity = this.granularity,
            dateBuckets = this.getDateBuckets(this.startDate, this.endDate, this.granularity);

        var snapsByOid = this.aggregateSnapsByOid(snapshots),
            includeStates = this.includeStates;

        var objectData = [];
        Ext.Object.each(snapsByOid, function(oid, snaps){
            objectData.push(Ext.create('SnapsCalculator',{
                snaps: snaps,
                granularity: granularity,
                dateBuckets: dateBuckets,
                includeStates: includeStates,
                includeSeverity: this.includeSeverity,
                excludeUserStoryDefects: this.excludeUserStoryDefects,
                includeField: this.includeField,
                includeFieldValues: this.includeFieldValues
            }));
        }, this);

        var seriesData = [
            {name: 'New', type: 'line', data: _.map(dateBuckets, function(d){ return 0; })},
            {name: 'Closed', type: 'line', data:_.map(dateBuckets, function(d){ return 0; })},
            {name: 'Active', type: 'line', data:_.map(dateBuckets, function(d){ return 0; })},
        ];

        for (var i=0; i<dateBuckets.length; i++){
            Ext.Array.each(objectData, function(obj){
                seriesData[0].data[i] += obj.created[i];
                seriesData[1].data[i] += obj.closed[i];
                seriesData[2].data[i] += obj.active[i];
            });
        }

        return {
            series: seriesData,
            categories: this.formatDateBuckets(dateBuckets, this.dateFormat[granularity])
        };
    },
    aggregateSnapsByOid: function(snaps){
        //Return a hash of objects (key=ObjectID) with all snapshots for the object
        var snaps_by_oid = {};
        Ext.each(snaps, function(snap){
            var oid = snap.ObjectID || snap.get('ObjectID');
            if (snaps_by_oid[oid] == undefined){
                snaps_by_oid[oid] = [];
            }
            snaps_by_oid[oid].push(snap);

        });
        return snaps_by_oid;
    },

    getDateBuckets: function(startDate, endDate, granularity){
        var bucketStartDate = startDate,
            bucketEndDate = endDate;

        if (granularity === 'month'){
            bucketStartDate = this.getBeginningOfMonthAsDate(startDate);
            bucketEndDate = this.getEndOfMonthAsDate(endDate);
        }

        var date = bucketStartDate;

        var buckets = [];
        while (date<bucketEndDate && bucketStartDate < bucketEndDate){
            buckets.push(date);
            date = Rally.util.DateTime.add(date,granularity,1);
        }
        return buckets;
    },
    formatDateBuckets: function(buckets, dateFormat){
        var categories = [];
        Ext.each(buckets, function(bucket){
            categories.push(Rally.util.DateTime.format(bucket,dateFormat));
        });
        categories[categories.length-1] += "*";
        return categories;
    },
    getBeginningOfMonthAsDate: function(dateInMonth){
        var year = dateInMonth.getFullYear();
        var month = dateInMonth.getMonth();
        return new Date(year,month,1,0,0,0,0);
    },
    getEndOfMonthAsDate: function(dateInMonth){
        var year = dateInMonth.getFullYear();
        var month = dateInMonth.getMonth();
        var day = new Date(year, month+1,0).getDate();
        return new Date(year,month,day,0,0,0,0);
    }
});
