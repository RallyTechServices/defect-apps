Ext.define('CArABU.calculator.DefectTrendCalculator',{
    extend: "Rally.data.lookback.calculator.TimeSeriesCalculator",

    getMetrics: function () {
        var activeStates = this.activeDefectStates,
            closedStates = this.closedDefectStates;
        console.log('activestates', activeStates);

        return [{
            field: "State",
            as: "Total Active",
            "f": "filteredCount",
            "filterField": "State",
            "filterValues": activeStates,
            "display": "line",
            "marker": {
                enabled: false
            }
        },{
            field: "State",
            "as": "Done",
            "f": "filteredCount",
            "filterField": "State",
            "filterValues": closedStates,
            "display": "line",
            "marker": {
                enabled: false
            }
        },{
            field: "State",
            "as": "Not Reviewed",
            "f": "filteredCount",
            "filterField": "State",
            "filterValues": ['Submitted'],
            "display": "line",
            "marker": {
                enabled: false
            }
        },{
            field: "State",
            "as": "Total",
            "f":"count",
            "display": "line",
            "marker": {
                enabled: false
            }
        }];
    },
    
    _buildSeriesConfig: function (calculatorConfig) {
        var aggregationConfig = [],
            metrics = calculatorConfig.metrics,
            derivedFieldsAfterSummary = calculatorConfig.deriveFieldsAfterSummary;

        for (var i = 0, ilength = metrics.length; i < ilength; i += 1) {
            var metric = metrics[i];
            if (metric.display) { //override so that it doesn't show metrics we don't want to
                var metricData = {
                    name: metric.as || metric.field,
                    type: metric.display,
                    dashStyle: metric.dashStyle || "Solid"
                };
                if (metric.marker){
                    metricData.marker = metric.marker;
                }
                aggregationConfig.push(metricData);
            }
        }

        for (var j = 0, jlength = derivedFieldsAfterSummary.length; j < jlength; j += 1) {
            var derivedField = derivedFieldsAfterSummary[j];
            aggregationConfig.push({
                name: derivedField.as,
                type: derivedField.display,
                dashStyle: derivedField.dashStyle || "Solid"
            });
        }
        console.log('aggregationConfig', aggregationConfig);
        return aggregationConfig;
    },

});