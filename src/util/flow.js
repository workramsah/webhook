// To navigate to a screen, return the corresponding response from the endpoint. Make sure the response is encrypted.

let timeArray = [
  {
    id: "10:00",
    title: "10:00 AM",
  },
  {
    id: "11:00",
    title: "11:00 AM",
  },
  {
    id: "12:00",
    title: "12:00 PM",
  },
  {
    id: "13:00",
    title: "01:00 PM",
  },
  {
    id: "14:00",
    title: "02:00 PM",
  },
  {
    id: "15:00",
    title: "03:00 PM",
  },
  {
    id: "16:00",
    title: "04:00 PM",
  },
  {
    id: "17:00",
    title: "05:00 PM",
  },
];

const onDateChange = async (selectedDate) => {
  timeArray[3]["enabled"] = false;
};

const currentDate = new Date();
const currentYear = currentDate.getFullYear(); // Get the current year (e.g., 2025)
const currentMonth = currentDate.getMonth() + 1; // Get the current month (0-indexed, January is 0)

// Get all days in the given year and month
function getAllDaysInMonth(year, month1Indexed) {
  const days = [];

  const month0Indexed = month1Indexed - 1;
  
  // Get the number of days in the month
  const numDays = new Date(year, month1Indexed, 0).getDate();

  // Iterate through all days of the month
  for (let day = 1; day <= numDays; day++) {
    const date = new Date(year, month0Indexed, day);

    const id = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`; // Format as "YYYY-MM-DD"
    const title = date.toDateString(); // Format as "Day Date Year"

    days.push({ id, title });
  }

  // console.log("Days in Month:", days);
  return days;
}

const SCREEN_RESPONSES = {
  APPOINTMENT: {
    screen: "APPOINTMENT",
    data: {
      servicetype: [
        {
          id: "general",
          title: "General Dentistry",
        },
        {
          id: "cosmetic",
          title: "Cosmetic Dentistry",
        },
        {
          id: "restorative",
          title: "Restorative Dentistry",
        },
        {
          id: "Orthodontics",
          title: "Orthodontics",
        },
        {
          id: "periodontal",
          title: "Periodontal Services",
        },
        {
          id: "pediatric",
          title: "Pediatric Dentistry",
        },
      ],
      is_location_enabled: true,
      date: getAllDaysInMonth(currentYear, currentMonth), // Output: [ 'Fri Nov 1 2024', 'Sat Nov 2 2024', ..., 'Sat Nov 30 2024' ]
      is_date_enabled: true,
      time: timeArray,
      is_time_enabled: true,
    },
  },
  DETAILS: {
    screen: "DETAILS",
    data: {
      servicetype: "1",
      date: "2024-01-01",
      time: "11:30",
    },
  },
  SUMMARY: {
    screen: "SUMMARY",
    data: {
      appointment:
        "BX Beaux Laser Centre JBCS at J5-04 Level 5, Johor Bahru City Square, Bandar Johor Bahru, 80000 Johor Bahru, Johor, Malaysia\nMon Jan 01 2024 at 11:30.",
      details:
        "Name: Vismay Gamit\nEmail: vismay@gmail.com\nPhone: 123456789\n\n",
      department: "beauty",
      servicetype: "1",
      date: "2024-01-01",
      more_details: "test",
      time: "11:30",
      name: "John Doe",
      email: "john@example.com",
      phone: "123456789",
    },
  },
  SUCCESS: {
    screen: "SUCCESS",
    data: {
      extension_message_response: {
        params: {
          flow_token: "REPLACE_FLOW_TOKEN",
          some_param_name: "PASS_CUSTOM_VALUE",
        },
      },
    },
  },
};

// To navigate to a screen, return the corresponding response from the endpoint. Make sure the response is enccrypted.
export const getNextScreen = async (decryptedBody) => {
  const { screen, data, version, action, flow_token } = decryptedBody;
  // handle health check request
  if (action === "ping") {
    return {
      data: {
        status: "active",
      },
    };
  }

  // handle error notification
  if (data?.error) {
    console.warn("Received client error:", data);
    return {
      data: {
        acknowledged: true,
      },
    };
  }

  // handle initial request when opening the flow and display APPOINTMENT screen
  if (action === "INIT") {
// console.log(getAllDaysInMonth(currentYear, currentMonth1Indexed));

    return {
      ...SCREEN_RESPONSES.APPOINTMENT,
      data: {
        ...SCREEN_RESPONSES.APPOINTMENT.data,
        // these fields are disabled initially. Each field is enabled when previous fields are selected
        is_location_enabled: false,
        is_date_enabled: false,
        is_time_enabled: false,
      },
    };
  }

  if (action === "data_exchange") {
    // handle the request based on the current screen
    switch (screen) {
      // handles when user interacts with APPOINTMENT screen
      case "APPOINTMENT":
        // update the appointment fields based on current user selection
        console.log("calender date", data.date);
        if (data.date) {
          await onDateChange(data.date);
        }
        return {
          ...SCREEN_RESPONSES.APPOINTMENT,
          data: {
            // copy initial screen data then override specific fields
            ...SCREEN_RESPONSES.APPOINTMENT.data,
            // each field is enabled only when previous fields are selected
            is_location_enabled: Boolean(data.department),
            is_date_enabled: Boolean(data.department) && Boolean(data.location),
            is_time_enabled:
              Boolean(data.department) &&
              Boolean(data.location) &&
              Boolean(data.date),

            //TODO: filter each field options based on current selection, here we filter randomly instead
            // location: SCREEN_RESPONSES.APPOINTMENT.data.location.slice(0, 3),
            date: SCREEN_RESPONSES.APPOINTMENT.data.date,
            time: SCREEN_RESPONSES.APPOINTMENT.data.time,
          },
        };

      // handles when user completes DETAILS screen
      case "DETAILS":
        // console.log(SCREEN_RESPONSES.APPOINTMENT.data);
        const serviceType = SCREEN_RESPONSES.APPOINTMENT.data.servicetype.find(
          (dept) => dept.id === data.servicetype
        ).title;
      
        const dateName = SCREEN_RESPONSES.APPOINTMENT.data.date.find(
          (date) => date.id === data.date
        ).title;

        const appointment = `${serviceType} at BX Beaux Laser Centre JBCS\n${dateName} ${data.time}`;

        const details = `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}`;

        return {
          ...SCREEN_RESPONSES.SUMMARY,
          data: {
            appointment,
            details,
            // return the same fields sent from client back to submit in the next step
            ...data,
          },
        };

      // handles when user completes SUMMARY screen
      case "SUMMARY":
        // TODO: save appointment to your database
        // send success response to complete and close the flow
        console.log("summary",data);
        return {
          ...SCREEN_RESPONSES.SUCCESS,
          data: {
            extension_message_response: {
              params: {
                flow_token,
              },
            },
          },
        };
      default:
        break;
    }
  }

  console.error("Unhandled request body:", decryptedBody);
  throw new Error(
    "Unhandled endpoint request. Make sure you handle the request action & screen logged above."
  );
};