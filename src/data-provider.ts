import axios from "axios";
import { DataProvider, HttpError } from "@pankod/refine-core";
import { stringify } from "query-string";

// Error handling with axios interceptors
const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const customError: HttpError = {
      ...error,
      message: error.response?.data?.message,
      statusCode: error.response?.status,
    };

    return Promise.reject(customError);
  }
);

// const apiUrl = `https://api.fake-rest.refine.dev/posts`;
const dataProvider = (apiUrl: string): DataProvider => ({
    const generateFilters = (filters?: CrudFilters) => {
  const queryFilters: { [key: string]: string } = {};

  filters?.map((filter): void => {
    if ("field" in filter) {
      const { field, operator, value } = filter;
      const mappedOperator = mapOperator(operator);
      queryFilters[`${field}${mappedOperator}`] = value;
    }
  }); 

  return queryFilters;
};

  getList: async ({ resource, pagination, sort, filters }) => {
    const url = `${apiUrl}/${resource}`;

    const { current = 1, pageSize = 10 } = pagination ?? {};

    const query: {
      _start?: number;
      _end?: number;
      _sort?: string;
      _order?: string;
    } = {
      _start: (current - 1) * pageSize,
      _end: current * pageSize,
    };

     if (sort && sort.length > 0) {
       query._sort = sort[0].field;
       query._order = sort[0].order;
     }

     
  const queryFilters = generateFilters(filters);
    const { data, headers } = await axiosInstance.get(
      `${url}?${stringify(query)}&${stringify(queryFilters)}`
    );


    const { data, headers } = await axiosInstance.get(url);

    const total = +headers["x-total-count"];

    return {
      data,
      total,
    };
  },
});

export default dataProvider;