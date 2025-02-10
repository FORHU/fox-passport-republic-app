export default defineEventHandler(async (event) => {
    const {address} = getQuery(event)
    if (!address) return { res: { error: 'Address not provided' } };
    const formattedAddress = address;
    const config = useRuntimeConfig();
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${formattedAddress}&key=${config.public.GOOGLE_API}`;
    let data;
   try {
    const response = await fetch(url);
    data = await response.json();
   } catch (error) {
    
   }
    return {
      data
    };
  });
  