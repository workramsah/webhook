import { externalFacebookGraphApi } from "./externalFacebookGraphApi.js";
import { sendTextMessage } from "./sendTextMessage.js";
import { randomUUID } from "crypto";

const { FACEBOOK_GRAH_URL, VERSION, BUSINESS_PHONE_NUMBER_ID } = process.env;

let payload, apiUrl;
apiUrl = `${FACEBOOK_GRAH_URL}/${VERSION}/${BUSINESS_PHONE_NUMBER_ID}`;

export const interactiveListHandler = async (senderPhoneNo, listId) => {
  console.log("event service");
  if (listId)
    switch (listId) {
      case "omega_service":
        await omegaServiceUrl(senderPhoneNo);
        break;
      case "omega_appointment":
        await appointment(senderPhoneNo);
        break;
      case "omega_saree":
        await sendSareeProduct(senderPhoneNo);
        break;
      case "omega_faqs":
        await sendFaqs(senderPhoneNo);
        break;
      case "omega_contactus":
        await contactUs(senderPhoneNo);
        break;
    }
};

const omegaServiceUrl = async (senderPhoneNo) => {
  await sendTextMessage(
    senderPhoneNo,
    "💧 Purifying Facial\n✨ Glowing Facial\n⏳ Anti-Aging Facial\n💎 Diamond Peel Facial\n🚫 Anti-Acne Facial",
    false
  );
};

const appointment = async (senderPhoneNo) => {
  payload = {
    messaging_product: "whatsapp",
    to: senderPhoneNo,
    type: "interactive",
    interactive: {
      type: "flow",
      header: {
        type: "text",
        text: `Facial Clinic!`,
      },
      body: {
        text: "Where Science Meets Smile – Schedule Your Appointment Today!",
      },
      // footer: {
      //   text: "Click the button below to proceed",
      // },
      action: {
        name: "flow",
        parameters: {
          flow_message_version: "3",
          flow_token: senderPhoneNo + "-" + randomUUID(),
          // flow_id: "791426712898304",
          // flow_id: "736782351907296",
          // flow_id: "513743347910903",
          flow_id: "8393523964096738",
          mode: "draft",
          // mode: "published",
          flow_cta: "Book now",
          flow_action: "data_exchange",
        },
      },
    },
  };

  await externalFacebookGraphApi(
    "POST",
    `${apiUrl}/messages`,
    payload,
    (res) => {
      console.log("Appointment form send successfully!");
    },
    (err) => {
      console.log("Appointment form send unsuccessfully!!");
    }
  );
};

const sendFaqs = async (senderPhoneNo) => {
  await sendTextMessage(
    senderPhoneNo,
    "*What is the difference between a facial cleanse and a facial exfoliation?*\n" +
      "A facial cleanse removes dirt, oil, and impurities from the skin's surface, while facial exfoliation sloughs off dead skin cells to reveal smoother, brighter skin.,\n\n" +
      "*How often should I get a facial?*\n" +
      "Generally, every 4-6 weeks is recommended for most people to maintain healthy skin.\n\n" +
      "*Can I wear makeup after a facial?*\n" +
      "Yes, but it's best to wait 24 hours to allow your skin to fully benefit from the facial?\n\n" +
      "*Are there any side effects to facial treatments?*\n" +
      "Yes, potential side effects include redness, irritation, or breakouts, especially if the skin is sensitive.\n\n" +
      "*Can I get a facial if I have sensitive skin?*\n" +
      "Yes, but choose a gentle facial treatment and inform your esthetician about your sensitivity.\n\n" +
      "*How long does a typical facial treatment last?*\n" +
      "A typical facial treatment lasts about 60 to 90 minutes.",
    true
  );
};

const contactUs = async (senderPhoneNo) => {
  await sendTextMessage(
    senderPhoneNo,
    "https://www.google.com\n" +
      "https://www.instagram.com\n" +
      "https://www.facebook.com\n\n" +
      "We look forward to helping you achieve your skincare goals!",
    false
  );
};

const sendSareeProduct = async (to = senderPhoneNo) => {
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
    type: "template",
    template: {
      name: "adivasi_unity_flag_accessories", //replace with your template name
      language: {
        code: "en", //replace with your language code
      },
      components: [
        /* MPM button component always required */
        {
          type: "button",
          sub_type: "mpm",
          index: 0,
          parameters: [
            {
              type: "action",
              action: {
                thumbnail_product_retailer_id: "3", //replace with your product id
                sections: [
                  {
                    title: "Accessories",
                    product_items: [
                      {
                        product_retailer_id: "3", //replace with your product id
                      },
                      {
                        product_retailer_id: "2", //replace with your product id
                      },
                      // ... // Additional item objects (up to 30)
                    ],
                  },
                  // ... // Add section objects (up to 10)
                ],
              },
            },
          ],
        },
      ],
    },
  };

  await externalFacebookGraphApi(
    "POST",
    `${apiUrl}/messages`,
    payload,
    (res) => {
      console.log("Sarees items send successfully!!");
    },
    (err) => {
      console.log("Sarees items send unsuccessfully!!");
    }
  );
};

//     const payload = {
//       messaging_product: "whatsapp",
//       recipient_type: "individual",
//       to: to,
//       type: "template",
//       template: {
//         // name: "adivasi_unity_flag_accessories",beauty_products
//         name: "beauty_products",
//         language: {
//           code: "en",
//         },
//         components: [
//           /* MPM button component always required */
//           {
//             type: "button",
//             sub_type: "mpm",
//             index: 0,
//             parameters: [
//               {
//                 type: "action",
//                 action: {
//                   thumbnail_product_retailer_id: "3",
//                   sections: [
//                     {
//                       title: "Accessories",
//                       product_items: [
//                         {
//                           product_retailer_id: "3",
//                         },
//                         {
//                           product_retailer_id: "2",
//                         },
//                         // ... // Additional item objects (up to 30)
//                       ],
//                     },
//                     // ... // Add section objects (up to 10)
//                   ],
//                 },
//               },
//             ],
//           },
//         ],
//       },
//     };
  
//     await externalFacebookGraphApi(
//       "POST",
//       `${apiUrl}/messages`,
//       payload,
//       (res) => {
//         console.log("Accessories items send successfully!!");
//       },
//       (err) => {
//         console.log("Accessories items send unsuccessfully!!");
//       }
//     );
// };