import { EventBridgeHandler } from "aws-lambda";
import EventDetails from "./event-details";
import * as AWS from "aws-sdk";
var sns = new AWS.SNS();

export const handler: EventBridgeHandler<string, EventDetails, void> = async (
  event,
  context
) => {
  console.log("event recieved: ", JSON.stringify(event, null, 2));

  if (event["detail-type"] !== process.env.EVENT_TYPE_SMS_NOTIFICATION) return;

  console.log("sending sms to: ", event.detail.mobile);

  var params: AWS.SNS.PublishInput = {
    Message: `Your PET Theory report# ${event.detail.reportId} is ready` /* required */,
    PhoneNumber: event.detail.mobile,
    MessageAttributes: {
      "AWS.SNS.SMS.SenderID": {
        DataType: "String",
        StringValue: "PetTheory",
      },
      "WS.MM.SMS.OriginationNumber": {
        DataType: "String",
        StringValue: "a_verified_number_from_sns_sandbox",
      },
    },
  };
  try {
    const data = await sns.publish(params).promise();
    console.log("SMS sent! Message ID: ", JSON.stringify(data, null, 2));
  } catch (error) {
    console.log("Error sending sms:", JSON.stringify(error, null, 2));
  }
};
