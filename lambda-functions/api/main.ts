import {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
  APIGatewayProxyResultV2,
  Context,
} from "aws-lambda";
// import {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';

import * as AWS from "aws-sdk";
const eventBridge = new AWS.EventBridge();

export const handler: APIGatewayProxyHandlerV2 = async (
  event: APIGatewayProxyEventV2,
  context: Context
) => {
  try {
    //when connected with api gateway proxy integration, json body is sent as string by api gateway
    //https://stackoverflow.com/questions/41648467/getting-json-body-in-aws-lambda-via-api-gateway
    const eventBody = JSON.parse(event.body as string);
    console.log("event body json par:", eventBody);
    console.log("event body as it is:", event.body);

    var params: AWS.EventBridge.PutEventsRequest = {
      Entries: [
        {
          EventBusName: process.env.EVENT_BUS_NAME as string,
          Source: process.env.EVENT_SOURCE as string,
          DetailType: process.env.EVENT_TYPE_EMAIL_NOTIFICATION as string,
          Detail: event.body as string,
        },
        {
          EventBusName: process.env.EVENT_BUS_NAME as string,
          Source: process.env.EVENT_SOURCE as string,
          DetailType: process.env.EVENT_TYPE_SMS_NOTIFICATION as string,
          Detail: event.body as string,
        },
      ],
    };

    console.log(`Generating Events...`, JSON.stringify(params, null, 4));

    const response = await eventBridge.putEvents(params).promise();

    console.log(
      `Events bus response recieved...`,
      JSON.stringify(response, null, 4)
    );

    if (response.FailedEntryCount === 0 && response.Entries?.length === 2) {
      console.log(`Events generated successfully:`);

      //   return { id: response.Entries[0].EventId as string };

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `The report has been recieved successfully`,
        }),
      };
    } else {
      throw new Error(JSON.stringify(response, null, 4));
    }
  } catch (error) {
    console.error(`Error generating Events: `, error);

    return JSON.stringify({
      statusCode: 400,
      body: { error: JSON.stringify(error) },
    });
  }
};
