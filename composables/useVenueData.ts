import MVenue from "~/models/venue.model";
import MSpace from "~/models/space.model";

export const useVenueData = () => {
  const countries = [
    { name: "Malaysia", countryCode: "MY" },
    { name: "Philippines", countryCode: "PH" },
    { name: "Singapore", countryCode: "SG" },
  ];

  const { country } = useLocal();

  const tags = reactive({
    Business: [
      {
        category: "Conference / Seminar",
        keywords: [
          "Conference",
          "Seminar",
          "Awards Ceremony",
          "PR Event",
          "AGM",
          "Breakout",
          "Convention",
          "Presentation",
          "Press Conference",
          "Product Launch",
          "Symposium",
          "Promotional Event",
        ],
      },
      {
        category: "Corporate Events",
        keywords: [
          "Corporate Event",
          "Summer Party",
          "Corporate Party",
          "Corporate Reception",
          "Networking",
          "Office Party",
          "Staff Party",
          "Outdoor Party",
          "Company Fun Day",
          "Activity Day",
          "Away Day",
        ],
      },
    ],
    "Wedding and Dining": [
      {
        category: "Wedding",
        keywords: [
          "Wedding",
          "Asian Wedding",
          "Outdoor Wedding",
          "Unusual Wedding",
          "Wedding Ceremony",
          "Wedding Reception",
          "Civil Ceremony",
          "Civil Partnership",
          "Marquee Wedding",
          "Unique Wedding",
          "Garden Wedding",
          "Dry Hire Wedding",
        ],
      },
      {
        category: "Dining",
        keywords: [
          "Private Dining",
          "Dining Party",
          "Birthday Dinner",
          "Tasting",
          "Supper Club",
          "Christening",
          "New Year’s Eve Dinner",
        ],
      },
      {
        category: "Banquet",
        keywords: [
          "Banquet",
          "Gala",
          "Gala Dinner",
          "Prom",
          "Leavers Ball",
          "Bar Mitsvah",
          "Charity Event",
          "Ball",
        ],
      },
    ],
    Parties: [
      {
        category: "Social Parties",
        keywords: [
          "Birthday",
          "18th Birthday Party",
          "30th Birthday Party",
          "40th Birthday Party",
          "50th Birthday Party",
          "Party",
          "Private Party",
          "Hen Party",
          "Stag Party",
          "Leaving Party",
          "Graduation Party",
          "New Year’s Eve Party",
          "Cocktail Masterclass",
          "BBQ",
        ],
      },
      {
        category: "Clubbing / Night Out",
        keywords: ["Clubbing", "Gig", "Live Music"],
      },
      {
        category: "Drinks Receptions",
        keywords: [
          "Drinks Reception",
          "Engagement Party",
          "Anniversary Party",
          "Retirement Party",
          "Engagement Drinks",
          "Wine Tasting",
        ],
      },
      {
        category: "Christmas Parties",
        keywords: ["Christmas Party", "Holiday Party", "Christmas Dinner"],
      },
      {
        category: "Baby Shower / Tea Party",
        keywords: [
          "Baby Shower",
          "Bridal Shower",
          "Tea Party",
          "Afternoon Tea",
        ],
      },
      {
        category: "Children / Teen",
        keywords: [
          "Teen Party",
          "Kids Party",
          "Children’s Birthday Party",
          "Kid’s Birthday Party",
          "Children’s Party",
          "Kid’s Party Bus",
        ],
      },
      {
        category: "Generic Tags",
        keywords: [
          "Minimum Spend",
          "Dry Hire",
          "Blank Canvas",
          "Self Catering",
          "Unusual Space",
          "Unique",
          "Wet Hire",
        ],
      },
    ],
    "Art / Cultural": [
      {
        category: "Filming and Photography",
        keywords: ["Photoshoot", "Filming / Video Recording"],
      },
      {
        category: "Cultural",
        keywords: ["Film Festival", "Screening", "Festival"],
      },
      {
        category: "Performances",
        keywords: [
          "Book Launch",
          "Exhibition",
          "Concert",
          "Pop-Up Event",
          "Pop-up Space",
          "Fashion",
          "Performance",
          "Stand-up Comedy",
        ],
      },
      {
        category: "Art Space",
        keywords: [
          "Music / AudiRecording",
          "Casting & Auditions",
          "Rehearsal",
          "Podcast Recording",
          "Drama Class",
          "Dance Class",
          "Piano Lesson",
          "Yoga / Pilates Class",
          "Swimming Lesson",
        ],
      },
    ],

    "Building / Style": [
      {
        category: "Style",
        keywords: ["Exclusive", "Funky", "Luxury", "Modern"],
      },
    ],

    "Space Type": [
      {
        category: "Social Parties",
        keywords: [
          "Meeting",
          "Meeting Room",
          "Boardroom",
          "Classroom",
          "Market Research",
          "Training Room",
          "Workshop",
          "Team Building",
          "Off-site",
          "IT Training",
          "Therapy Room",
        ],
      },
      {
        category: "Drinks and Dining",
        keywords: [
          "Pub",
          "Private Dining Room",
          "Bar",
          "Restaurant",
          "Nightclub Hire",
          "Cafe",
          "Karaoke Bar",
        ],
      },
      {
        category: "Building",
        keywords:  computed(() => {
          const baseKeywords = [
            "Event Space",
            "Function Room",
            "Banqueting Hall",
            "Kitchen",
            "Gallery",
            "Pop-Up Shop",
            "Coworking Space",
            "Loft",
            "Cinema",
            "Penthouse",
            "Barn",
            "Theatre",
            "Community Center",
            "Conservatory",
            "Field",
            "Hall",
            "Library",
            "Railway Arch",
            "Museum",
            "Warehouse",
            "Underground Space",
            "Auditorium / Conference Room",
          ];
  
          // Add "Apartment" only if the country is NOT Singapore
          if (country?.toLowerCase() !== "sg") {
            baseKeywords.push("Apartment");
          }
          return baseKeywords;
        
      }),
      },
      {
        category: "Studio / Production",
        keywords: [
          "Creative Space",
          "Art Studio",
          "Photo Studio",
          "Dance Studio",
          "Film Studio",
          "Filming Location",
          "Drama Studio",
          "TV Studio",
          "Music Studio",
          "Piano Room",
          "Yoga / Pilates Studio",
          "Recording Studio",
          "Rehearsal Rooms",
        ],
      },
      {
        category: "Outdoor",
        keywords: ["Garden", "Rooftop", "Outdoor Space", "Terrace"],
      },
      {
        category: "Sport",
        keywords: [
          "Bowling Alley",
          "Ice Rink",
          "Racecourse",
          "Swimming Pool",
          "Sports Hall",
        ],
      },
    ],
  });

  const venueTypes = [
    { label: "Apartment Penthouse", value: "APARTMENT_PENTHOUSE" },
    { label: "Auditorium", value: "AUDITORIUM" },
    {
      label: "Academic Venue University Building",
      value: "ACADEMIC_VENUE_UNIVERSITY_BUILDING",
    },
    { label: "Pub Bar", value: "PUB_BAR" },
    { label: "Nightclub", value: "NIGHTCLUB" },
  ];

  const timeOptionFrom = [
    "06:00",
    "06:30",
    "07:00",
    "07:30",
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
    "22:30",
    "23:00",
    "23:30",
    "00:00",
    "00:30",
    "01:00",
    "01:30",
    "02:00",
    "02:30",
    "03:00",
    "03:30",
    "04:00",
    "04:30",
    "05:00",
    "05:30",
  ];

  const timeOptionTo = [
    "06:00",
    "06:30",
    "07:00",
    "07:30",
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
    "22:30",
    "23:00",
    "23:30",
    "00:00",
    "00:30",
    "01:00",
    "01:30",
    "02:00",
    "02:30",
    "03:00",
    "03:30",
    "04:00",
    "04:30",
    "05:00",
    "05:30",
    "06:00",
  ];


  const cateringAndDrinksOptions = [
    {
      question: "The venue offers in-house catering services", //value being passed
      subtitle: "The venue employs its own chef and staff",
      name: "The venue offers in-house catering services", // displayed sentence in filtering
      answer: false,
      type: "VENUE",
      key: "0",
      reference: "catering_options",
      options: [],
    },
    {
      question:
        "The venue exclusively collaborates with an approved roster of external caterers", //value being passed
      subtitle:
        "Only approved caterers are permitted to provide external catering",
      name: "The venue exclusively collaborates with an approved roster of external caterers", // displayed sentence in filtering
      answer: false,
      type: "VENUE",
      key: "1",
      reference: "catering_options",
      options: [],
    },
    {
      question: "Guests are permitted to bring their own catering/food", //value being passed
      subtitle:
        "Clients have the option to hire a caterer of their preference or bring their own food",
      name: "Guests are permitted to bring their own alcohol", // displayed sentence in filter
      answer: false,
      type: "VENUE",
      key: "2",
      reference: "catering_options",
      options: [],
    },
    {
      question: "Buyout fee for BYO catering/food", //value being passed
      subtitle:
        "Fee for clients using their own caterer or bringing their own food",
      name: "Buyout fee for BYO catering/food", // displayed sentence in filter
      answer: false,
      type: "VENUE",
      key: "2.1",
      reference: "catering_options",
      options: [],
    },
    {
      question: "Kitchen facilities available for guests", //value being passed
      subtitle: "Space where clients can prepare their own food.",
      name: "Kitchen facilities available for guests", // displayed sentence in filter
      answer: false,
      type: "VENUE",
      key: "2.2",
      reference: "catering_options",
      options: [],
    },
    {
      question: "Refreshments provided for guests.", //value being passed
      subtitle: "Included complimentary with every booking",
      name: "Refreshments provided for guests.", // displayed sentence in filter
      answer: false,
      type: "VENUE",
      key: "3",
      reference: "catering_options",
      options: [],
    },
  
    // The venue supplies alcohol
    {
      question: "Liquor license", //value being passed
      subtitle: "Your venue is authorized to sell or provide alcohol",
      name: "Your venue is authorized to sell or provide alcohol", // displayed sentence in filtering
      answer: false,
      type: "VENUE",
      key: "4",
      reference: "alcohol_provided",
      options: [],
      max_capacity: null,
    },
    {
      question: "Alcohol license extension available", //value being passed
      subtitle: "",
      name: "Alcohol license extension available", // displayed sentence in filtering
      answer: false,
      type: "VENUE",
      key: "4.1",
      reference: "alcohol_provided",
      options: [],
    },
    // BYO alcohol
    {
      question: "Guests are permitted to bring their own alcohol",  //value being passed
      subtitle: "Guests are invited to bring their own alcoholic beverages",
      name: "Guests are permitted to bring their own catering/food", // displayed sentence in filtering
      answer: false,
      type: "VENUE",
      key: "5",
      reference: "byo_alcohol",
      options: [],
    },
    {
      question: "Corkage fee for BYO alcohol", //value being passed
      subtitle: "A corkage fee applies if the customer brings their own alcohol",
      name: "A corkage fee applies if the customer brings their own alcohol", // displayed sentence in filtering
      answer: false,
      type: "VENUE",
      key: "5.1",
      reference: "byo_alcohol",
      options: [],
    },
  ]

  const menuOfferOptions = [
    {
      name: "Multiple vegan options",
    },
    {
      name: "Multiple vegetarian options",
    },
    {
      name: "Halal menu",
    },
    {
      name: "Gluten-free menu",
    },
    {
      name: "Kosher menu",
    },
  ];

  const parkingAccommodationOptions = [
    {
      question: "Free parking on premises",
      answer: false,
      type: "VENUE",
      key: "0",
      reference: "venue_details",
      options: [],
    },
    {
      question: "Free street parking",
      answer: false,
      type: "VENUE",
      key: "1",
      reference: "venue_details",
      options: [],
    },
    {
      question: "Paid parking on premises",
      answer: false,
      max_capacity: null,
      type: "VENUE",
      key: "2",
      reference: "venue_details",
      options: [],
    },
    {
      question: "Paid parking off premises",
      answer: false,
      type: "VENUE",
      key: "3",
      reference: "venue_details",
      options: [],
    },
    // alcoholQuestions
    {
      question: "Accommodation is available on-site",
      answer: false,
      max_capacity: null,
      type: "VENUE",
      key: "4",
      reference: "venue_details",
      options: [],
    },
  
    //authorizeEvents
  
    {
      question: "Popular for promoted and ticketed events",
      answer: false,
      type: "VENUE",
      key: "5",
      reference: "venue_details",
      subtitle:
        "You are frequently hosting promoted and ticketed events for which the organizer can publicly advertise and sell tickets.",
      options: [],
    },
  ]

  const allowdEventsOptions = [
    {
      name: "Customers can enjoy their own music.",
    },
    {
      name: "Customers can bring their own DJ.",
    },
    {
      name: "The space is subject to noise limitations.",
    },
    {
      name: "Wedding License",
    },
  ];

  const ageRequirementItems = [
    { label: "No age policy", option: 1 },
    { label: "Guests under 18 are not allowed", option: 2 },
    {
      label: "Guests under 18 not allowed unless accompanied by an adult",
      option: 3,
    },
    { label: "Guests under 21 are not allowed", option: 4 },
    {
      label: "Guests under 21 not allowed unless accompanied by an adult",
      option: 5,
    },
    { label: "Guests under 25 are not allowed", option: 6 },
  ];

  const searchVenueResult = useState("venuesResult", () => {});
  const specificVenue = useState("specificVenue", () => {});

  const activeVenueId = useState("activeVenueId", () => null);

  return {
    countries,
    venueTypes,
    searchVenueResult,
    specificVenue,
    activeVenueId,
    timeOptionFrom,
    timeOptionTo,
    cateringAndDrinksOptions,
    menuOfferOptions,
    allowdEventsOptions,
    ageRequirementItems,
    tags,
    parkingAccommodationOptions,
  };
};
