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
    // MessageAttributes: {
    //   "<String>": {
    //     DataType: "STRING_VALUE" /* required */,
    //     StringValue: "STRING_VALUE",
    //   },
    //   /* '<String>': ... */
    // },
    // MessageDeduplicationId: "STRING_VALUE",
    // MessageGroupId: "STRING_VALUE",
    // MessageStructure: "STRING_VALUE",
    // Subject: "STRING_VALUE",
    // TargetArn: "STRING_VALUE",
    // TopicArn: "STRING_VALUE",
  };
  try {
    const data = await sns.publish(params).promise();
    console.log("SMS sent! Message ID: ", data.MessageId);
  } catch (error) {
    console.log("Error sending sms:", JSON.stringify(error, null, 2));
  }
};
