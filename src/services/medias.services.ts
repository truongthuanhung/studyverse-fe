import http from './http';

const mediasUrl = '/medias';

export const uploadFiles = (formData: FormData) => {
  return http.post(`${mediasUrl}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
