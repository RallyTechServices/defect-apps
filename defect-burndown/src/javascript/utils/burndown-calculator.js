Ext.define("DefectBurndownCalculator",{
    extend: "Rally.data.lookback.calculator.TimeSeriesCalculator",

    getMetrics: function () {
        return [
            //{
            //    "field": "ObjectID",
            //    "as": "Count",
            //    "display": "line",
            //    "f": "count"
            //},
            {
                "field": "FormattedID",
                "as": "Defects",
                "f": "filteredCount",
                "filterField": "Severity",
                "filterValues": this.includeSeverity,
                "display": "column"
            }
        ];
    }
});
