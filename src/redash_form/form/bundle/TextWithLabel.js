import React from "react";
import { withControlLabel } from "@redash/viz/lib/components/visualizations/editor";
import Typography from "antd/lib/typography";

export function TextControl({ disabled, text, textProps }) {
    return (
        <div {...textProps} className="ant-input w-100" style={{border: "1px solid rgb(0 0 0 / 0%)"}}>
            <Typography.Text>{text}</Typography.Text>
        </div>
    );
}

export const TextWithLabel = withControlLabel(TextControl);