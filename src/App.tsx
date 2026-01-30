import { useState } from "react";
import { SettingsProvider } from "./context/SettingsContext";
import Layout from "./components/Layout";
import Header from "./components/Header";
import JsonPanelContainer from "./components/JsonPanelContainer";
import SettingsDrawer from "./components/SettingsDrawer";

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <SettingsProvider>
      <Layout>
        <Header onOpenSettings={() => setSettingsOpen(true)} />
        <main className="flex-1 flex flex-col min-h-0 overflow-auto">
          <JsonPanelContainer />
        </main>
        <SettingsDrawer
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
      </Layout>
    </SettingsProvider>
  );
}
