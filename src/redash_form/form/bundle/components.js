import * as React from "react";
import { withControlLabel } from "@redash/viz/lib/components/visualizations/editor";
import * as Typography from "antd/lib/typography";

export function TextControl({text, labelProps, disabled}) {
    return (
        <Typography.Text disabled={disabled}>{text}</Typography.Text>
    );
}

TextControl.defaultProps = { }

export const TextWithLabel = withControlLabel(TextControl)