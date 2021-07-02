import { EventBridgeHandler } from "aws-lambda";
import EventDetails from "./event-details";
import * as AWS from "aws-sdk";

var ses = new AWS.SES();

export const handler: EventBridgeHandler<string, EventDetails, void> = async (
  event,
  context
) => {
  console.log("event recieved: ", JSON.stringify(event, null, 2));

  if (event["detail-type"] !== process.env.EVENT_TYPE_EMAIL_NOTIFICATION)
    return;

  console.log("sending email to: ", event.detail.email);

  // The character encoding for the email.
  const charset = "UTF-8";

  // Specify the parameters to pass to the API.
  var params: AWS.SES.SendEmailRequest = {
    Source: process.env.SES_EMAIL_FROM as string,
    Destination: {
      ToAddresses: [event.detail.email],
    },
    Message: {
      Subject: {
        Data: "This is subject of the email",
        Charset: charset,
      },
      Body: {
        Text: {
          Data: `Hi ${event.detail.name}, You report [${event.detail.reportId}] is ready for collection.`,
          Charset: charset,
        },
        // Html: {
        //   Data: body_html,
        //   Charset: charset,
        // },
      },
    },
    // ConfigurationSetName: configuration_set,
  };
  try {
    //Try to send the email.
    const data = await ses.sendEmail(params).promise();

    console.log("Email sent! Message ID: ", data.MessageId);
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};
