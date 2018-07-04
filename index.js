const cofirmEmailURL = "https://qh0uqafx50.execute-api.ap-northeast-1.amazonaws.com/dev/confirm-email";
const userPoolId = process.env.COGNITO_USER_POOL_ID;
const cognitoClientId = process.env.COGNITO_CLIENT_ID;
const redirectURI = "http://localhost:8080";

const getEmailMessage = (userName, confirmationCode) => (`
    Follow this link to finish the registration
    <a href=${cofirmEmailURL}?client_id=${cognitoClientId}&user_name=${userName}&confirmation_code=${confirmationCode}&redirect_uri=${redirectURI}>Click Here</a>
`);

exports.handler = (event, context, callback) => {
    if(event.userPoolId === userPoolId) {
        if(event.triggerSource === "CustomMessage_SignUp") {
            console.log(event.request);
            event.response.emailSubject = "Welcome to Portal! Please verify your Email Adress.";
            event.response.emailMessage = getEmailMessage(event.userName, event.request.codeParameter);
        }
    }
    
    callback(null, event);
};
