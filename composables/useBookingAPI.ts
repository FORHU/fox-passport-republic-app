import { useAPI } from "./useAPI";

export const useBookingAPI = () => {
  async function getBooking(id: string) {
    const params: any = {
      space_id: id,
      limit: 2000,
      status: "CONFIRMED",
    };

    const queryString = new URLSearchParams(params).toString();
    const { data, error }: { data: any; error: any } = await useAPI(
      `v1/bookings?${queryString}`
    );

    if (data.value) {
      return data?.value?.data?.data;
    }
    if (error.value) {
      return error.value.data?.data;
    }
  }

  async function getSpecificBooking(id: string) {
    const params: any = {
      booking_id: id,
    };

    const queryString = new URLSearchParams(params).toString();
    const { data, error }: { data: any; error: any } = await useAPI(
      `v1/bookings?${queryString}`
    );

    if (data.value) {
      return data?.value?.data?.data[0];
    }
    if (error.value) {
      return error.value.data?.data;
    }
  }

  async function checkBookingDate(params: any) {
    const queryString = new URLSearchParams(params).toString();
    const { data, error }: { data: any; error: any } = await useAPI(
      `v1/bookings/existing-booking?${queryString}`
    );

    if (data.value) {
      return data?.value?.message;
    }
    if (error.value) {
      return error.value.data?.data;
    }
  }

  const addBooking = async (payload: any) => {
    return await useAPI(`v1/bookings?`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  };

  const updateBooking = async (payload: any, id: string) => {
    return await useAPI(`v1/bookings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  };

  const deleteBooking = async (id: any) => {
    return await useAPI(`/v1/bookings/${id}`, {
      method: "DELETE",
    });
  };

  return {
    getBooking,
    addBooking,
    checkBookingDate,
    deleteBooking,
    updateBooking,
    getSpecificBooking,
  };
};
