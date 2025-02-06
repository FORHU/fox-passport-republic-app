import countries from '~/data/countries.json'

export default defineNuxtRouteMiddleware((to) => {
  // if path == '/', assign 'sg' only if no saved country in cookie

  const cookie = useCookie("country", {});
  const cookieCountryVal = cookie.value;

  if (to.path == '/'){
    if (!cookieCountryVal){
      cookie.value = "sg"; // Set default country if no country is saved
    }
  } else {
     // assign only the params country if not in path !== '/'
    let paramsCountry = to.params.country as string | undefined;
    if(!paramsCountry) return; // No country in params, exit

    const isValidCountry = countries.some(x => x.code && paramsCountry && x.code?.toLocaleLowerCase() ==  paramsCountry?.toLowerCase());
    const isValidCookieValue =  countries.some(x => x.code && cookieCountryVal &&  x.code?.toLocaleLowerCase() == cookieCountryVal?.toLowerCase());
        
    if(!isValidCountry){
      console.log('country.global.ts running' );
      return navigateTo({
        name: 'country', 
        params: {country: isValidCookieValue ? cookieCountryVal?.toLowerCase() : 'sg'}})
    }
    cookie.value = paramsCountry?.toLowerCase();
  }

  
  
});

