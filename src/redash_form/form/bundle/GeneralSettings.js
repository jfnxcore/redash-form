import React, { useEffect, useMemo } from "react";
import { isArray, map, includes, each, difference, capitalize, size, filter } from "lodash";
import { useDebouncedCallback } from "use-debounce";
import { UpdateOptionsStrategy } from "@redash/viz/lib/components/visualizations/editor/createTabbedEditor";
import { EditorPropTypes } from "@redash/viz/lib/visualizations/prop-types";
import ColumnMappingSelect from "./ColumnMappingSelect";
import { FORM_PROPERTY_TYPES } from "./utils";
import { Section, Select, Switch, Input } from "@redash/viz/lib/components/visualizations/editor";

function getMappedColumns(options, availableColumns) {
    const mappedColumns = {};
    const availableTypes = FORM_PROPERTY_TYPES;

    each(availableTypes, type => {
      mappedColumns[type] = ColumnMappingSelect.MappingTypes[type].multiple ? [] : null;
    });
  
    availableColumns = map(availableColumns, c => c.name);
    const usedColumns = [];
  
    each(options.columnMapping, (type, column) => {
      if (includes(availableColumns, column) && includes(availableTypes, type)) {
        const { multiple } = ColumnMappingSelect.MappingTypes[type];
        if (multiple) {
          mappedColumns[type].push(column);
        } else {
          mappedColumns[type] = column;
        }
        usedColumns.push(column);
      }
    });
  
    return {
      mappedColumns,
      unusedColumns: difference(availableColumns, usedColumns),
    };
}
  
function mappedColumnsToColumnMappings(mappedColumns) {
    const result = {};
    each(mappedColumns, (value, type) => {
      if (isArray(value)) {
        each(value, v => {
          result[v] = type;
        });
      } else {
        if (value) {
          result[value] = type;
        }
      }
    });
    return result;
}

function getQueryAndFormIds() {
  var resource = (window.location.pathname + window.location.hash).replaceAll("#", "/");
  var parts = filter(resource.split("/"), part => /^\d+$/.test(part));
  if(size(parts) === 2 ) {
    return { queryId: parts[0], formId: parts[1] };
  }
  return { queryId: 0, formId: 0 };
}

export default function GeneralSettings({ options, data, onOptionsChange }) {
    const { mappedColumns, unusedColumns } = useMemo(() => getMappedColumns(options, data.columns), [
      options,
      data.columns,
    ]);
    
    function handleColumnMappingChange(column, type) {
        const columnMapping = mappedColumnsToColumnMappings({
          ...mappedColumns,
          [type]: column,
        });
        onOptionsChange({ columnMapping }, UpdateOptionsStrategy.shallowMerge);
    }

    const [debouncedOnOptionsChange] = useDebouncedCallback(onOptionsChange, 200);
    useEffect(() => { 
      debouncedOnOptionsChange(getQueryAndFormIds());
    });

    return (
        <React.Fragment>
            <Section.Title>Form Layout</Section.Title>
            <Section>
              <Select
                label="Controls Layout"
                data-test="Form.Layout.ControlLayout"
                defaultValue={options.layout}
                onChange={(layout) => onOptionsChange({ layout })}>
                {map(["horizontal", "vertical"], layout => (
                    <Select.Option key={layout} data-test={`Form.Layout.ControlLayout.${layout}`}>
                        {capitalize(layout)}
                    </Select.Option>
                ))}
              </Select>
            </Section>
            <Section>
              <Switch
                data-test="Form.Layout.EditMode"
                defaultChecked={options.editMode}
                onChange={(editMode) => onOptionsChange({ editMode: editMode })}>
                Show As Form
              </Switch>
            </Section>
            <Section.Title>Sections Titles</Section.Title>
            <Section>
             <Input
                label={"Title of Ids & Version Section"}
                data-test="Form.Titles.TitleIdsVersion"
                defaultValue={options.titleIdsVersion}
                onChange={(e) => debouncedOnOptionsChange({ titleIdsVersion: e.target.value })}
              />
            </Section>
            <Section>
             <Input
                label={"Title of Fields Section"}
                data-test="Form.Titles.TitleFields"
                defaultValue={options.titleFields}
                onChange={(e) => debouncedOnOptionsChange({ titleFields: e.target.value })}
              />
            </Section>
            <Section.Title>Fields Mapping</Section.Title>
            {map(mappedColumns, (value, type) => (
                <ColumnMappingSelect
                    key={type}
                    type={type}
                    value={value}
                    areAxesSwapped={options.swappedAxes}
                    availableColumns={unusedColumns}
                    onChange={handleColumnMappingChange}
                />
            ))}
            <Section.Title>Service Settings</Section.Title>
            <Section>
             <Input
                label={"Query Id"}
                data-test="Form.Service.QueryId"
                disabled={ true }
                defaultValue={ options.queryId }
                onChange={(e) => debouncedOnOptionsChange({ queryId: e.target.value })}
              />
            </Section>
            <Section>
             <Input
                label={"Form Id"}
                data-test="Form.Service.FormId"
                disabled={ true }
                defaultValue={ options.formId }
                onChange={(e) => debouncedOnOptionsChange({ formId: e.target.value })}
              />
            </Section>
        </React.Fragment>
    )
}

GeneralSettings.propTypes = EditorPropTypes;