#Defect Burndown

Shows the active, new and closed defects over the selected time range.  

Active defects is the count of defects in the "Active State" (as determined in the app configuration) for the time bucket (day, week, month, etc).
Closed defects is the count of defects that transitioned from an Active State into an inactive state (or were deleted) for the time bucket.  
New defects is the count of defects that were created on that day.  

All defects are filtered by the selected Severities.  They are filtered by the severity value at the time of the latest snapshot when they were in an "Active State".   

Defects are further filtered by the selected values on the field that is chosen as the filterField by the administrator in the App Settings...

 ![ScreenShot](/images/defect-burndown.png)

###App Configurations
*  Granularity - the buckets of time (options are:  day, week, month)
*  Active States - the defect states that are considered active.  
*  Exclude User Story Defects - does not include defects that are associated with User Stories.  They are filtered out by whether or not they are associated with a defect at the time of hte latest snapshot when they were in an "Active State"
*  Date Boundaries - defines the date range for the chart
      * Selected Release - if the app is on a Release Scoped Dashboard, then this option will use the Release Start and End Dates.  
      * Custom - Allows for user to enter custom start and end dates in the configuration
      * Days from Today - This allows the user to enter an offset relative to today for the app to determine the date range
                   (e.g. show data for the last 90 days would be Start Date = -90, End Date = 0)
                   
  ![ScreenShot](/images/defect-burndown-settings.png)

## Development Notes

### First Load

If you've just downloaded this from github and you want to do development, 
you're going to need to have these installed:

 * node.js
 * grunt-cli
 * grunt-init
 
Since you're getting this from github, we assume you have the command line
version of git also installed.  If not, go get git.

If you have those three installed, just type this in the root directory here
to get set up to develop:

  npm install

### Structure

  * src/javascript:  All the JS files saved here will be compiled into the 
  target html file
  * src/style: All of the stylesheets saved here will be compiled into the 
  target html file
  * test/fast: Fast jasmine tests go here.  There should also be a helper 
  file that is loaded first for creating mocks and doing other shortcuts
  (fastHelper.js) **Tests should be in a file named <something>-spec.js**
  * test/slow: Slow jasmine tests go here.  There should also be a helper
  file that is loaded first for creating mocks and doing other shortcuts 
  (slowHelper.js) **Tests should be in a file named <something>-spec.js**
  * templates: This is where templates that are used to create the production
  and debug html files live.  The advantage of using these templates is that
  you can configure the behavior of the html around the JS.
  * config.json: This file contains the configuration settings necessary to
  create the debug and production html files.  Server is only used for debug,
  name, className and sdk are used for both.
  * package.json: This file lists the dependencies for grunt
  * auth.json: This file should NOT be checked in.  Create this to run the
  slow test specs.  It should look like:
    {
        "username":"you@company.com",
        "password":"secret"
    }
  
### Usage of the grunt file
####Tasks
    
##### grunt debug

Use grunt debug to create the debug html file.  You only need to run this when you have added new files to
the src directories.

##### grunt build

Use grunt build to create the production html file.  We still have to copy the html file to a panel to test.

##### grunt test-fast

Use grunt test-fast to run the Jasmine tests in the fast directory.  Typically, the tests in the fast 
directory are more pure unit tests and do not need to connect to Rally.

##### grunt test-slow

Use grunt test-slow to run the Jasmine tests in the slow directory.  Typically, the tests in the slow
directory are more like integration tests in that they require connecting to Rally and interacting with
data.
