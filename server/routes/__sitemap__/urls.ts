
// import { useMostPopular } from "~/composables/useMostPopular";

export default defineSitemapEventHandler(async () => {
  const MAIN_URL = useRuntimeConfig()?.public?.MAIN_URL;
  //  const { getMostPopular} = useMostPopular();
  //  let mostPopularArray = []
 
  //  try {
  //   const  res = await getMostPopular({})
  //   mostPopularArray = res?.data || [];
 
  //  } catch(error) {
  //    console.error("Error fetching most popular data:", error);
  //  }
 
   const urls = [ 
           {
           _path: "/sg/login/user",
             },
             {
               _path: "/sg/login/venue",
                 },
                 {
                   _path: "/sg/signup/user",
                     },
                     {
                       _path: "/sg/signup/user",
                         },
                         {
                           _path: "/sg",
                             }
   ]
 
  //  console.log("Before push:", urls);
  //  urls.push(...mostPopularArray.map((x: Partial<TVenueSpace>) => ({
  //    _path: MAIN_URL + '/sg/venues/' + x?._id,
  //  })));
  //  console.log("After push:", urls);
   
   
 
   return urls.map((url) => ({loc: url._path, lastmod: new Date()}))
});
