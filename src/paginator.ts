import {AxiosInstance} from "axios";
import getClient from "./utils/client";
import {getQueryString} from "./query";

export const getPaginator = (config: ConfigOptions,
                             baseId: string,
                             tableId: string,
                             query?: QueryObject
) => {
    return {
        eachPage: (page: Page, done?: Done) => {
            const response = getRecords(getClient(config.apiKey, undefined, config.requestTimeout), baseId, tableId, query);
            if (done) {
                response.then((records) => {
                    if (records.offset) {
                        return page(records.records, () => {
                            getPaginator(config, baseId, tableId, {
                                ...query,
                                offset: records.offset
                            }).eachPage(page, done)
                        });
                    }
                    return page(records.records, () => done(null))
                });
            } else {
                return response.then((records) => {
                    if (records.offset) {
                        return page(records.records, () => {
                            getPaginator(config, baseId, tableId, {
                                ...query,
                                offset: records.offset
                            }).eachPage(page)
                        });
                    }
                    return Promise.resolve(null)
                });
            }

        },
        firstPage: (done?: Done) => {
            const response = getRecords(getClient(config.apiKey, undefined, config.requestTimeout), baseId, tableId, query);
            if (done) {
                response.then((records) => {
                    return done(records.records)
                })
            } else {
                return response.then((records) => records.records)
            }
        }
    }
};


const getRecords = (client: AxiosInstance, baseId: string, tableId: string, query?: QueryObject) => {
    return client.get(encodeURI(`/${baseId}/${tableId}${getQueryString(query)}`)).then(resp => {
        return resp.data;
    }).catch((error) => {
        throw error;
    });
};