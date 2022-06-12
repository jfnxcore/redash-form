import { default as registeredVisualizations } from "@redash/viz/lib/visualizations/registeredVisualizations";
import Renderer from "./Renderer";
import Editor from "./Editor";

const DEFAULT_OPTIONS = {
    fieldsOptions: {},
    columnMapping: {},
    formatting: {
        date: "YYYY-MM-DD",
        datetime: "YYYY-MM-DD HH:mm:ss",
        number: "0,0[.]00000",
        percent: "0[.]00%",
        currency: "0,0.00$",
        'No Format': undefined,
    },
    queryId: undefined,
    layout: "vertical",
    editMode: true,
    titleIdsVersion: "Ids & Version",
    titleFields: "Fields"
}

const CONFIG = {
    type: "FORM",
    name: "Form",
    getOptions: (options) => ({
        ...DEFAULT_OPTIONS,
        ...options,
    }),
    Renderer,
    Editor,
    defaultColumns: 2,
    defaultRows: 5,
};

registeredVisualizations[CONFIG.type] = CONFIG