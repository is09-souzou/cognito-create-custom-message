const aws = require("aws-sdk");
const cofirmEmailURL = "https://qh0uqafx50.execute-api.ap-northeast-1.amazonaws.com/dev/confirm-email";
const userPoolId = process.env.COGNITO_USER_POOL_ID;
const cognitoClientId = process.env.COGNITO_CLIENT_ID;
const redirectURI = "http://localhost:8080";
const region = process.env.REGION;
const cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider({apiVersion: "2016-04-18",region: "ap-northeast-1"})

const getEmailMessage = (userName, confirmationCode) => (`
    Follow this link to finish the registration
    <a href=${cofirmEmailURL}?client_id=${cognitoClientId}&user_name=${userName}&confirmation_code=${confirmationCode}&redirect_uri=${redirectURI}>Click Here</a>
`);

exports.handler = async (event, context, callback) => {
    if(event.userPoolId === userPoolId) {
        if(event.triggerSource === "CustomMessage_SignUp") {
            event.response.emailSubject = "Welcome to Portal! Please verify your Email Adress.";
            event.response.emailMessage = getEmailMessage(event.userName, event.request.codeParameter);
        } else if (event.triggerSource === "CustomMessage_UpdateUserAttribute") {
            event.response.emailSubject = "Updated your Email Adress.";
            event.response.emailMessage = "check";
            await new Promise((resolve, reject) => 
                cognitoidentityserviceprovider.adminUpdateUserAttributes(
                    {
                        UserAttributes: [
                            {
                                Name: "email_verified",
                                Value: "true" 
                            },
                        ],
                        UserPoolId: userPoolId,
                        Username: event.userName
                    }, 
                    (err, data) => err ?  (console.error(err) || reject()) : resolve()
                )
            )
        }
    }
    
    callback(null, event);
};
