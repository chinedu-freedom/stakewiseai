"use client";

import axiosInstance from "./axiosInstance";

export const fetchData = async (endpoint, { signal } = {}) => {
  const { data } = await axiosInstance.get(endpoint, {
    signal,
  });

  return data;
};

export const postData = async (
  endpoint,
  data,
  { isFormData = false } = {}
) => {
  const res = await axiosInstance.post(endpoint, data);
  return res.data;
};

export const patchData = async (
  endpoint,
  data,
  { isFormData = false } = {}
) => {
  const { data: res } = await axiosInstance.patch(
    endpoint,
    data
  );

  return res;
};

export const updateData = async (endpoint, data) => {
  const { data: res } = await axiosInstance.put(endpoint, data);

  return res;
};

export const deleteData = async (endpoint) => {
  const { data } = await axiosInstance.delete(endpoint);

  return data;
};

export const deleteDataWithBody = async (endpoint, body) => {
  const { data } = await axiosInstance.delete(endpoint, {
    data: body,
    withCredentials: true, // ✅ required
  });

  return data;
};

// "use client";

// import axiosInstance from "./axiosInstance";

// // GET request
// // export const fetchData = async (endpoint) => {
// //   const { data } = await axiosInstance.get(endpoint);
// //   return data;
// // };

// export const fetchData = async (endpoint, { signal } = {}) => {
//   const { data } = await axiosInstance.get(endpoint, {
//     signal,
//   });

//   return data;
// };


// // POST request
// // export const postData = async (endpoint, data, isFormData = false) => {
// //   const headers = isFormData
// //     ? { "Content-Type": "multipart/form-data" }
// //     : { "Content-Type": "application/json" };

// //   const { data: res } = await axiosInstance.post(endpoint, data, { headers });
// //   return res;
// // };

// export const postData = async (endpoint, data, isFormData = false) => {
//   const config = isFormData
//     ? {} // Axios will automatically set multipart/form-data + boundary
//     : {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       };

//   const res = await axiosInstance.post(endpoint, data, config);
//   return res.data;
// };

// // PATCH (partial update)
// export const patchData = async (endpoint, data, isFormData = false) => {
//   const config = isFormData
//     ? {}
//     :  {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       };

//   const { data: res } = await axiosInstance.patch(endpoint, data, config );
//   return res;
// };


// // PUT (full update)
// export const updateData = async (endpoint, data) => {
//   const { data: res } = await axiosInstance.put(endpoint, data);
//   return res;
// };

// // // PATCH (partial update)
// // export const patchData = async (endpoint, data) => {
// //   // DO NOT set Content-Type manually — axios will detect FormData
// //   const { data: res } = await axiosInstance.patch(endpoint, data);
// //   return res;
// // };

// // DELETE request
// export const deleteData = async (endpoint) => {
//   const { data } = await axiosInstance.delete(endpoint);
//   return data;
// };

// // DELETE request with body
// export const deleteDataWithBody = async (endpoint, body) => {
//   const { data } = await axiosInstance.delete(endpoint, { data: body });
//   return data;
// };
