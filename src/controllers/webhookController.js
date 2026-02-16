import { config } from "dotenv";
import crypto from "crypto";
import { externalFacebookGraphApi } from "../util/externalFacebookGraphApi.js";
import { decryptRequest, encryptResponse } from "../util/encryption.js";
import { getNextScreen } from "../util/flow.js";
import { sendinteractiveListMessage } from "../util/sendMainMenu.js";
import { interactiveListHandler } from "../util/interactive.js";
import { sendTextMessage } from "../util/sendTextMessage.js";
config();

const {
  FACEBOOK_GRAH_URL,
  WEBHOOK_VERIFY_TOKEN,
  VERSION,
  BUSINESS_PHONE_NUMBER_ID,
  PRIVATE_KEY,
  PASSPHRASE,
  APP_SECRET
} = process.env;

let payload,
  apiUrl = `${FACEBOOK_GRAH_URL}/${VERSION}/${BUSINESS_PHONE_NUMBER_ID}`;

// receive whatsapp messages
export const webhookIncomingMessage = async (req, res, next) => {
  //   console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));
  const resMessage = req.body.entry;
  // details on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  const message = resMessage?.[0]?.changes[0]?.value?.messages?.[0];
  console.log(message);
  const senderName =
    resMessage?.[0].changes[0]?.value?.contacts?.[0].profile.name;
  const senderPhoneNo = resMessage?.[0].changes[0]?.value?.contacts?.[0].wa_id;

  console.log("message type", message?.type);

  // check if the incoming message contains text
  if (message?.type === "text") {
    // const business_phone_number_id =
    //   resMessage?.[0].changes?.[0].value?.metadata?.phone_number_id;

    const msgText = message.text.body.toLowerCase();

    if (
      msgText.includes("hi") == true ||
      msgText.includes("hello") == true ||
      msgText.includes("hey") == true
    ) {
      sendTextMessage(senderPhoneNo, "👋 Hello" + ", " + senderName + "! How can I help you today?", false);

      await externalFacebookGraphApi(
        "POST",
        `${apiUrl}/messages`,
        payload,
        (res) => {
          console.log("Message send successfully!");
        },
        (err) => {
          console.log("Message send unsuccessfully!!");
        }
      );

      await sendinteractiveListMessage(senderPhoneNo);
    }
  } else if (message?.type === "document") {
    console.log("message type document");
  } else if (message?.type === "image") {
    console.log("message type image");
  } else if (message?.type === "video") {
    console.log("message type video");
  } else if (message?.type === "contacts") {
    console.log("message type contacts");
  } else if (message?.type === "sticker") {
    console.log("message type sticker");
  } else if (message?.type === "audio") {
    console.log("message type audio");
  } else if (message?.type === "interactive") {
    console.log("message type interactive");
    if (message.interactive.type != "button_reply") {
      const listId = message?.interactive?.list_reply.id;
      listId && (await interactiveListHandler(senderPhoneNo, listId));
    }
  } else if (message?.type === "location") {
    console.log("message type location");
  } else if (message?.type === "template") {
    console.log("message type template");
  } else if (message?.type === "reaction") {
    console.log("message type reaction");
  }
  message?.id && (await messageAsRead(message.id));
  res.sendStatus(200);
};

// webhook verification
export const webhookVerfication = async (req, res, next) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // check the mode and token sent are correct
  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    // respond with 200 OK and challenge token from the request
    res.status(200).send(challenge);
    console.log("Webhook verified successfully!");
  } else {
    // respond with '403 Forbidden' if verify tokens do not match
    res.sendStatus(403);
  }
};

// messageread
const messageAsRead = async (messageId) => {
  payload = {
    messaging_product: "whatsapp",
    status: "read",
    message_id: messageId,
  };

  await externalFacebookGraphApi(
    "POST",
    `${apiUrl}/messages`,
    payload,
    (res) => {
      console.log("Message status read successfully!");
    },
    (err) => {
      console.log("Message status read unsuccessfully!!");
    }
  );
};

// flow webhook verification
export const flowWebHookVerfication = async (req, res, next) => {
  if (!PRIVATE_KEY) {
    throw new Error(
      'Private key is empty. Please check your env variable "PRIVATE_KEY".'
    );
  }

  if (!isRequestSignatureValid(req)) {
    // Return status code 432 if request signature does not match.
    // To learn more about return error codes visit: https://developers.facebook.com/docs/whatsapp/flows/reference/error-codes#endpoint_error_codes
    return res.status(432).send();
  }

  let decryptedRequest = null;
  try {
    decryptedRequest = decryptRequest(
      req.body,
      PRIVATE_KEY.replace(/\\n/g, "\n"),
      PASSPHRASE
    );
  } catch (err) {
    console.error(err);
    if (err instanceof FlowEndpointException) {
      return res.status(err.statusCode).send();
    }
    return res.status(500).send();
  }

  const { aesKeyBuffer, initialVectorBuffer, decryptedBody } = decryptedRequest;
  console.log("💬 Decrypted Request:", decryptedBody);
  if (decryptedBody?.screen === "SUMMARY") {
    console.log("summary", decryptedBody.data);
    let testData = {
      service_type: decryptedBody.data.servicetype,
      appointment_date: decryptedBody.data.date,
      time: decryptedBody.data.time,
      name: decryptedBody.data.name,
      email: decryptedBody.data.email,
      phone: decryptedBody.data.phone,
      message: decryptedBody.data.message ? decryptedBody.data.message : "",
      flow_token: decryptedBody.flow_token,
    };
    console.log(testData);
  }

  // TODO: Uncomment this block and add your flow token validation logic.
  // If the flow token becomes invalid, return HTTP code 427 to disable the flow and show the message in `error_msg` to the user
  // Refer to the docs for details https://developers.facebook.com/docs/whatsapp/flows/reference/error-codes#endpoint_error_codes

  /*
  if (!isValidFlowToken(decryptedBody.flow_token)) {
    const error_response = {
      error_msg: `The message is no longer available`,
    };
    return res
      .status(427)
      .send(
        encryptResponse(error_response, aesKeyBuffer, initialVectorBuffer)
      );
  }
  */
  const screenResponse = await getNextScreen(decryptedBody);

  // console.log("👉 Response to Encrypt:", screenResponse);
  // console.log(screenResponse);

  res.send(encryptResponse(screenResponse, aesKeyBuffer, initialVectorBuffer));
};

function isRequestSignatureValid(req) {
  try {
    if (!APP_SECRET) {
      console.warn(
        "App Secret is not set up. Please Add your app secret in /.env file to check for request validation"
      );
      return true;
    }
  
    const signatureHeader = req.get("x-hub-signature-256");
    const signatureBuffer = Buffer.from(
      signatureHeader.replace("sha256=", ""),
      "hex"
    );
  
    const hmac = crypto.createHmac("sha256", APP_SECRET);
    const digestString = hmac.update(req.rawBody).digest("hex");
    const digestBuffer = Buffer.from(digestString, "hex");
  
    if (!crypto.timingSafeEqual(digestBuffer, signatureBuffer)) {
      console.error("Error: Request Signature did not match");
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    
    return false;
  }
}
