import { map, fromPairs, filter, sortBy, merge, isUndefined, capitalize } from "lodash";
import React, { useMemo, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import Table from "antd/lib/table";
import { sortableElement } from "react-sortable-hoc";
import { SortableContainer } from "@redash/viz/lib/components/sortable";
import { Input, InputNumber, Switch, Select, TextArea } from "@redash/viz/lib/components/visualizations/editor";
import { EditorPropTypes } from "@redash/viz/lib/visualizations/prop-types";
import { getFormProperties } from "./utils";
import { find } from "lodash";

const SortableBodyRow = sortableElement((props) => <tr {...props} />);

function getEditorFields(options, updateFieldsOption, debouncedUpdateFieldsOption) {
    const control_with_rules = [ "input", "inputnumber", "textarea" ];
    const rules_number = [ "", "length", "range", "type", "enum", ];
    const rules_string = [ "", "length", "pattern", "range", "type", ];

    const types_commons = [ "string", "boolean", "method", "array", "object", "date", "url", "hex", "email", "any", ];
    const types_number = [ "number", "integer", "float", ];
    const types_string = merge(types_commons, types_number);

    const ruleControlsMap = {
        enum: (unused, item) => (
            <TextArea
                label="Values (newline delimited)"
                key={`Form.Rules.${item.key}.Enum`}
                data-test={`Form.Rules.${item.key}.Enum`}
                defaultValue={item.validationEnum}
                onChange={ e => debouncedUpdateFieldsOption(item.key, "validationEnum", e.target.value)}/>
        ),
        length: (unused, item) => (
            <InputNumber 
                label="Length"
                key={`Form.Rules.${item.key}.Length`}
                data-test={`Form.Rules.${item.key}.Length`}
                defaultValue={item.validationLength}
                onChange={ length => debouncedUpdateFieldsOption(item.key, "validationLength", length)}/>
        ),
        pattern: (unused, item) => (
            <Input
                label="Regex"
                key={`Form.Rules.${item.key}.Pattern`}
                data-test={`Form.Rules.${item.key}.Pattern`}
                defaultValue={item.validationPattern}
                onChange={ e => debouncedUpdateFieldsOption(item.key, "validationPattern", e.target.value)}/>
        ),
        range:  (unused, item) => (
            <>
                <InputNumber
                    label="Min"
                    data-test={`Form.Rules.${item.key}.RangeMin`}
                    defaultValue={item.validationRangeMin}
                    onChange={ rangMin => debouncedUpdateFieldsOption(item.key, "validationRangeMin", rangMin)}/>
                <InputNumber
                    label="Max"
                    data-test={`Form.Rules.${item.key}.RangeMax`}
                    defaultValue={item.validationRangeMax}
                    onChange={ rangMax => debouncedUpdateFieldsOption(item.key, "validationRangeMax", rangMax)}/>
            </>
        ),
        type: (unused, item) => (
            <Select
                label="Type"
                data-test={`Form.Rules.${item.key}.Type`}
                defaultValue={item.validationType}
                onChange={(type) => updateFieldsOption(item.key, "validationType", type)}>
                {map(sortBy(item.colType === "integer" || item.colType === "float" ? types_number : types_string), type => (
                    <Select.Option key={type} data-test={`Form.Rules.${item.key}.Type.${type}`}>
                        {capitalize(type)}
                    </Select.Option>
                ))}
            </Select>
        ),
    };

    const fields = [
        {
            title: "Label",
            dataIndex: "label",
            render: (unused, item) => (
                <span>
                    {item.label}
                </span>
            ),
        },
        {
            title: "Required",
            dataIndex: "required",
            render: (unused, item) => (
                <Switch
                    data-test={`Form.Rules.${item.key}.Required`}
                    defaultChecked={item.required}
                    onChange={(required) => updateFieldsOption(item.key, "required", required)}>
                </Switch>
            ),
        },
        {
            title: "Validation",
            dataIndex: "Rule",
            render: (obj, item) => find(control_with_rules, c => c === item.editor) ?
            (
                <Select
                    data-test={`Form.Rules.${item.key}.Validation`}
                    defaultValue={item.validation}
                    onChange={(validation) => updateFieldsOption(item.key, "validation", validation)}>
                    {map(sortBy((item.colType === "integer" || item.colType === "float") ? rules_number : rules_string), rule => (
                        <Select.Option key={rule} data-test={`Form.Rules.${item.key}.Ryle.${rule}`}>
                            {capitalize(rule)}
                        </Select.Option>
                    ))}
                </Select>
            ) : (<span></span>),
        },
        {
            title: "Validation Definition",
            dataIndex: "ruleDefinition",
            render: (obj, item) => isUndefined(ruleControlsMap[item.validation]) ? (<span></span>) : ruleControlsMap[item.validation](obj, item),
        },
    ];

    return fields;
}

export default function RuleSettings({ options, data, onOptionsChange }) {
    const fields = useMemo(() => filter(getFormProperties(data.columns, options), prop => prop.type === "field"), 
        [options, data]
    );

    const handleSortEnd = useCallback(
        ({ oldIndex, newIndex }) => {
          const fieldsOptions = [...fields];
          fieldsOptions.splice(newIndex, 0, ...fieldsOptions.splice(oldIndex, 1));
          onOptionsChange({ fieldsOptions: fromPairs(map(fieldsOptions, ({ key }, zIndex) => [key, { zIndex }])) });
        },
        [onOptionsChange, fields]
    );

    const updateFieldsOption = useCallback(
        (key, prop, value) => {
          onOptionsChange({
            fieldsOptions: {
              [key]: {
                [prop]: value,
              },
            },
          });
        },
        [onOptionsChange]
    );

    const [debouncedUpdateFieldsOption] = useDebouncedCallback(updateFieldsOption, 200);

    const columns = useMemo(() => getEditorFields(options, updateFieldsOption, debouncedUpdateFieldsOption), [
        options,
        updateFieldsOption,
        debouncedUpdateFieldsOption,
    ]);

    return (
        <SortableContainer
            axis="y"
            lockAxis="y"
            lockToContainerEdges
            useDragHandle
            helperClass="chart-editor-series-dragged-item"
            helperContainer={(container) => container.querySelector("tbody")}
            onSortEnd={handleSortEnd}
            containerProps={{
                className: "chart-editor-series",
        }}>
            <Table
                dataSource={fields}
                columns={columns}
                components={{
                    body: {
                      row: SortableBodyRow,
                    },
                }}
                onRow={item => ({ index: item.zIndex })}
                pagination={false}
            />
        </SortableContainer>
    );
}

RuleSettings.propTypes = EditorPropTypes;