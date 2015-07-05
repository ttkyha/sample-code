/* Google API OAUTH 2 */

//load node modules
var fs = require('fs');
var path = require('path');
var readline = require('readline');
var google = require('googleapis');

exports.getAccessToken = function (STORED_TOKEN, OAUTH_STRUCTURE, oauth2Client, callback) {
      var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
      });
            
      var tokenJson = fs.readFileSync(STORED_TOKEN, 'utf8', function (err, data) {
      return data.toString(); 
      });
      var tokenData = JSON.parse(tokenJson || '');
      var expiryDate = tokenData.expiry_date;
      var isTokenExpired = expiryDate ? expiryDate <= (new Date()).getTime() : false;
      var url = oauth2Client.generateAuthUrl(OAUTH_STRUCTURE);
      var metadata_obj = {Authorization: 'Bearer '+tokenData.access_token};      

      if(!tokenData.access_token) {
          // generate consent page url
          console.log('Visit the url: ', url);
          rl.question('Enter the code here:', function(code) {
              // request access token
              oauth2Client.getToken(code, function(err, tokens) {
                // set tokens to the client
                oauth2Client.setCredentials(tokens);
                //store tokens   
                fs.writeFileSync(STORED_TOKEN, JSON.stringify(tokens));
                callback();
              });
          });
      } else if (isTokenExpired === true) {
          oauth2Client.setCredentials(tokenData);
          oauth2Client.getRequestMetadata(url, function(err, metadata_obj, response){
              var tokens = response && response.body || tokenData;
              oauth2Client.setCredentials(tokens);
              fs.writeFileSync(STORED_TOKEN, JSON.stringify(tokens));
              callback();              
          });
         /*Using refresh access_token method - deprecated in oauth2client.js
          oauth2Client.setCredentials(tokenData);      
          oauth2Client.refreshAccessToken(function(err, tokens) {
              oauth2Client.setCredentials(tokens);
              fs.writeFileSync(STORED_TOKEN, JSON.stringify(tokens));
              callback();
          })          
          */ 
      } else { 
        oauth2Client.setCredentials(tokenData) 
        callback();
      }
};
