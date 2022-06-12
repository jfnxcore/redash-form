import React, { useMemo, useState } from "react";
import moment from "moment";
import notification from "@/services/notification";
import { RendererPropTypes } from "@redash/viz/lib/visualizations/prop-types";
import { createNumberFormatter } from "@redash/viz/lib/lib/value-format";
import { isArray, isUndefined, size, map, filter } from "lodash";
import { getFormProperties, createParserFromColumnType } from "./utils";
import Divider from "antd/lib/divider";
import Form from "antd/lib/form"
import Input from "antd/lib/input"
import InputNumber from "antd/lib/input-number";
import Typography from "antd/lib/typography";
import Button from "antd/lib/button"
import { Col } from "antd/lib/grid"
import FormController from "./FormController";

function formatDate(value, type, dateTimeFormat) {
  if (type === "datetime" && moment.utc(value).isValid()) {
    value = moment.utc(value);
  }
  if (moment.isMoment(value)) {
    return value.format(dateTimeFormat);
  }
  return "" + value;
}

function createValueFormatter(fieldOptions, options) {
  if (isUndefined(fieldOptions.format) || isUndefined(options.formatting[fieldOptions.format])) {
    return value => !isUndefined(value) ? "" + value : "";
  } else if (fieldOptions.colType === "float" || fieldOptions.colType === "integer") {
    const formatNumber = createNumberFormatter(options.formatting[fieldOptions.format])
    return value => formatNumber(value)
  } else if (fieldOptions.colType === "date" || fieldOptions.colType === "datetime") {
    return value => formatDate(value, fieldOptions.colType, options.formatting[fieldOptions.format])
  }
  return value => "" + value;
}

function createValueParser(fieldOptions, options) {
  if (isUndefined(fieldOptions.format) || isUndefined(options.formatting[fieldOptions.format])) {
    return value => value;
  }
  const parser = createParserFromColumnType(fieldOptions.colType)
  if (isUndefined(parser)) {
    return value => value;
  }
  return value => parser(value)
}

function createInputValidationRules(fieldOptions) {

  const rules = [];
  if (fieldOptions.required) {
    rules.push({ required: fieldOptions.required });
  }

  switch(fieldOptions.validation) {
    case "enum":
      rules.push({ type: "enum", enum: ("" + fieldOptions.validationEnum).split("\n") });
      break;
    case "length":
      rules.push({ type: fieldOptions.colType, len: fieldOptions.validationLength });
      break;
    case "pattern":
      rules.push({ type: "regex", enum: fieldOptions.validationPattern });
      break;
    case "range":
      rules.push({ type: fieldOptions.colType, min: fieldOptions.validationRangeMin, max: fieldOptions.validationRangeMax })
      break;
    case "type":
      rules.push({ type: fieldOptions.validationType });
      break;
    default:
      break;
  }

  return rules;
}

function getEditorControl(key, fieldOptions, options) {
  if (fieldOptions.editor === "colorpicker") {

  } else if (fieldOptions.editor === "datepicker") {

  } else if (fieldOptions.editor === "input") {
    return (
      <Form.Item
        label={fieldOptions.label}
        name={key}
        key={`frm-i-${key}`}
        rules={createInputValidationRules(fieldOptions)}>
        <Input key={key}/>
      </Form.Item>
    )
  } else if (fieldOptions.editor === "inputnumber") {
    const valueFormatter = createValueFormatter(fieldOptions, options)
    const valueParser = createValueParser(fieldOptions, options)
    //https://ant.design/components/form/#Rule
    return (
      <Form.Item
        label={fieldOptions.label}
        name={key}
        key={`frm-i-${key}`}
        rules={createInputValidationRules(fieldOptions)}>
        <InputNumber
          key={key}
          formatter={val => valueFormatter(val)}
          parser={val => valueParser(val)}/>
      </Form.Item>
    )
  } else if (fieldOptions.editor === "switch") {

  }
}

