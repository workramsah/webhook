import { externalFacebookGraphApi } from "./externalFacebookGraphApi.js";
import { config } from "dotenv";
config();
const { FACEBOOK_GRAH_URL, VERSION, BUSINESS_PHONE_NUMBER_ID } = process.env;

let apiUrl = `${FACEBOOK_GRAH_URL}/${VERSION}/${BUSINESS_PHONE_NUMBER_ID}`;
// sendTextmessage
export const sendTextMessage = async (to, msgData, previewUrl, messageType) => {
  let payload;

  if (messageType === "submitcart" || messageType==="paymentlink") {
    payload = msgData;
  } else{
    console.log("to, msgData, previewUrl, messageType", to, msgData, previewUrl, messageType);
    
    payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to,
      type: "text",
      text: {
        preview_url: previewUrl || false,
        body: msgData,
      },
    };
  }
  await externalFacebookGraphApi(
    "POST",
    `${apiUrl}/messages`,
    payload,
    (res) => {
      console.log("Greeting message send successfully");
    },
    (err) => {
      console.log(err);
    }
  );
};
