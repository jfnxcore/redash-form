import React from "react";
import { RendererPropTypes } from "@redash/viz/lib/visualizations/prop-types";
import EditorForm from "./EditorForm";

export default function Renderer({ options, ...props }) {
  return (
    <EditorForm options={options} {...props}/>
  );
}

Renderer.propTypes = RendererPropTypes;