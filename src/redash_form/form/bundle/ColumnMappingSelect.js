
import { isString, map, uniq, flatten, filter, sortBy } from "lodash";
import React from "react";
import { Section, Select } from "@redash/viz/lib/components/visualizations/editor";

const MappingTypes = {
    id: { label: "Id Fields", multiple: true },
    version: { label: "Version Field" },
    field: { label: "Editable Fields", multiple: true },
};

export default function ColumnMappingSelect({ value, availableColumns, type, onChange, areAxesSwapped }) {
    const options = sortBy(filter(uniq(flatten([availableColumns, value])), v => isString(v) && v !== ""));
    const { label, multiple } = MappingTypes[type];
  
    return (
      <Section>
        <Select
          label={label}
          data-test={`Form.ColumnMapping.${type}`}
          mode={multiple ? "multiple" : "default"}
          allowClear
          showSearch
          placeholder={multiple ? "Choose columns..." : "Choose column..."}
          value={value || undefined}
          onChange={(column) => onChange(column || null, type)}>
          {map(options, c => (
            <Select.Option key={c} value={c} data-test={`Form.ColumnMapping.${type}.${c}`}>
              {c}
            </Select.Option>
          ))}
        </Select>
      </Section>
    );
  }
  
  ColumnMappingSelect.defaultProps = {
    value: null,
    availableColumns: [],
    type: null,
    onChange: () => {},
  };
  
  ColumnMappingSelect.MappingTypes = MappingTypes;
  