function getTextControl(data, key, fieldOptions, options) {
  const valueFormatter = createValueFormatter(fieldOptions, options)
  return (
    <Form.Item
      label={fieldOptions.label}
      name={key}
      key={`frm-i-${key}`}>
      <div className="ant-input w-100" style={{ border: "1px solid rgb(0 0 0 / 0%)" }}>
        <Typography.Text>{valueFormatter(data[key])}</Typography.Text>
      </div>
    </Form.Item>
  );
}

function initForm(data, options, form, context, onRefresh, setContext) {
    const isInDesign = context.designMode;
    const row = isArray(data.rows) && size(data.rows) > 0 ? data.rows[0] : {};
    const fieldsOptions = getFormProperties(data.columns, options)
    if (isInDesign && context.editMode !== options.editMode) {
      setContext({ 
        useEditButton: !options.editMode,
        editMode: options.editMode, 
        designMode: true,
      });
    }
    const children = []
    const saveDataToBackend = () => {
      FormController.save({ formId: options.formId }, form.getFieldsValue())    
      .then(result => {
        notification.success("Data saved");
        if (!isUndefined(onRefresh)) {
          onRefresh();
        }
        return result;
      })
      .catch(error => {
        notification.error("Data could not be saved");
        return Promise.reject(error);
      });
    };

    if (!context.editMode && context.useEditButton) {
      children.push((
        <Col key="form-buttons" span={24} style={{ textAlign: 'right' }}>
          <Button
            key="button-edit"
            onClick={() => {
              if(!isInDesign) {
                setContext({editMode: true, useEditButton: false, designMode: false});
              }
            }}>
            Edit
          </Button>
        </Col>
      ));
    } else if (context.editMode) {
      children.push((
        <Col key="form-buttons" span={24} style={{ textAlign: 'right' }}>
          <Button 
            key="button-submit" 
            type="primary"
            onClick={ !isInDesign ? saveDataToBackend : () => {} }>
            Save
          </Button>
          <Button
            key="button-reset"
            style={{ margin: '0 8px' }}
            onClick={() => { 
              form.resetFields(); 
              if(!isInDesign) {
                setContext({editMode: false, useEditButton: true, designMode: false});
              }
            }}>
            Reset
          </Button>
        </Col>
      ));
    }

    const idsVersion = map(
      filter(fieldsOptions, field => field.type !== "field" && field.visible),
      (field, index) => getTextControl(row, field.key, field, options)
    );
  
    if (size(idsVersion)) {
      children.push((
        <React.Fragment key="fragment-idsVersion">
          <Divider orientation="left" key="divider-idsVersion">
            <h4>{options.titleIdsVersion}</h4>
          </Divider>
          {idsVersion}
        </React.Fragment>
      ));
    }
  
    const fields = map(
      filter(fieldsOptions, field => field.type === "field"),
      (field, index) => context.editMode ?
        getEditorControl(field.key, field, options) :
        getTextControl(row, field.key, field, options)
    );
  
    if (size(fields)) {
      children.push((
        <React.Fragment key="fragment-fields">
          <Divider orientation="left" key="divider-fields">
            <h4>{options.titleFields}</h4>
          </Divider>
          {fields}
        </React.Fragment>
      ));
    }

    return { row, children };
}

export default function EditorForm({ options, data, onRefresh, onOptionsChange }) {
  const [frm] = Form.useForm();
  const [context, setContext ] = useState({ 
    useEditButton: !options.editMode,
    editMode: options.editMode, 
    designMode: !isUndefined(onOptionsChange),
  });

  const { row, children } = useMemo(
    () => initForm(data, options, frm, context, onRefresh, setContext), 
    [data, options, frm, onRefresh, context]);

  const form = {
    name: "basic",
    layout: options.layout,
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
    autoComplete: "off",
    initialValues: row,
    children: children,
  };

  return (
    <Form {...form} form={frm}/>
  );
};

EditorForm.propTypes = RendererPropTypes;