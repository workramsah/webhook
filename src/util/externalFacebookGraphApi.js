import axios from 'axios';
import { config } from 'dotenv';
config();
const { GRAPH_API_TOKEN} = process.env;

export const externalFacebookGraphApi = async (method, url, messageData, callback, err) =>
{
   await axios({
      method: method,
      url: url,
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
      },
      data: messageData,
    })
    .then(response => callback(response))
    .catch(error => {
           console.log(error.response.data.error)
   });
}