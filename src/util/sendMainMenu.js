import { externalFacebookGraphApi } from "./externalFacebookGraphApi.js";
import { config } from "dotenv";
config();
const { FACEBOOK_GRAH_URL, VERSION, BUSINESS_PHONE_NUMBER_ID } = process.env;

let apiUrl = `${FACEBOOK_GRAH_URL}/${VERSION}/${BUSINESS_PHONE_NUMBER_ID}`;

// Main list
export const sendinteractiveListMessage = async (to) =>{
  const payload = {
    messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "interactive",
         "interactive": {
          "type": "list",
          // "header": {
          //   "type": "text",
          //   "text": "Omega Group"
          // },
          "body": {
            "text": "Choose an option below:"
          },
          // "footer": {
          //   "text": "<MESSAGE_FOOTER_TEXT>"
          // },
          "action": {
            "sections": [
              {
                "title": "Omega Group Menu",
                "rows": [
                  {
                    "id": "omega_service",
                    "title": "💆‍♀ Facial Treatments",
                    // "description": "🎴 Graphics, Photographu and Warli Products."
                  },
                  {
                    "id": "omega_saree",
                    "title": "Products",
                    "description": "🛒 Shop Saree, Sticker, Flag, Badge, Car hanger, etc."
                  },
                  {
                    "id": "omega_appointment",
                    "title": "📅 Appointment",
                    // "description": "🪪 Enter your details with your query."
                  },
                  {
                    "id": "omega_faqs",
                    "title": "💬 FAQs",
                    // "description": "🤝🏻 Contact us for any query."
                  },
                  {
                    "id": "omega_contactus",
                    "title": " ℹ  About Us",
                    // "description": "🤝🏻 Contact us for any query."
                  }
                ]
              }
              /* Additional sections would go here */
            ],
            "button": "Menu",
          }
      },
  }
  
  await externalFacebookGraphApi("POST", `${apiUrl}/messages`, payload, res=>{console.log("Main interactive list send successfully!!")}, err => {console.log("Main interactive list send unsuccessfully!!")})
};