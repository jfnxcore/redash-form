import createTabbedEditor from "@redash/viz/lib/components/visualizations/editor/createTabbedEditor";

import GeneralSettings from "./GeneralSettings";
import EditorSettings from "./EditorSettings";
import RuleSettings from "./RuleSettings";
import FormatSetting from "./FormatSettings";

export default createTabbedEditor([
  { key: "General", title: "General", component: GeneralSettings },
  { key: "Controls", title: "Controls", component: EditorSettings },
  { key: "Rules", title: "Rules", component: RuleSettings },
  { key: "DataFormat", title: "Data Format", component: FormatSetting },
]);