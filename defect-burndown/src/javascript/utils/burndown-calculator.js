Ext.define("DefectBurndownCalculator",{
    extend: "Rally.data.lookback.calculator.TimeSeriesCalculator",

    getMetrics: function(){

        return [{
            field: "isActive",
            as: "Active Defects",
            f: "sum",
            display: "line"
        },{
            field: "isNew",
            as: "New Defects",
            f: "sum",
            display: "line"
        },{
            field: "isClosed",
            as: "Closed Defects",
            f: "sum",
            display: "line"
        }];
    },

    getDerivedFieldsOnInput: function () {
        console.log('getMetrics',this.includeStates,this.includeSeverity)
        var includeStates = this.includeStates,
            includeSeverity = this.includeSeverity;

        return [
            {
                "as": "isActive",
                "f": function(snapshot){
                    if  (Ext.Array.contains(includeStates, snapshot.State) && Ext.Array.contains(includeSeverity, snapshot.Severity)) {
                        return 1;
                    }
                    return 0;
                }
            },{
                "as": "isClosed",
                "f": function(snapshot){
                    var previousState = snapshot._PreviousValues && snapshot._PreviousValues.State,
                        stateClosed = !Ext.Array.contains(includeStates, snapshot.State),
                        stateWasOpen = Ext.Array.contains(includeStates, previousState);

                    return stateClosed && stateWasOpen && Ext.Array.contains(includeSeverity, snapshot.Severity);
                }
            },{
                "as": "isNew",
                "f": function(snapshot){
                    var previousState = snapshot._PreviousValues,
                        include = Ext.Array.contains(includeStates, snapshot.State) && Ext.Array.contains(includeSeverity, snapshot.Severity);

                    if (include && previousState){
                        if ((previousState.State === null)|| (!Ext.Array.contains(includeStates, previousState.State))){
                            return 1;
                        }
                    }
                    return 0;
                }
            }
        ];
    },
    getDerivedFieldsAfterSummary: function () {
        return [{
            "as": "NewDefects",
            "f": function(snapshot, index, metrics, seriesData){
                console.log('snapshot', snapshot, snapshot.isActive);
                if (index > 0){
                    return snapshot["Active Defects"] - seriesData[index-1]["Active Defects"];
                }
                return 0;

            }
        },{
            "as": "ClosedDefects",
            "f": function(snapshot, index, metrics, seriesData){
                if (index > 0){
                    return snapshot["Closed Defects"] - seriesData[index-1]["Closed Defects"];
                }
                return 0;
            }
        }];
    }
});
