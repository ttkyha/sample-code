/* MAIN */

//load node modules
var fs = require('fs');
var path = require('path');
var readline = require('readline');
var google = require('googleapis');
//var googleAuth = require('google-auth-library');

//load file modules
var authorize = require('.//authorize.js');

//define paths
var AUTH_FOLDER = 'auth';
var CLIENT_SECRET_NAME = 'client_secrets';
var TOKEN_NAME = 'tokens';

var FILE_MAIN_PATH = path.dirname(require.main.filename);
var BASE_PATH = path.join(FILE_MAIN_PATH,'..');
var AUTH_PATH = path.join(BASE_PATH,AUTH_FOLDER);
var NODE_MODULES_PATH = path.join(BASE_PATH,'node_modules');
var NODE_PATH = process.execPath
var CLIENT_PATH = path.join(BASE_PATH,AUTH_FOLDER,CLIENT_SECRET_NAME+'.json');
var STORED_TOKEN = path.join(BASE_PATH,AUTH_FOLDER,TOKEN_NAME+'.json');
var STORED_AUTH = path.join(AUTH_PATH,CLIENT_SECRET_NAME+'.dat');

//API access settings
var SCOPE = [
				"https://www.googleapis.com/auth/bigquery"
				, "https://www.googleapis.com/auth/devstorage.read_write"
				, "https://www.googleapis.com/auth/analytics.readonly"
				, "https://www.googleapis.com/auth/drive"
			];
var ACCESS_TYPE = 'offline'; // will return a refresh token
var OAUTH_STRUCTURE = {
			            access_type: ACCESS_TYPE
			            ,scope:  SCOPE
				      }


//extract client secret
var clientJson = fs.readFileSync(CLIENT_PATH, 'utf8', function (err, data) {
	return data.toString(); 
});
var clientData = JSON.parse(clientJson || '');      
var clientId = clientData && clientData.installed && clientData.installed.client_id;
var clientSecret = clientData && clientData.installed && clientData.installed.client_secret;
var rediretUri = clientData && clientData.installed && clientData.installed.redirect_uris && clientData.installed.redirect_uris[0] || 'http://localhost'; 

//Oauth2
var OAuth2Client = google.auth.OAuth2;
var oauth2Client = new OAuth2Client(clientId, clientSecret, rediretUri);

//sample request
var test = function() {
		var bigquery = google.bigquery({ version: 'v2', auth: oauth2Client });
		var params = {
			projectId: 'tco-gap-2014'
			,query: 'SELECT TOP(word, 300) AS word, COUNT(*) AS word_count ' +
			'FROM publicdata:samples.shakespeare WHERE LENGTH(word) > 10;'
		}
		var queryResults = bigquery.jobs.query(params, function(err, respond)
			{
				console.log(respond);
				//callback();  		
			});
		console.log(queryResults)

		console.log('done')
		process.exit(0)
    };
    
authorize.getAccessToken(STORED_TOKEN, OAUTH_STRUCTURE, oauth2Client, test);
