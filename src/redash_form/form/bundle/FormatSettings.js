import React from "react";
import { useDebouncedCallback } from "use-debounce";
import { Section, Input, ContextHelp } from "@redash/viz/lib/components/visualizations/editor";
import { EditorPropTypes } from "@redash/viz/lib/visualizations/prop-types";

export default function FormatSettings({ options, data, onOptionsChange }) {
    const [debouncedOnOptionsChange] = useDebouncedCallback(onOptionsChange, 200);

    return (
        <React.Fragment>

            <Section>
                <Input
                    label={
                        <React.Fragment>
                            Date Values Format
                            <ContextHelp.DateTimeFormatSpecs />
                        </React.Fragment>
                    }
                    data-test="Form.Formatting.Date"
                    defaultValue={options.formatting.date}
                    onChange={(e) => debouncedOnOptionsChange({
                        formatting:{
                            date: e.target.value
                        }
                    })}
                />
            </Section>
            <Section>
                <Input
                    label={
                        <React.Fragment>
                            Datetime Values Format
                            <ContextHelp.DateTimeFormatSpecs />
                        </React.Fragment>
                    }
                    data-test="Form.Formatting.Datetime"
                    defaultValue={options.formatting.datetime}
                    onChange={(e) => debouncedOnOptionsChange({
                        formatting:{
                            datetime: e.target.value
                        }
                    })}
                />
            </Section>
            <Section>
                <Input
                    label={
                        <React.Fragment>
                            Number Values Format
                            <ContextHelp.NumberFormatSpecs />
                        </React.Fragment>
                    }
                    data-test="Form.Formatting.Number"
                    defaultValue={options.formatting.number}
                    onChange={(e) => debouncedOnOptionsChange({
                        formatting:{
                            number: e.target.value
                        }
                    })}
                />
            </Section>
            <Section>
                <Input
                    label={
                        <React.Fragment>
                            Percent Values Format
                            <ContextHelp.NumberFormatSpecs />
                        </React.Fragment>
                    }
                    data-test="Form.Formatting.Percent"
                    defaultValue={options.formatting.percent}
                    onChange={(e) => debouncedOnOptionsChange({
                        formatting:{
                            percent: e.target.value
                        }
                    })}
                />
            </Section>
            <Section>
                <Input
                    label={
                        <React.Fragment>
                            Currency Values Format
                            <ContextHelp.NumberFormatSpecs />
                        </React.Fragment>
                    }
                    data-test="Form.Formatting.Currency"
                    defaultValue={options.formatting.currency}
                    onChange={(e) => debouncedOnOptionsChange({
                        formatting:{
                            currency: e.target.value
                        }
                    })}
                />
            </Section>

        </React.Fragment>
    );
}

FormatSettings.propTypes = EditorPropTypes;