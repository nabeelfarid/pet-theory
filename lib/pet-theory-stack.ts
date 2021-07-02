import * as cdk from "@aws-cdk/core";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as events from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";
import * as iam from "@aws-cdk/aws-iam";

export class PetTheoryStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const eventSourceRestApi = "pettheory.rest.api";
    const eventTypeEmailNotification = "EmailNotification";
    const eventTypeSmsNotification = "SmsNotification";

    const bus = new events.EventBus(this, `${id}_eventbus`, {
      eventBusName: `${id}_eventbus`,
    });

    const apiLambda = new lambda.Function(this, `${id}_api_lambda`, {
      functionName: `${id}_api_lambda`,
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("lambda-functions/api"),
      handler: "main.handler",

      environment: {
        EVENT_TYPE_EMAIL_NOTIFICATION: eventTypeEmailNotification,
        EVENT_TYPE_SMS_NOTIFICATION: eventTypeSmsNotification,
        EVENT_BUS_NAME: bus.eventBusName,
        EVENT_SOURCE: eventSourceRestApi,
      },
    });

    events.EventBus.grantAllPutEvents(apiLambda);

    const restApiGateway = new apigateway.LambdaRestApi(
      this,
      `${id}_lambda_rest_api_gateway`,
      {
        handler: apiLambda,
      }
    );

    const sesEmailFrom = "nabeelfarid@gmail.com";

    const emailServiceLambda = new lambda.Function(
      this,
      `${id}_lambda_email_service`,
      {
        functionName: `${id}_lambda_email_service`,
        runtime: lambda.Runtime.NODEJS_14_X,
        code: lambda.Code.fromAsset("lambda-functions/email-service"),
        handler: "main.handler",
        environment: {
          EVENT_TYPE_EMAIL_NOTIFICATION: eventTypeEmailNotification,
          SES_EMAIL_FROM: sesEmailFrom,
        },
      }
    );

    emailServiceLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "ses:SendEmail",
          "ses:SendRawEmail",
          "ses:SendTemplatedEmail",
        ],
        resources: [
          `arn:aws:ses:${cdk.Stack.of(this).region}:${
            cdk.Stack.of(this).account
          }:identity/${sesEmailFrom}`,
        ],
      })
    );

    const emailServiceRule = new events.Rule(this, `${id}_email_service_rule`, {
      ruleName: `${id}_email_service_rule`,
      eventPattern: {
        source: [eventSourceRestApi],
        detailType: [eventTypeEmailNotification],
      },
      eventBus: bus,
      targets: [new targets.LambdaFunction(emailServiceLambda)],
    });

    const smsServiceLambda = new lambda.Function(
      this,
      `${id}_lambda_sms_service`,
      {
        functionName: `${id}_lambda_sms_service`,
        runtime: lambda.Runtime.NODEJS_14_X,
        code: lambda.Code.fromAsset("lambda-functions/sms-service"),
        handler: "main.handler",
        environment: {
          EVENT_TYPE_SMS_NOTIFICATION: eventTypeSmsNotification,
        },
      }
    );

    const smsServiceRule = new events.Rule(this, `${id}_sms_service_rule`, {
      ruleName: `${id}_sms_service_rule`,
      eventPattern: {
        source: [eventSourceRestApi],
        detailType: [eventTypeSmsNotification],
      },
      eventBus: bus,
      targets: [new targets.LambdaFunction(smsServiceLambda)],
    });
  }
}
