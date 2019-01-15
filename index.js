const aws = require("aws-sdk");
const cofirmEmailURL = "https://qh0uqafx50.execute-api.ap-northeast-1.amazonaws.com/dev/confirm-email";
const userPoolId = process.env.COGNITO_USER_POOL_ID;
const cognitoClientId = process.env.COGNITO_CLIENT_ID;
const redirectURI = "https://www.souzou-portal.com/?sign-in=true";
const cognitoIdentityServiceProviderApNortheast1 = new aws.CognitoIdentityServiceProvider({ region: "ap-northeast-1", apiVersion: "2016-04-18" });
const cognitoIdentityServiceProviderUsEast1 = new aws.CognitoIdentityServiceProvider({ region: "us-east-1", apiVersion: "2016-04-18" })

const getEnglishEmail = (userName, confirmationCode, displayName) => ({
    subject: "Welcome to Portal! Please verify your email address. [Portal]",
    message: `
    Hello, ${displayName}!<br>
    Welcome to Portal! Please verify your email address.<br>
    <br>
    Follow this link to finish the registration<br>
    <a href=${cofirmEmailURL}?client_id=${cognitoClientId}&user_name=${userName}&confirmation_code=${confirmationCode}&redirect_uri=${redirectURI}>Click Here</a>
`
});

const getJapaneseEmail = (userName, confirmationCode, displayName) => ({
    subject: "ようこそポータルへ！ メールアドレスの確認をお願いします。 [Portal]",
    message: `
    こんにちは、${displayName}さん<br>
    ようこそポータルへ！メールアドレスの確認をお願いします。<br>
    <br>
    このリンクをたどって登録を完了してください。<br>
    <a href=${cofirmEmailURL}?client_id=${cognitoClientId}&user_name=${userName}&confirmation_code=${confirmationCode}&redirect_uri=${redirectURI}>ここをクリック</a>
`
});

const getEnglishUpdatedEmail = (userName, confirmationCode, displayName) => ({
    subject: "Please verify your email address. [Portal]",
    message: `
    Hello, ${displayName}!<br>
    Updated your email address.<br>
    Please verify your email address.
`
});

const getJapaneseUpdatedEmail = (userName, confirmationCode, displayName) => ({
    subject: "メールアドレスの確認をお願いします。 [Portal]",
    message: `
    こんにちは、${displayName}さん<br>
    メールアドレスが更新されました。<br>
    <br>
    メールアドレスの確認をお願いします。<br>
`
});

exports.handler = async (event, context, callback) => {
    if (!event.userPoolId === userPoolId) {
        return callback(null, event);
    }

    if (!(event.region === "ap-northeast-1" || event.region === "us-east-1")) {
        return callback(null, event);
    }

    if (event.triggerSource === "CustomMessage_SignUp") {
        const email = (
            event.region === "ap-northeast-1" ? getJapaneseEmail(event.userName, event.request.codeParameter, event.request.userAttributes["custom:display_name"])
          : event.region === "us-east-1"      ? getEnglishEmail(event.userName, event.request.codeParameter, event.request.userAttributes["custom:display_name"])
          :                                     getEnglishEmail(event.userName, event.request.codeParameter, event.request.userAttributes["custom:display_name"])
        );
        event.response.emailSubject = email.subject;
        event.response.emailMessage = email.message;
    } else if (event.triggerSource === "CustomMessage_UpdateUserAttribute") {
        const email = (
            event.region === "ap-northeast-1" ? getJapaneseUpdatedEmail(event.userName, event.request.codeParameter, event.request.userAttributes["custom:display_name"])
          : event.region === "us-east-1"      ? getEnglishUpdatedEmail(event.userName, event.request.codeParameter, event.request.userAttributes["custom:display_name"])
          :                                     getEnglishUpdatedEmail(event.userName, event.request.codeParameter, event.request.userAttributes["custom:display_name"])
        );
        event.response.emailSubject = email.subject;
        event.response.emailMessage = email.message;
        await new Promise((resolve, reject) =>
            (
                event.region === "ap-northeast-1" ? cognitoIdentityServiceProviderApNortheast1
              : event.region === "us-east-1"      ? cognitoIdentityServiceProviderUsEast1
              :                                     cognitoIdentityServiceProviderUsEast1
            ).adminUpdateUserAttributes(
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
                (err, _data) => err ?  (console.error(err) || reject()) : resolve()
            )
        );
    }
    return callback(null, event);
};
