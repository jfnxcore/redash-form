import { filter, includes, isArray, map } from "lodash";
import React, { useMemo } from "react";
import { Select } from "@redash/viz/lib/components/visualizations/editor";

// const allChartTypes = [
//     { type: "ace", name: "Ace", icon: "square-o" },
//     { type: "datetime", name: "datetime", icon: "square-o" },
//     { type: "text", name: "Text", icon: "line-chart" },
//     { type: "textarea", name: "Text Area", icon: "bar-chart" },
//     { type: "email", name: "Email", icon: "area-chart" },
//     { type: "password", name: "Password", icon: "pie-chart" },
//     { type: "number", name: "Number", icon: "circle-o" },
//     { type: "checkbox", name: "Checkbox", icon: "circle-o" },
//     { type: "file", name: "File", icon: "th" },
//     { type: "select", name: "Select", icon: "square-o" },
// ];

const allChartTypes = [
    { type: "input", name: "Input", icon: "circle-o" },
    { type: "inputnumber", name: "Input Number", icon: "circle-o" },
    { type: "checkbox", name: "Checkbox", icon: "circle-o" },
    { type: "datepicker", name: "Date Picker", icon: "circle-o" },
    { type: "switch", name: "Switch", icon: "circle-o" },
];

export default function EditorTypeSelect({ hiddenEditorTypes, ...props }) {
  const chartTypes = useMemo(() => {
    const result = [...allChartTypes];
    if(isArray(hiddenEditorTypes) && hiddenEditorTypes.length > 0) {
        return filter(result, ({ type }) => !includes(hiddenEditorTypes, type));
    }

    return result;
  }, []);

  return (
    <Select {...props}>
      {map(chartTypes, ({ type, name, icon }) => (
        <Select.Option key={type} value={type} data-test={`Form.EditorType.${type}`}>
          <i className={`fa fa-${icon}`} style={{ marginRight: 5 }} />
          {name}
        </Select.Option>
      ))}
    </Select>
  );
}

EditorTypeSelect.defaultProps = {
    hiddenEditorTypes: [],
}