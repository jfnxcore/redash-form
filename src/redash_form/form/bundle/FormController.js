import { axios } from "@/services/axios";

const FormController = {
  save: (context, data) => axios.post(`api/form_resources/${context.formId}/form`, data),
};

export default FormController;