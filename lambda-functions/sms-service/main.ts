import { EventBridgeHandler } from "aws-lambda";
import EventDetails from "./event-details";

export const handler: EventBridgeHandler<string, EventDetails, void> = async (
  event,
  context
) => {
  console.log("event recieved: ", JSON.stringify(event, null, 2));

  if (event["detail-type"] !== process.env.EVENT_TYPE_SMS_NOTIFICATION) return;

  console.log("sending sms to: ", event.detail.mobile);
};
