import api from "./axios";


// GET ATTACHMENTS
export const getAttachments = async (cardId) => {

  const res = await api.get(`/attachments/cards/${cardId}`);

  return res.data;

};


// UPLOAD ATTACHMENT
export const uploadAttachment = async ({
  cardId,
  file,
}) => {

  const formData = new FormData();

  formData.append("file", file);


  const res = await api.post(

    `/attachments/cards/${cardId}`,

    formData,

    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }

  );


  return res.data;

};


// DELETE ATTACHMENT
export const deleteAttachment = async (attachmentId) => {

  const res = await api.delete(`/attachments/${attachmentId}`);

  return res.data;

};


// SET AS COVER
export const setAttachmentAsCover = async (attachmentId) => {

  const res = await api.patch(
    `/attachments/${attachmentId}/set-cover`
  );

  return res.data;

};