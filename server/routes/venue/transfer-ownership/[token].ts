export default defineEventHandler(async (event) => {
  const apiUrl = process.env.API;

  const { token } = event.context.params;

  try {

    const response = await $fetch(
      `${apiUrl}/api/v1/venue/transfer-ownership/accept/existing/${token}`,
      {
        method: "POST",
      }
    );
    return {
      response,
    };
  } catch (error) {
    return {
      error
    }
  }
});
