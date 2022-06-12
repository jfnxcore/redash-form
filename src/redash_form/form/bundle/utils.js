import { capitalize, each, find, isString, sortBy, values } from "lodash";
import moment from "moment";

export const FORM_PROPERTY_TYPES = ["id", "version", "field"];

const columnTypeToEditorMap = {
    integer: "inputnumber",
    float: "inputnumber",
    boolean: "switch",
    string: "input",
    datetime: "datepicker",
    date: "datepicker"
}

const columnTypeToFormatMap = {
    integer: "number",
    float: "number",
    datetime: "datetime",
    date: "date"
}

const columnTypeToParserMap = {
    integer: val => isString(val) ? val.replace(/\$\s?|(,*)/g, '') : val,
    float: val => isString(val) ? val.replace(/\$\s?|(,*)/g, '') : val,
    datetime: toMoment
}

export function getFormProperties(columns, options) {
    const properties = []
    var index = 0;
    each(options.columnMapping, (type, column) => {
        const fieldOptions = options.fieldsOptions[column] || {};
        const col = find(columns, (c) => c.name === column) || {};

        properties.push({ key: column, label: capitalize(column), type: type, colType: col.type, editor: columnTypeToEditorMap[col.type], format: columnTypeToFormatMap[col.type], visible: true, required: false, range: false, zIndex: type === "field" ? index++ : -1, ...fieldOptions, })
    });

    return sortBy(values(properties), ({ zIndex }) => zIndex);
}

export function toMoment(value) {
    if (moment.isMoment(value)) {
        return value;
    }
    if (isFinite(value)) {
        return moment(value);
    }
    // same as default `moment(value)`, but avoid fallback to `new Date()`
    return moment(toString(value), [moment.ISO_8601, moment.RFC_2822]);
}

export function createParserFromColumnType(colType) {
    return columnTypeToParserMap[colType];
}