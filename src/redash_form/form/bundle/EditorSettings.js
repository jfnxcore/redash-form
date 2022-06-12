import { map, fromPairs, keys, capitalize } from "lodash";
import React, { useMemo, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import Table from "antd/lib/table";
import Input from "antd/lib/input";
import { sortableElement } from "react-sortable-hoc";
import { SortableContainer, DragHandle } from "@redash/viz/lib/components/sortable";
import { Switch, Select } from "@redash/viz/lib/components/visualizations/editor";
import { EditorPropTypes } from "@redash/viz/lib/visualizations/prop-types";
import EditorTypeSelect from "./EditorTypeSelect";
import { getFormProperties } from "./utils";

const SortableBodyRow = sortableElement((props) => <tr {...props} />);

function getEditorFields(options, updateFieldsOption, debouncedUpdateFieldsOption) {
    const fields = [
        {
            title: "Order",
            dataIndex: "zIndex",
            render: (unused, item) => {
                if (item.type === "field") {
                    return (
                        <span className="series-settings-order">
                            <DragHandle />
                            {item.zIndex + 1}
                        </span>   
                    );
                } else {
                    return (
                        <span>
                            {item.type}
                        </span>   
                    );
                }
            },
        },
        {
            title: "Label",
            dataIndex: "label",
            render: (unused, item) => (
                <Input
                    data-test={`Form.Properties.${item.key}.Label`}
                    placeholder={item.key}
                    defaultValue={item.label}
                    onChange={event => debouncedUpdateFieldsOption(item.key, "label", event.target.value)}
                />
            ),
        },
        {
            title: "Widget",
            dataIndex: "widget",
            render: (unused, item) => {
                if(item.type === "field") {
                    return (
                        <EditorTypeSelect 
                            data-test={`Form.Properties.${item.key}.Editor`}
                            dropdownMatchSelectWidth={false}
                            value={item.editor}
                            hiddenEditorTypes={["foe"]}
                            onChange={(value) => updateFieldsOption(item.key, "editor", value)}
                        />
                    );
                } else {
                    return (
                        <Switch
                            data-test={`Form.Properties.${item.key}.Visible`}
                            defaultChecked={item.visible}
                            onChange={(visible) => updateFieldsOption(item.key, "visible", visible)}>
                            Show
                        </Switch>
                    );
                }
            },
        },
        {
            title: "Format",
            dataIndex: "format",
            render: (unused, item) => (
                <Select
                    data-test={`Form.Properties.${item.key}.Format`}
                    defaultValue={item.format}
                    onChange={(format) => updateFieldsOption(item.key, "format", format)}>
                    {map(keys(options.formatting), fmt => (
                        <Select.Option key={fmt} data-test={`Form.Properties.${item.key}.Format.${fmt}`}>
                            {capitalize(fmt)}
                        </Select.Option>
                    ))}
                </Select>
            ),
        },
    ];

    return fields;
}

export default function EditorSettings({ options, data, onOptionsChange }) {
    const fields = useMemo(() => getFormProperties(data.columns, options), 
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

EditorSettings.propTypes = EditorPropTypes;